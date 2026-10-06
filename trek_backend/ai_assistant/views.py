from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from treks.models import Trek


from .models import Conversation, Message, RetrievedSource, TrekDocumentChunk
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    FeedbackSerializer,
)
from .services import (
    generate_assistant_reply,
    get_gear_advice,
    recommend_treks,
    get_safety_advice,
    summarize_reviews,
)
from .pdfingest import extract_and_chunk_pdf


# ---------------------------------------------------------------------------
# Conversational chat (Conversation / Message / RetrievedSource / Feedback)
# ---------------------------------------------------------------------------

class ConversationListCreateView(generics.ListCreateAPIView):
    """
    GET  -> list the current user's conversations (most recently updated first)
    POST -> start a new conversation, optionally with a title
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ConversationCreateSerializer
        return ConversationListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationDetailView(generics.RetrieveAPIView):
    """GET -> a single conversation with its full message history."""
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


class SendMessageView(APIView):
    """
    POST /conversations/<id>/messages/
    Body: {"content": "..."}

    Saves the user's message, calls the AI service for a reply, saves the
    assistant's message + any retrieved sources, and returns both messages.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        conversation = get_object_or_404(Conversation, id=id, user=request.user)

        in_serializer = MessageCreateSerializer(data=request.data)
        in_serializer.is_valid(raise_exception=True)

        user_message = Message.objects.create(
            conversation=conversation,
            role="user",
            content=in_serializer.validated_data["content"],
        )

        if not conversation.title:
            conversation.title = user_message.content[:50]
            conversation.save(update_fields=["title", "updated_at"])
        else:
            conversation.save(update_fields=["updated_at"])

        try:
            reply_text, sources = generate_assistant_reply(conversation, user_message.content)
        # except Exception as exc:
        #     return Response(
        #         {"detail": f"AI service failed: {exc}"},
        #         status=status.HTTP_502_BAD_GATEWAY,
        #     )
        except Exception as exc:
            user_message.delete()
            return Response(
                {"detail": f"AI service failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=reply_text,
        )

        RetrievedSource.objects.bulk_create([
            RetrievedSource(
                message=assistant_message,
                source_type=source.source_type,
                object_id=source.object_id,
                snippet=source.snippet,
                relevance_score=source.relevance_score,
            )
            for source in sources
        ])

        return Response(
            {
                "user_message": MessageSerializer(user_message).data,
                "assistant_message": MessageSerializer(assistant_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


class FeedbackCreateView(generics.CreateAPIView):
    """POST /messages/<message_id>/feedback/ -> {"rating": "up"|"down", "comment": "..."}"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = get_object_or_404(
            Message, id=self.kwargs["message_id"], conversation__user=self.request.user
        )
        serializer.save(message=message)


# ---------------------------------------------------------------------------
# Trek guide PDF upload (admin/guide/agency)
# ---------------------------------------------------------------------------

class TrekGuideUploadView(APIView):
    """
    POST /treks/<slug>/upload-guide/   (multipart/form-data, field name "file")

    Admin/guide/agency uploads a trek brochure/guide PDF. Text is extracted,
    split into chunks, and stored so the AI assistant can retrieve from it.
    Re-uploading replaces the trek's existing chunks.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, slug):
        if request.user.role not in ["guide", "agency", "admin"]:
            return Response(
                {"detail": "Not permitted to upload trek guides."},
                status=status.HTTP_403_FORBIDDEN,
            )

        trek = get_object_or_404(Trek, slug=slug)
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        if not uploaded_file.name.lower().endswith(".pdf"):
            return Response({"detail": "Only PDF files are supported."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chunks = extract_and_chunk_pdf(uploaded_file)
        except Exception as exc:
            return Response(
                {"detail": f"Failed to process PDF: {exc}"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if not chunks:
            return Response(
                {"detail": "No extractable text found in this PDF (it may be scanned images)."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        TrekDocumentChunk.objects.filter(trek=trek).delete()
        TrekDocumentChunk.objects.bulk_create([
            TrekDocumentChunk(
                trek=trek,
                source_file_name=uploaded_file.name,
                chunk_index=i,
                content=chunk,
                uploaded_by=request.user,
            )
            for i, chunk in enumerate(chunks)
        ])

        return Response(
            {"detail": f"Processed '{uploaded_file.name}'.", "chunks_created": len(chunks)},
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Quick one-off assistant endpoints (no conversation history, single-shot)
# ---------------------------------------------------------------------------

class GearAssistantView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = request.data.get("message", "")
        trek_context = request.data.get("trek", "")
        if not user_message:
            return Response({"error": "Message required"}, status=400)
        try:
            reply = get_gear_advice(user_message, trek_context)
            return Response({"reply": reply})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class TrekRecommenderView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        fitness = request.data.get("fitness", "moderate")
        days = request.data.get("days", 7)
        budget = request.data.get("budget", "medium")
        season = request.data.get("season", "autumn")
        experience = request.data.get("experience", "beginner")
        try:
            recommendation = recommend_treks(fitness, days, budget, season, experience)
            return Response({"recommendation": recommendation})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SafetyAdvisorView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        age = request.data.get("age", 25)
        max_altitude = request.data.get("max_altitude", 3000)
        fitness = request.data.get("fitness", "moderate")
        medical = request.data.get("medical_conditions", "none")
        try:
            advice = get_safety_advice(age, max_altitude, fitness, medical)
            return Response({"advice": advice})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ReviewSummarizerView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        reviews_text = request.data.get("reviews", "")
        try:
            summary = summarize_reviews(reviews_text)
            return Response({"summary": summary})
        except Exception as e:
            return Response({"error": str(e)}, status=500)