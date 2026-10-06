


# TrekNepal RAG Integration Roadmap
### AI-powered trek assistant — Django + RAG + Next.js

---

## 0. Project Context

**Stack:** Django (backend, existing) → RAG layer (this doc) → Next.js (frontend, later)

**Existing apps:**
```
account | ai_assistant | banner | booking | gear | manage.py | media | reviews | tour | treks | treknepal
```

**Goal:** Build a complete, working RAG pipeline inside `ai_assistant`, indexing real project data, exposed via a DRF API — ready to plug into Next.js later.

---

## 1. Section Priority Map

| Order | App | Role in RAG | Feature Unlocked |
|---|---|---|---|
| 1 | `treks` / `tour` | Core knowledge base | Conversational trek search, itinerary Q&A, trek comparison |
| 2 | `reviews` | Social proof layer | "What do trekkers say about X?" / auto review summaries |
| 3 | `gear` | Cross-referenced with trek data | AI-generated packing lists |
| 4 | `booking` | Policy/FAQ text only (not live data) | Booking policy Q&A, availability-style questions |
| 5 | `account` | Personalization (v2, later) | "Recommend based on my past bookings" |
| — | `banner` | Not used | Pure marketing content, no retrieval value |

**Build in this exact order.** Each stage is a working milestone on its own — don't wait until everything is indexed to test.

---

## 2. Architecture Overview

```
User Question (Next.js chat UI)
        │
        ▼
   DRF API: /api/ai/chat/
        │
        ▼
   RAGPipeline (ai_assistant/rag/pipeline.py)
        │
        ├─► Retriever ──► ChromaDB (vector store) ──► Embedder (sentence-transformers)
        │
        └─► Generator ──► Claude API ──► Prompt Template (ai_assistant/prompts/templates.py)
        │
        ▼
   JSON Response { answer, sources }
```

**Key principle:** Data → Embeddings → Vector Store → Retrieve top-k → Inject into Prompt → LLM generates grounded answer.

---

## 3. Folder Structure

```
ai_assistant/
├── management/
│   └── commands/
│       └── build_vectorstore.py
├── prompts/
│   ├── __init__.py
│   └── templates.py
├── rag/
│   ├── __init__.py
│   ├── embedder.py
│   ├── retriever.py
│   ├── generator.py
│   └── pipeline.py
├── serializers.py
├── views.py
├── urls.py
└── chroma_db/          # auto-generated, add to .gitignore
```

---

## 4. Setup

```bash
pip install chromadb sentence-transformers anthropic djangorestframework python-dotenv
pip freeze > requirements.txt
```

`.env` (add to `.gitignore`):
```
ANTHROPIC_API_KEY=your_key_here
```

`treknepal/settings.py`:
```python
import os
from dotenv import load_dotenv
load_dotenv()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
CHROMA_DB_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
RAG_TOP_K = 4
```

---

## 5. Milestone 1 — Core Trek Knowledge Base (`treks` / `tour`)

**Goal:** Ship a working "ask about treks" chatbot on trek/tour data alone.

### Checklist
- [ ] Confirm actual model + field names in `treks`/`tour` (name, description, difficulty, duration, altitude, season, price, itinerary)
- [ ] Build `Embedder` (singleton, loads model once)
- [ ] Build `Retriever` (Chroma add/query/reset)
- [ ] Write `SYSTEM_PROMPT` + `RAG_QA_TEMPLATE`
- [ ] Build `Generator` (Claude API wrapper)
- [ ] Build `RAGPipeline` (ties retriever + prompt + generator)
- [ ] Write `build_vectorstore` command, index only `treks`/`tour` first
- [ ] Expose `ChatView` via DRF at `/api/ai/chat/`
- [ ] Test with `curl` — "Suggest a beginner trek in October"

**Definition of done:** You can `curl` a trek-related question and get a grounded answer referencing real trek data.

---

## 6. Milestone 2 — Add Reviews

**Goal:** Answers get richer, backed by real trekker experiences.

### Checklist
- [ ] Confirm `Review` model fields (trek FK, comment, rating)
- [ ] Extend `build_vectorstore.py` to index reviews as separate documents, tagged `metadata={"type": "review", "trek_id": ...}`
- [ ] Add `REVIEW_SUMMARY_TEMPLATE` prompt for a dedicated "summarize reviews" feature
- [ ] Re-run `build_vectorstore --reset`
- [ ] Test: "What do people say about EBC in peak season?"

**Definition of done:** Chatbot can answer questions that require review content, not just trek metadata.

---

## 7. Milestone 3 — Add Gear (Packing List Feature)

**Goal:** Cross-reference trek difficulty/season with gear catalog to generate packing lists.

### Checklist
- [ ] Confirm `Gear` model fields (name, category, description)
- [ ] Extend `build_vectorstore.py` to index gear items
- [ ] Add `PACKING_LIST_TEMPLATE` prompt
- [ ] Add a dedicated endpoint or pipeline method: `pipeline.packing_list(trek_name)`
- [ ] Test: "What should I pack for Annapurna in December?"

**Definition of done:** A working packing-list generator scoped to a specific trek + season.

---

## 8. Milestone 4 — Booking Policy Q&A

**Goal:** Handle booking-related questions using policy/FAQ text (not live availability data — that stays a real API call, not RAG).

### Checklist
- [ ] Write a small set of policy documents (cancellation policy, group size rules, deposit terms) as plain text/markdown
- [ ] Index these as a separate document type (`metadata={"type": "policy"}`)
- [ ] Test: "Can I get a refund if I cancel 3 days before departure?"
- [ ] **Important:** For actual live availability/booking actions, don't rely on RAG — call your real `booking` app APIs directly. RAG is for explaining policy, not executing bookings.

**Definition of done:** Chatbot correctly answers policy questions and clearly hands off booking actions to the real booking flow (don't let it "hallucinate" a booking).

---

## 9. Milestone 5 — Personalization (v2, later)

**Goal:** Use `account`/booking history to tailor recommendations.

### Checklist (later, not blocking)
- [ ] Pass authenticated user's past bookings into the prompt as extra context
- [ ] Add a "recommend next trek for me" feature
- [ ] Consider access control — this endpoint needs auth, unlike the general chatbot

---

## 10. Maintenance & Ops (ongoing, not a milestone)

- [ ] Re-run `build_vectorstore --reset` whenever trek/review/gear data changes (cron job, Django signal on `post_save`, or manual trigger from admin)
- [ ] Add `django-cors-headers`, configure allowed origins for Next.js dev/prod
- [ ] Add rate-limiting to `/api/ai/chat/` before going public (DRF throttling)
- [ ] Consider streaming responses (SSE) for a typing-effect chat UI in Next.js
- [ ] Move `chroma_db/` to a persistent volume in production (not ephemeral disk)
- [ ] `.gitignore`: `chroma_db/`, `.env`

---

## 11. Testing Commands Reference

```bash
# Build/rebuild vector store
python manage.py build_vectorstore --reset

# Run server
python manage.py runserver

# Test chat endpoint
curl -X POST http://localhost:8000/api/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Suggest a trek for a beginner in October"}'
```

---

## 12. What NOT to RAG-ify

- **`banner`** — pure marketing content, no query value.
- **Live booking actions** (availability, payment) — these must go through real transactional APIs, never through the LLM. RAG explains; it doesn't execute.
- **Auth/account data** — not retrieval content; only use as *context*, later, for personalization — never index it into the shared vector store.

---

## 13. Suggested Build Order Summary

```
1. treks/tour        → core chatbot (MVP, ship this first)
2. reviews            → richer, experience-grounded answers
3. gear               → packing list feature
4. booking (policy)   → FAQ handling
5. account            → personalization (v2)
```

Each milestone is independently testable and demo-able — you don't need to finish all five before you have something working end-to-end with Next.js.

---

### Next steps once this is done
- Wire CORS + auth for Next.js
- Build the Next.js chat UI (streaming or plain fetch)
- Decide on deployment: where does `chroma_db/` live in production (persistent volume, or migrate to pgvector for a cleaner single-DB setup)# tour_trek
