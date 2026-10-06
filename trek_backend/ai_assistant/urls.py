from django.urls import path
from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    SendMessageView,
    FeedbackCreateView,
    TrekGuideUploadView,
    GearAssistantView,
    TrekRecommenderView,
    SafetyAdvisorView,
    ReviewSummarizerView,
)

app_name = "ai_assistant"

urlpatterns = [

    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("conversations/<uuid:id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<uuid:id>/messages/", SendMessageView.as_view(), name="send-message"),
    path("messages/<int:message_id>/feedback/", FeedbackCreateView.as_view(), name="message-feedback"),

  
    path("treks/<slug:slug>/upload-guide/", TrekGuideUploadView.as_view(), name="trek-guide-upload"),

    path("gear-assistant/", GearAssistantView.as_view(), name="gear-assistant"),
    path("recommend/", TrekRecommenderView.as_view(), name="trek-recommend"),
    path("safety-advice/", SafetyAdvisorView.as_view(), name="safety-advice"),
    path("summarize-reviews/", ReviewSummarizerView.as_view(), name="summarize-reviews"),
]