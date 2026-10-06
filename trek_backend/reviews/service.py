import json

from reviews.models import Review, ReviewAnalysis  


def _get_reviews_for_object(review_type: str, object_id: int):
    if review_type not in dict(Review.REVIEW_TYPE_CHOICES):
        raise ValueError(f"Unknown review_type: {review_type}")

    field_name = f"{review_type}_id"
    return Review.objects.filter(**{"review_type": review_type, field_name: object_id})


def analyze_reviews_for_object(review_type: str, object_id: int, force: bool = False) -> ReviewAnalysis:
    """
    Returns a ReviewAnalysis for the given object, generating (or regenerating)
    it via Mistral if it doesn't exist yet, is stale, or force=True.
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

    from .services import _call_mistral  # reuse your existing Mistral wrapper

    raw = _call_mistral(system_prompt, user_prompt, max_tokens=500)

    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, AttributeError):
        # Mistral didn't return clean JSON — fall back to storing it as a plain summary
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