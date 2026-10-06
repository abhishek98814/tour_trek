"""
ai_assistant/services.py

  - retrieve_context()          -> keyword search over Trek fields + uploaded guide chunks
  - generate_assistant_reply()  -> full RAG chat reply (used by SendMessageView)
  - get_gear_advice(), recommend_treks(), get_safety_advice(), summarize_reviews(),
    generate_trek_description() -> lightweight one-off helpers

Requires:
    pip install mistralai

Settings needed (settings.py):
    MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
"""

import re
import json
from dataclasses import dataclass

from django.conf import settings
from django.db.models import Q

from mistralai import Mistral

from treks.models import Trek
from .models import TrekDocumentChunk


client = Mistral(api_key=settings.MISTRAL_API_KEY)

# Check https://docs.mistral.ai/getting-started/models/ for current model options.
MODEL_NAME = "mistral-small-2506"

STOPWORDS = {
    "a", "an", "the", "is", "are", "of", "to", "for", "in", "on", "and",
    "what", "which", "how", "do", "does", "i", "me", "my", "can", "you",
}

SYSTEM_PROMPT = """You are an expert Nepal trekking assistant for Trek Nepal platform.
Help users with gear, difficulty, seasons, altitude sickness, permits and budget.
Keep answers concise and specific to Nepal trekking. Always mention safety."""


@dataclass
class RetrievedContext:
    source_type: str
    object_id: str
    snippet: str
    relevance_score: float


def _keywords(text: str):
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 2]


def _call_mistral(system: str, user: str, max_tokens: int = 500) -> str:
    response = client.chat.complete(
        model=MODEL_NAME,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return response.choices[0].message.content


# ---------------------------------------------------------------------------
# RAG retrieval + full conversational chat
# ---------------------------------------------------------------------------

def retrieve_context(query: str, top_k: int = 5) -> list[RetrievedContext]:
    """
    Keyword-overlap retrieval over structured Trek fields AND admin-uploaded
    guide PDF chunks. Swap for embeddings-based search later without changing
    any calling code — this function's return shape is the contract.
    """
    terms = _keywords(query)
    if not terms:
        return []

    scored = []

    # --- structured Trek fields ---
    q = Q()
    for term in terms:
        q |= (
            Q(title__icontains=term)
            | Q(description__icontains=term)
            | Q(region__icontains=term)
            | Q(permit_info__icontains=term)
            | Q(gear_list__icontains=term)
        )
    trek_candidates = Trek.objects.filter(q, status="active").distinct()[:50]

    for trek in trek_candidates:
        haystack = " ".join([
            trek.title or "", trek.description or "", trek.region or "",
            trek.permit_info or "", trek.gear_list or "",
        ]).lower()
        score = sum(haystack.count(term) for term in terms)
        if score == 0:
            continue
        snippet = (trek.description or "")[:300].strip()
        scored.append(RetrievedContext(
            source_type="trek",
            object_id=str(trek.id),
            snippet=f"{trek.title}: {snippet}",
            relevance_score=float(score),
        ))

    # --- uploaded guide PDF chunks (runs once, NOT nested inside the trek loop) ---
    q_chunks = Q()
    for term in terms:
        q_chunks |= Q(content__icontains=term)
    chunk_candidates = TrekDocumentChunk.objects.select_related("trek").filter(
        q_chunks, trek__status="active"
    )[:50]

    for chunk in chunk_candidates:
        haystack = chunk.content.lower()
        score = sum(haystack.count(term) for term in terms)
        if score == 0:
            continue
        scored.append(RetrievedContext(
            source_type="guide",
            object_id=str(chunk.trek_id),
            snippet=f"{chunk.trek.title} (guide): {chunk.content[:300].strip()}",
            relevance_score=float(score),
        ))

    scored.sort(key=lambda c: c.relevance_score, reverse=True)
    return scored[:top_k]


def _build_system_prompt(context: list[RetrievedContext]) -> str:
    if not context:
        return (
            "You are a helpful trekking assistant for a trek booking website. "
            "No specific trek data was found for this question — answer generally "
            "and suggest the user browse available treks, or say you don't have "
            "enough information rather than inventing trek-specific details."
        )

    context_block = "\n\n".join(
        f"[{c.source_type}#{c.object_id}] {c.snippet}" for c in context
    )
    return (
        "You are a helpful trekking assistant for a trek booking website. "
        "Answer the user's question using the context below when relevant. "
        "If the context doesn't cover the question, say so honestly instead "
        "of making details up (prices, permits, dates, altitudes, etc. must "
        "come from the context, not be guessed).\n\n"
        f"Context:\n{context_block}"
    )


def generate_assistant_reply(conversation, user_message_content: str):
    """
    conversation: a Conversation instance (its message history is used for context)
    user_message_content: the latest user message (not yet saved when this is called)

    Returns: (reply_text: str, sources: list[RetrievedContext])
    """
    context = retrieve_context(user_message_content)
    system_prompt = _build_system_prompt(context)

    history = list(
        conversation.message.order_by("created_at").values("role", "content")
    )
    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": user_message_content})

    response = client.chat.complete(
        model=MODEL_NAME,
        messages=messages,
    )
    reply_text = response.choices[0].message.content

    return reply_text, context


# ---------------------------------------------------------------------------
# Lightweight one-off helpers (used by the "quick assistant" views)
# ---------------------------------------------------------------------------

def get_gear_advice(user_message: str, trek_context: str = "") -> str:
    context = f"\nUser is asking about: {trek_context}." if trek_context else ""
    return _call_mistral(SYSTEM_PROMPT + context, user_message, max_tokens=500)


def recommend_treks(fitness: str, days, budget: str, season: str, experience: str) -> str:
    treks = Trek.objects.filter(status="active").values(
        "title", "difficulty", "duration_days", "price_per_person", "region", "max_altitude"
    )
    trek_list = "\n".join(
        f"- {t['title']}: {t['difficulty']}, {t['duration_days']} days, "
        f"${t['price_per_person']}, {t['region']}, {t['max_altitude']}m"
        for t in treks
    )
    prompt = f"""
User: fitness={fitness}, days={days}, budget={budget}, season={season}, experience={experience}

Available treks:
{trek_list}

Recommend top 3 treks. Format: Trek Name | Why it matches | One tip
"""
    return _call_mistral(SYSTEM_PROMPT, prompt, max_tokens=600)


def get_safety_advice(age, max_altitude, fitness: str, medical: str = "none") -> str:
    prompt = f"""
Trekker: age={age}, altitude={max_altitude}m, fitness={fitness}, medical={medical}
Give: 1) Risk level 2) Top 3 safety tips 3) Red flags. Under 150 words.
"""
    return _call_mistral("You are a Himalayan trekking safety expert.", prompt, max_tokens=300)


def generate_trek_description(facts: dict) -> dict:
    """
    facts: dict of known trek attributes, e.g.
        {
            "title": "Everest Base Camp Trek", "region": "Khumbu, Nepal",
            "difficulty": "difficult", "duration_days": 14, "max_altitude": 5364,
            "start_point": "Lukla", "end_point": "Lukla", "best_season": "autumn",
            "key_points": "views of Everest, Sherpa villages, Tengboche monastery",
        }

    Returns: {"description": str, "highlight": str}
    Draft only — never auto-saved. The admin reviews/edits before PATCHing
    the Trek via the normal trek endpoints.
    """
    facts_block = "\n".join(f"- {k}: {v}" for k, v in facts.items() if v)

    prompt = f"""
Write marketing copy for a Nepal trek listing based on these facts:
{facts_block}

Return ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{{"description": "<3-4 sentence engaging description, factually consistent with the facts above, no invented prices/dates/permits>", "highlight": "<one punchy 1-sentence highlight/tagline>"}}
"""
    raw = _call_mistral(
        "You are a travel copywriter for a Nepal trekking company. "
        "You only use the facts given to you — never invent altitudes, prices, "
        "durations, or permit details that weren't provided.",
        prompt,
        max_tokens=400,
    )

    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        parsed = {"description": raw.strip(), "highlight": ""}

    return {
        "description": parsed.get("description", "").strip(),
        "highlight": parsed.get("highlight", "").strip(),
    }


def summarize_reviews(reviews_text: str) -> str:
    if not reviews_text:
        return "No reviews yet."
    prompt = f"""
Summarize in 3 sentences: 1) Overall experience 2) What people loved 3) Warnings

Reviews: {reviews_text[:2000]}
"""
    return _call_mistral("You summarize trekking reviews concisely.", prompt, max_tokens=300)