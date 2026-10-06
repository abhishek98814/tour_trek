from rest_framework import serializers
from decimal import Decimal

from .models import (
    Tour,
    TourImage,
    TourItinerary,
    TourAvailability,
    TourCategory,
    TourGuide
)

# =========================
# CATEGORY
# =========================
class TourCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TourCategory
        fields = ['id', 'name', 'slug', 'description', 'icon']


# =========================
# IMAGE
# =========================
class TourImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ['id', 'image', 'caption', 'is_cover', 'uploaded_at']


# =========================
# ITINERARY
# =========================
class TourItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TourItinerary
        fields = [
            'id',
            'day',
            'title',
            'description',
            'accommodation',
            'meals',
            'places_to_visit'
        ]


# =========================
# AVAILABILITY
# =========================
class TourAvailabilitySerializer(serializers.ModelSerializer):
    remaining_slots = serializers.ReadOnlyField()

    class Meta:
        model = TourAvailability
        fields = [
            'id',
            'start_date',
            'end_date',
            'available_slots',
            'booked_slots',
            'remaining_slots',
            'is_active'
        ]


# =========================
# GUIDE
# =========================
class TourGuideSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = TourGuide
        fields = [
            'id',
            'username',
            'email',
            'license_number',
            'experience_years',
            'languages',
            'specialization',
            'is_verified',
            'average_rating',
            'total_tours',
            'profile_picture',
            'bio'
        ]


# =========================
# LIST SERIALIZER (FAST API)
# =========================
class TourListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Tour
        fields = [
            'id',
            'title',
            'slug',
            'tour_type',
            'difficulty',
            'duration_days',
            'duration_hours',
            'destination',
            'region',
            'price_per_person',
            'discounted_price',
            'discount_percent',
            'best_season',
            'is_featured',
            'average_rating',
            'total_bookings',
            'cover_image',
            'category_name',
            'guide_included',
            'transport_included',
            'meals_included'
        ]

    def get_discounted_price(self, obj):
        if obj.discount_percent > 0:
            return obj.price_per_person * (Decimal(100) - Decimal(obj.discount_percent)) / Decimal(100)
        return obj.price_per_person

    # def get_cover_image(self, obj):
    #     request = self.context.get('request')

    #     cover = obj.images.filter(is_cover=True).first()

    #     # fallback if no cover image set
    #     if not cover:
    #         cover = obj.images.first()

    #     if cover:
    #         if request:
    #             return request.build_absolute_uri(cover.image.url)
    #         return cover.image.url

    #     return None

    def get_cover_image(self, obj):
            cover = next((img for img in obj.images.all() if img.is_cover), None)
            if cover is None:
                cover = obj.images.first()
            return cover.image.url if cover else None


from django.utils import timezone


class TourDetailSerializer(serializers.ModelSerializer):
    images = TourImageSerializer(many=True, read_only=True)
    itinerary = TourItinerarySerializer(many=True, read_only=True)
    availability = serializers.SerializerMethodField()

    discounted_price = serializers.SerializerMethodField()
    best_season_label = serializers.CharField(source='get_best_season_display', read_only=True)
    category = TourCategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Tour
        fields = '__all__'

    def get_discounted_price(self, obj):
        return obj.discounted_price()

    def get_availability(self, obj):
        # only bookable slots: active, in the future, with spots left
        slots = obj.availability.filter(
            is_active=True, start_date__gte=timezone.localdate()
        )
        return TourAvailabilitySerializer(
            [s for s in slots if s.remaining_slots() > 0], many=True
        ).data

class TourCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        exclude = [
            'created_by',
            'total_bookings',
            'average_rating',
            'created_at',
            'updated_at'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)