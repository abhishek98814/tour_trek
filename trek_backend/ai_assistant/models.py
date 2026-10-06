from django.db import models
from django.conf import settings
import uuid


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="conversation",
        help_text="Null if guest/anonymous user"
    )
    title = models.CharField(max_length=255, blank=True, help_text="Auto-generated from first question")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title or f"Conversation {self.id}"


class Message(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="message"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField(help_text="The actual message text")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"


class RetrievedSource(models.Model):
    SOURCE_TYPE_CHOICES = [
        ("trek", "Trek"),
        ("review", "Review"),
        ("gear", "Gear"),
        ("policy", "Booking_Policy"),
        ("guide", "Trek Guide Document"),
    ]

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="sources"
    )
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    object_id = models.CharField(max_length=50, help_text="ID of the Trek/Review/Gear this came from")
    snippet = models.TextField(help_text="The actual text chunk that was retrieved")
    relevance_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.source_type} #{self.object_id}"


class Feedback(models.Model):
    RATING_CHOICES = [
        ("up", "Helpful"),
        ("down", "Not Helpful"),
    ]

    message = models.OneToOneField(
        Message,
        on_delete=models.CASCADE,
        related_name="feedback"
    )
    rating = models.CharField(max_length=10, choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} on message {self.message_id}"


class TrekDocumentChunk(models.Model):
    """
    A chunk of text extracted from an admin-uploaded trek guide/brochure PDF.
    Used as retrievable context for the AI assistant (RAG), separate from the
    structured Trek fields.
    """
    trek = models.ForeignKey(
        'treks.Trek',  
        on_delete=models.CASCADE,
        related_name='guide_chunks',
    )
    source_file_name = models.CharField(max_length=255)
    chunk_index = models.PositiveIntegerField(help_text="Order of this chunk within the document")
    content = models.TextField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['trek', 'chunk_index']

    def __str__(self):
        return f"{self.trek.title} chunk {self.chunk_index} ({self.source_file_name})"