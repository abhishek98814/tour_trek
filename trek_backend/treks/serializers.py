from rest_framework import serializers
from .models import Category, Trek, TrekImage, TrekItinerary, TrekAvailability, Review



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']



class TrekImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TrekImage
        fields = ['id', 'image', 'caption', 'is_cover', 'uploaded_at']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class TrekItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrekItinerary
        fields = ['id', 'day', 'title', 'description', 'distance_km', 'altitude_m', 'accommodation', 'meals']


class TrekAvailabilitySerializer(serializers.ModelSerializer):
    remaining_slots = serializers.SerializerMethodField()

    class Meta:
        model = TrekAvailability
        fields = ['id', 'start_date', 'end_date', 'available_slots', 'booked_slots', 'remaining_slots', 'is_active']

    def get_remaining_slots(self, obj):
        return obj.remaining_slots()



class TrekListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discounted_price = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Trek
        fields = [
            'id', 'title', 'slug', 'category',
            'difficulty', 'duration_days', 'max_altitude', 'region',
            'start_point', 'end_point',
            'price_per_person', 'discount_percent', 'discounted_price',
            'best_season', 'tims_required',
            'status', 'is_featured', 'total_bookings', 'average_rating',
            'cover_image', 'created_at',
        ]

    def get_discounted_price(self, obj):
        return obj.discounted_price()


    def get_cover_image(self, obj):
        cover = next((img for img in obj.images.all() if img.is_cover), None)
        if cover is None:
            cover = obj.images.first()
        return cover.image.url if cover else None



class TrekDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    images = TrekImageSerializer(many=True, read_only=True)
    itinerary = TrekItinerarySerializer(many=True, read_only=True)
    availability = TrekAvailabilitySerializer(many=True, read_only=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Trek
        fields = [
            'id', 'title', 'slug', 'description', 'highlight',
            'category', 'created_by',
            'difficulty', 'duration_days', 'max_altitude', 'distance_km',
            'max_group_size', 'min_age',
            'start_point', 'end_point', 'region', 'longitude', 'latitude', 'gpx_file',
            'price_per_person', 'discount_percent', 'discounted_price',
            'best_season', 'tims_required', 'permit_info', 'gear_list',
            'included', 'excluded',
            'status', 'is_featured', 'total_bookings', 'average_rating',
            'ai_review_summary', 'ai_summary_updated_at',
            'images', 'itinerary', 'availability',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['ai_review_summary', 'ai_summary_updated_at', 'total_bookings', 'average_rating']

    def get_discounted_price(self, obj):
        return obj.discounted_price()



class TrekCreateUpdateSerializer(serializers.ModelSerializer):
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Trek
        fields = [
            'id', 'title', 'slug', 'description', 'highlight',
            'category', 'created_by',
            'difficulty', 'duration_days', 'max_altitude', 'distance_km',
            'max_group_size', 'min_age',
            'start_point', 'end_point', 'region', 'longitude', 'latitude', 'gpx_file',
            'price_per_person', 'discount_percent',
            'best_season', 'tims_required', 'permit_info', 'gear_list',
            'included', 'excluded',
            'status', 'is_featured',
        ]

    def validate_discount_percent(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("discount_percent must be between 0 and 100.")
        return value

    def validate(self, attrs):
        duration_days = attrs.get('duration_days', getattr(self.instance, 'duration_days', None))
        if duration_days is not None and duration_days <= 0:
            raise serializers.ValidationError({"duration_days": "Must be a positive number of days."})
        return attrs


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'trek', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['trek', 'user', 'created_at']  # added 'trek' here

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value