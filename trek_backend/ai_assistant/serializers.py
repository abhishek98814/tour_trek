from rest_framework import serializers
from .models import Conversation, Message, RetrievedSource, Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class RetrievedSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetrievedSource
        fields = ['id', 'source_type', 'object_id', 'snippet', 'relevance_score']
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    """Full read serializer — used when displaying message history."""
    sources = RetrievedSourceSerializer(many=True, read_only=True)
    feedback = FeedbackSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at', 'sources', 'feedback']
        read_only_fields = ['id', 'role', 'created_at', 'sources', 'feedback']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Used when a user sends a new chat message. Only 'content' is writable."""
    class Meta:
        model = Message
        fields = ['id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return value


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight — for a sidebar/history list of conversations."""
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        last = obj.message.order_by('-created_at').first()
        return last.content[:100] if last else None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Full conversation with its full message history."""
    # message = MessageSerializer(source='message', many=True, read_only=True)
    message = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'message']
        read_only_fields = ['id', 'created_at', 'updated_at', 'message']


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Used to start a new conversation. 'user' comes from the request, not the client."""
    class Meta:
        model = Conversation
        fields = ['id', 'title']
        read_only_fields = ['id']