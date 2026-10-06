from django.contrib import admin
from .models import Conversation, Message, RetrievedSource, Feedback


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ["role", "content", "created_at"]


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "created_at", "updated_at"]
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["conversation", "role", "short_content", "created_at"]

    def short_content(self, obj):
        return obj.content[:60]


@admin.register(RetrievedSource)
class RetrievedSourceAdmin(admin.ModelAdmin):
    list_display = ["message", "source_type", "object_id", "relevance_score"]


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["message", "rating", "created_at"]