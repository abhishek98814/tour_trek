from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Gear, GearCategory, GearImage, GearOffer, GearRentalAvailability, GearReview
from .notifications import notify_new_offer, notify_offer_response
from .permissions import IsAdminRole
from .serializers import (
    AdminGearSerializer, GearCategorySerializer, GearCreateSerializer,
    GearCreateUpdateSerializer, GearDetailSerializer, GearImageSerializer,
    GearListSerializer, GearOfferResponseSerializer, GearOfferSerializer,
    GearRentalAvailabilitySerializer, GearReviewSerializer, MyGearSerializer,
)


class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user or request.user.role == 'admin'


def get_own_gear_or_403(request, slug):
    gear = get_object_or_404(Gear, slug=slug)
    if gear.seller != request.user and request.user.role != 'admin':
        raise PermissionDenied('You can only change your own gear listings.')
    return gear


# --- Categories ---
class GearCategoryListView(generics.ListCreateAPIView):
    queryset = GearCategory.objects.all()
    serializer_class = GearCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- Public gear (approved only) ---
class GearListView(generics.ListAPIView):
    queryset = Gear.objects.filter(
        status='active', is_available=True, approval_status='approved'
    ).select_related('category', 'seller').prefetch_related('images')
    serializer_class = GearListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['condition', 'listing_type', 'size',
                        'is_negotiable', 'is_featured', 'location']
    search_fields = ['title', 'description', 'brand', 'model_name', 'location']
    ordering_fields = ['sell_price', 'rent_price_per_day',
                       'average_rating', 'created_at', 'views_count']


class GearDetailView(generics.RetrieveAPIView):
    queryset = Gear.objects.filter(
        status='active', approval_status='approved'
    ).select_related('category', 'seller').prefetch_related(
        'images', 'rental_availability', 'reviews__reviewer'
    )
    serializer_class = GearDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Gear.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db(fields=['views_count'])
        return Response(self.get_serializer(instance).data)


class FeaturedGearView(generics.ListAPIView):
    queryset = Gear.objects.filter(
        status='active', is_featured=True, approval_status='approved'
    ).select_related('category', 'seller').prefetch_related('images')
    serializer_class = GearListSerializer
    permission_classes = [permissions.AllowAny]


# --- Create / my gear (any logged-in user) ---
class GearCreateView(generics.CreateAPIView):
    """POST /api/gear/create/ : any logged-in user, always saved as pending."""
    serializer_class = GearCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            seller=self.request.user,
            created_by=self.request.user,
            approval_status='pending',
        )


class MyGearListView(generics.ListAPIView):
    """GET /api/gear/my-gear/"""
    serializer_class = MyGearSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # return Gear.objects.filter(seller=self.request.user).order_by('-id')
        return Gear.objects.filter(seller=self.request.user).prefetch_related('images').order_by('-id')


class GearUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GearCreateUpdateSerializer
    permission_classes = [IsSellerOrAdmin]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Gear.objects.all()
        return Gear.objects.filter(seller=user)


# --- Images ---
MAX_IMAGES_PER_GEAR = 8
MAX_IMAGE_MB = 5
ALLOWED_IMAGE_TYPES = ('image/jpeg', 'image/png', 'image/webp')


class GearImageUploadView(generics.CreateAPIView):
    serializer_class = GearImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        gear = get_own_gear_or_403(request, kwargs['slug'])

        files = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not files:
            raise ValidationError({'images': 'Attach at least one image.'})
        if gear.images.count() + len(files) > MAX_IMAGES_PER_GEAR:
            raise ValidationError({'images': f'A listing can have at most {MAX_IMAGES_PER_GEAR} images.'})

        for f in files:
            if f.content_type not in ALLOWED_IMAGE_TYPES:
                raise ValidationError({'images': f'{f.name}: only JPG, PNG or WebP images are allowed.'})
            if f.size > MAX_IMAGE_MB * 1024 * 1024:
                raise ValidationError({'images': f'{f.name} is bigger than {MAX_IMAGE_MB} MB.'})

        needs_cover = not gear.images.filter(is_cover=True).exists()
        saved = []
        for i, f in enumerate(files):
            serializer = self.get_serializer(data={
                'image': f,
                'caption': request.data.get('caption', '') if len(files) == 1 else '',
                'is_cover': needs_cover and i == 0,
            })
            serializer.is_valid(raise_exception=True)
            serializer.save(gear=gear)
            saved.append(serializer.data)

        return Response(saved, status=status.HTTP_201_CREATED)


# --- Rental availability ---
class GearRentalAvailabilityView(generics.ListCreateAPIView):
    serializer_class = GearRentalAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        gear = get_object_or_404(Gear, slug=self.kwargs['slug'])
        return GearRentalAvailability.objects.filter(gear=gear)

    def perform_create(self, serializer):
        gear = get_own_gear_or_403(self.request, self.kwargs['slug'])
        serializer.save(gear=gear)


# --- Reviews ---
class GearReviewView(generics.ListCreateAPIView):
    serializer_class = GearReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        gear = get_object_or_404(Gear, slug=self.kwargs['slug'])
        return GearReview.objects.filter(gear=gear).select_related('reviewer')

    def perform_create(self, serializer):
        gear = get_object_or_404(Gear, slug=self.kwargs['slug'])
        if gear.seller == self.request.user:
            raise ValidationError('You cannot review your own gear.')
        if GearReview.objects.filter(gear=gear, reviewer=self.request.user).exists():
            raise ValidationError('You have already reviewed this gear.')
        serializer.save(gear=gear, reviewer=self.request.user)


# --- Offers ---
class GearOfferCreateView(generics.CreateAPIView):
    serializer_class = GearOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        gear = get_object_or_404(
            Gear, slug=self.kwargs['slug'], status='active',
            is_available=True, approval_status='approved',
        )
        user = self.request.user

        if gear.seller_id == user.id:
            raise ValidationError('You cannot make an offer on your own gear.')
        if gear.listing_type not in ('sell', 'both'):
            raise ValidationError('This gear is listed for rent only, it is not for sale.')
        if not gear.sell_price:
            raise ValidationError('The seller has not set a sale price for this gear yet.')

        amount = serializer.validated_data['amount']
        if amount > gear.sell_price:
            raise ValidationError({'amount': f'Your offer is higher than the asking price (NPR {gear.sell_price:,.0f}).'})
        if GearOffer.objects.filter(gear=gear, buyer=user, status='pending').exists():
            raise ValidationError('You already have a pending offer on this gear.')

        offer = serializer.save(gear=gear, buyer=user)
        transaction.on_commit(lambda: notify_new_offer(offer))


class GearOffersReceivedView(generics.ListAPIView):
    serializer_class = GearOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = GearOffer.objects.select_related('gear', 'buyer')
        user = self.request.user
        return qs if user.role == 'admin' else qs.filter(gear__seller=user)


class GearOffersSentView(generics.ListAPIView):
    serializer_class = GearOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GearOffer.objects.select_related('gear', 'buyer').filter(buyer=self.request.user)


class GearOfferRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        offer = get_object_or_404(GearOffer.objects.select_related('gear', 'buyer'), pk=pk)

        if offer.gear.seller != request.user and request.user.role != 'admin':
            raise PermissionDenied('Only the seller or an admin can answer this offer.')
        if offer.status != 'pending':
            raise ValidationError(f'This offer was already {offer.status}.')

        data = GearOfferResponseSerializer(data=request.data)
        data.is_valid(raise_exception=True)

        offer.status = data.validated_data['status']
        offer.seller_note = data.validated_data.get('seller_note', '')
        offer.save(update_fields=['status', 'seller_note', 'updated_at'])

        transaction.on_commit(lambda: notify_offer_response(offer))
        return Response(GearOfferSerializer(offer).data)


# --- Admin approval ---
class AdminGearListView(generics.ListAPIView):
    """GET /api/gear/admin/list/?approval_status=pending"""
    serializer_class = AdminGearSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Gear.objects.select_related('created_by').order_by('-id')
        wanted = self.request.query_params.get('approval_status')
        return qs.filter(approval_status=wanted) if wanted else qs


class AdminGearReviewView(APIView):
    """POST /api/gear/admin/<id>/approve/ or /reject/"""
    permission_classes = [IsAdminRole]
    action = None  # set in as_view(action='approve' | 'reject')

    def post(self, request, pk):
        gear = get_object_or_404(Gear, pk=pk)

        if self.action == 'reject':
            reason = (request.data.get('reason') or '').strip()
            if not reason:
                return Response({'detail': 'Please give a reason for rejecting.'},
                                status=status.HTTP_400_BAD_REQUEST)
            gear.approval_status, gear.rejection_reason = 'rejected', reason
        else:
            gear.approval_status, gear.rejection_reason = 'approved', ''

        gear.reviewed_by = request.user
        gear.reviewed_at = timezone.now()
        gear.save(update_fields=['approval_status', 'rejection_reason', 'reviewed_by', 'reviewed_at'])
        return Response(AdminGearSerializer(gear).data)