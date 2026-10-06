from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Tour, TourCategory, TourImage, TourItinerary, TourAvailability, TourGuide
from .serializers import (
    TourListSerializer, TourDetailSerializer, TourCreateUpdateSerializer,
    TourCategorySerializer, TourImageSerializer,
    TourItinerarySerializer, TourAvailabilitySerializer, TourGuideSerializer
)


class IsGuideOrAgencyOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['guide', 'agency', 'admin']


# --- Category Views ---
class TourCategoryListView(generics.ListCreateAPIView):
    queryset = TourCategory.objects.all()
    serializer_class = TourCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- Tour Views ---
class TourListView(generics.ListAPIView):
    queryset = Tour.objects.filter(status='active').select_related(
        'category', 'created_by').prefetch_related('images')
    serializer_class = TourListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'best_season', 'region',
                        'tour_type', 'is_featured', 'guide_included',
                        'transport_included', 'meals_included']
    search_fields = ['title', 'description', 'destination', 'region']
    ordering_fields = ['price_per_person', 'duration_days',
                       'average_rating', 'created_at']


class TourDetailView(generics.RetrieveAPIView):
    queryset = Tour.objects.filter(status='active')
    serializer_class = TourDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class TourCreateView(generics.CreateAPIView):
    serializer_class = TourCreateUpdateSerializer
    permission_classes = [IsGuideOrAgencyOrAdmin]


class TourUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TourCreateUpdateSerializer
    permission_classes = [IsGuideOrAgencyOrAdmin]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Tour.objects.all()
        return Tour.objects.filter(created_by=user)


class MyTourListView(generics.ListAPIView):
    serializer_class = TourListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tour.objects.filter(created_by=self.request.user)


class FeaturedTourView(generics.ListAPIView):
    queryset = Tour.objects.filter(status='active', is_featured=True)
    serializer_class = TourListSerializer
    permission_classes = [permissions.AllowAny]


# --- Tour Image Views ---
class TourImageUploadView(generics.CreateAPIView):
    serializer_class = TourImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        tour = get_object_or_404(Tour, slug=self.kwargs['slug'])
        serializer.save(tour=tour)


# --- Itinerary Views ---
class TourItineraryView(generics.ListCreateAPIView):
    serializer_class = TourItinerarySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        tour = get_object_or_404(Tour, slug=self.kwargs['slug'])
        return TourItinerary.objects.filter(tour=tour)

    def perform_create(self, serializer):
        tour = get_object_or_404(Tour, slug=self.kwargs['slug'])
        serializer.save(tour=tour)


# --- Availability Views ---
class TourAvailabilityView(generics.ListCreateAPIView):
    serializer_class = TourAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        tour = get_object_or_404(Tour, slug=self.kwargs['slug'])
        return TourAvailability.objects.filter(tour=tour, is_active=True)

    def perform_create(self, serializer):
        tour = get_object_or_404(Tour, slug=self.kwargs['slug'])
        serializer.save(tour=tour)


# --- Guide Views ---
class TourGuideListView(generics.ListAPIView):
    queryset = TourGuide.objects.filter(is_verified=True)
    serializer_class = TourGuideSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'specialization', 'languages']
    ordering_fields = ['average_rating', 'experience_years', 'total_tours']


class TourGuideDetailView(generics.RetrieveAPIView):
    queryset = TourGuide.objects.all()
    serializer_class = TourGuideSerializer
    permission_classes = [permissions.AllowAny]


class TourGuideCreateView(generics.CreateAPIView):
    serializer_class = TourGuideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)