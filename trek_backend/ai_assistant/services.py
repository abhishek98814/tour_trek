"""
ai_assistant/services.py

  - retrieve_context()          -> keyword search over Trek fields + uploaded guide chunks
  - generate_assistant_reply()  -> full RAG chat reply (used by SendMessageView)
  - get_gear_advice(), recommend_treks(), get_safety_advice(), summarize_reviews()
    -> lightweight one-off helpers (used by the "quick assistant" views)

Runs on a local Ollama model. No API key needed.

Requires:
    pip install requests
    ollama pull llama3.2:3b
"""

import json
import re
from dataclasses import dataclass

import requests
from django.db.models import Q

from treks.models import Trek  # adjust import path if your app is named differently
from reviews.models import Review, ReviewAnalysis
from .models import TrekDocumentChunk


# OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_URL = "http://ollama:11434/api/chat"
OLLAMA_MODEL = "llama3.2:3b"   
MAX_HISTORY = 8               

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


def _chat(messages: list[dict], max_tokens: int = 500) -> str:
    """Send a chat to the local Ollama server and return the reply text."""
    try:
        resp = requests.post(
            OLLAMA_URL,
            # json={
            #     "model": OLLAMA_MODEL,
            #     "messages": messages,
            #     "stream": False,
            #     "options": {"num_predict": max_tokens},
            # },

            json={
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "keep_alive": "30m",
                "options": {"num_predict": max_tokens},
            },

            
            timeout=180,
        )
        resp.raise_for_status()
    except requests.ConnectionError:
        raise RuntimeError(
            "Cannot reach Ollama at localhost:11434. Run: sudo systemctl start ollama"
        )
    except requests.HTTPError as exc:
        raise RuntimeError(f"Ollama error: {exc.response.text}")
    return resp.json()["message"]["content"]


def _call_mistral(system: str, user: str, max_tokens: int = 500) -> str:
    # name kept so all the helpers below keep working; it now uses Ollama
    return _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=max_tokens,
    )


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

    # newest N messages, put back in chronological order
    # recent = list(
    #     conversation.message.order_by("-created_at").values("role", "content")[:MAX_HISTORY]
    # )[::-1]

        # newest messages first; drop the just-saved user message (it's appended below)
    recent = list(
        conversation.message.order_by("-created_at").values("role", "content")[:MAX_HISTORY + 1]
    )
    if recent and recent[0]["role"] == "user" and recent[0]["content"] == user_message_content:
        recent = recent[1:]
    recent = recent[:MAX_HISTORY][::-1]


    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m["role"], "content": m["content"]} for m in recent]
    messages.append({"role": "user", "content": user_message_content})

    reply_text = _chat(messages, max_tokens=500)
    return reply_text, context


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


def summarize_reviews(reviews_text: str) -> str:
    if not reviews_text:
        return "No reviews yet."
    prompt = f"""
Summarize in 3 sentences: 1) Overall experience 2) What people loved 3) Warnings

Reviews: {reviews_text[:2000]}
"""
    return _call_mistral("You summarize trekking reviews concisely.", prompt, max_tokens=300)


def _get_reviews_for_object(review_type: str, object_id: int):
    if review_type not in dict(Review.REVIEW_TYPE_CHOICES):
        raise ValueError(f"Unknown review_type: {review_type}")

    field_name = f"{review_type}_id"
    return Review.objects.filter(**{"review_type": review_type, field_name: object_id})


def analyze_reviews_for_object(review_type: str, object_id: int, force: bool = False) -> ReviewAnalysis:
    """
    Returns a ReviewAnalysis for the given object, generating (or regenerating)
    it via the local model if it doesn't exist yet, is stale, or force=True.
    """
    reviews = _get_reviews_for_object(review_type, object_id)
    count = reviews.count()

    analysis, created = ReviewAnalysis.objects.get_or_create(
        review_type=review_type, object_id=object_id
    )

    if not force and not created and not analysis.is_stale:
        return analysis

    if count == 0:
        analysis.summary = "No reviews yet."
        analysis.sentiment = ""
        analysis.pros = []
        analysis.cons = []
        analysis.recommendation = ""
        analysis.review_count_at_analysis = 0
        analysis.average_rating_at_analysis = None
        analysis.save()
        return analysis

    ratings = [r.rating for r in reviews]
    avg_rating = sum(ratings) / len(ratings)

    review_lines = []
    for r in reviews.order_by('-created_at')[:60]:
        review_lines.append(f"[{r.rating}★] {r.title}: {r.comment[:500]}")
    reviews_text = "\n\n".join(review_lines)

    system_prompt = (
        "You analyze user reviews for a Nepal trekking/tour platform. "
        "Respond ONLY with valid JSON, no markdown fences, no preamble, "
        "matching exactly this shape:\n"
        '{"sentiment": "positive|mixed|negative", '
        '"summary": "2-3 sentence overview", '
        '"pros": ["short phrase", ...], '
        '"cons": ["short phrase", ...], '
        '"recommendation": "one sentence takeaway for a prospective booker"}'
    )
    user_prompt = (
        f"Average rating: {avg_rating:.1f}/5 across {count} reviews.\n\n"
        f"Reviews:\n{reviews_text}"
    )

    raw = _call_mistral(system_prompt, user_prompt, max_tokens=500)

    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, AttributeError):
        parsed = {
            "sentiment": "",
            "summary": raw.strip(),
            "pros": [],
            "cons": [],
            "recommendation": "",
        }

    analysis.summary = parsed.get("summary", "")
    analysis.sentiment = parsed.get("sentiment", "")
    analysis.pros = parsed.get("pros", [])
    analysis.cons = parsed.get("cons", [])
    analysis.recommendation = parsed.get("recommendation", "")
    analysis.review_count_at_analysis = count
    analysis.average_rating_at_analysis = avg_rating
    analysis.save()

    return analysis