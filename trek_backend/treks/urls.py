from django.urls import path
from .views import (
    TrekListView, TrekDetailView, TrekCreateView,
    TrekUpdateDeleteView, MyTrekListView, TrekImageUploadView,
    TrekItineraryView, TrekAvailabilityView,
    CategoryListView, FeaturedTrekView, AdminTrekListView, TrekReviewView, TrekReviewSummaryView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', TrekListView.as_view(), name='trek-list'),
    path('create/', TrekCreateView.as_view(), name='trek-create'),
    path('featured/', FeaturedTrekView.as_view(), name='trek-featured'),
    path('my-treks/', MyTrekListView.as_view(), name='my-treks'),
    path("admin/treks/", AdminTrekListView.as_view(), name="admin-treks"),
    path('<slug:slug>/', TrekDetailView.as_view(), name='trek-detail'),
    path('<slug:slug>/edit/', TrekUpdateDeleteView.as_view(), name='trek-edit'),
    path('<slug:slug>/images/', TrekImageUploadView.as_view(), name='trek-images'),
    path('<slug:slug>/itinerary/', TrekItineraryView.as_view(), name='trek-itinerary'),
    path('<slug:slug>/availability/', TrekAvailabilityView.as_view(), name='trek-availability'),
    path('<slug:slug>/reviews/', TrekReviewView.as_view(), name='trek-reviews'),
    path('<slug:slug>/generate-review-summary/', TrekReviewSummaryView.as_view(), name='trek-review-summary'),
]