from django.urls import path
from .views import (
    TourListView, TourDetailView, TourCreateView,
    TourUpdateDeleteView, MyTourListView, FeaturedTourView,
    TourImageUploadView, TourItineraryView, TourAvailabilityView,
    TourCategoryListView, TourGuideListView,
    TourGuideDetailView, TourGuideCreateView
)

urlpatterns = [
    # Categories
    path('categories/', TourCategoryListView.as_view(), name='tour-category-list'),

    # Tours
    path('', TourListView.as_view(), name='tour-list'),
    path('create/', TourCreateView.as_view(), name='tour-create'),
    path('featured/', FeaturedTourView.as_view(), name='tour-featured'),
    path('my-tours/', MyTourListView.as_view(), name='my-tours'),
    path('<slug:slug>/', TourDetailView.as_view(), name='tour-detail'),
    path('<slug:slug>/edit/', TourUpdateDeleteView.as_view(), name='tour-edit'),

    # Images
    path('<slug:slug>/images/', TourImageUploadView.as_view(), name='tour-images'),

    # Itinerary
    path('<slug:slug>/itinerary/', TourItineraryView.as_view(), name='tour-itinerary'),

    # Availability
    path('<slug:slug>/availability/', TourAvailabilityView.as_view(), name='tour-availability'),

    # Guides
    path('guides/', TourGuideListView.as_view(), name='guide-list'),
    path('guides/<int:pk>/', TourGuideDetailView.as_view(), name='guide-detail'),
    path('guides/register/', TourGuideCreateView.as_view(), name='guide-register'),
]