from rest_framework import serializers
from .models import Gear, GearImage, GearCategory, GearRentalAvailability, GearReview, GearOffer
# from trek_backend.booking import serializers 



class GearCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GearCategory
        fields = ['id', 'name', 'slug', 'description', 'icon']


class GearImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GearImage
        fields = ['id', 'image', 'caption', 'is_cover', 'uploaded_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # send /media/... only (same as the trek api), the frontend adds the media host
        data['image'] = instance.image.url if instance.image else None
        return data


class GearRentalAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = GearRentalAvailability
        fields = ['id', 'start_date', 'end_date', 'is_available']

    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError({'end_date': 'End date must be after the start date.'})
        return attrs


class GearReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = GearReview
        fields = ['id', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['reviewer_name', 'created_at']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


def _pick_cover(obj):
    # uses the prefetched images, so no extra query per gear item
    images = list(obj.images.all())
    cover = next((i for i in images if i.is_cover), None)
    return cover or (images[0] if images else None)


class GearListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Gear
        fields = [
            'id', 'title', 'slug', 'category_name', 'seller_name',
            'brand', 'condition', 'listing_type', 'size',
            'sell_price', 'rent_price_per_day', 'price_currency',
            'is_negotiable', 'location', 'is_available', 'is_featured',
            'average_rating', 'views_count', 'cover_image', 'created_at',
        ]

    def get_cover_image(self, obj):
        cover = _pick_cover(obj)
        return cover.image.url if cover else None


class GearDetailSerializer(serializers.ModelSerializer):
    images = GearImageSerializer(many=True, read_only=True)
    rental_availability = GearRentalAvailabilitySerializer(many=True, read_only=True)
    reviews = GearReviewSerializer(many=True, read_only=True)
    category = GearCategorySerializer(read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Gear
        fields = '__all__'


class GearCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gear
        exclude = ['seller', 'views_count', 'average_rating', 'created_at', 'updated_at']

    def validate(self, attrs):
        # on partial updates fall back to what is already saved
        listing = attrs.get('listing_type', getattr(self.instance, 'listing_type', 'sell'))
        sell = attrs.get('sell_price', getattr(self.instance, 'sell_price', None))
        rent = attrs.get('rent_price_per_day', getattr(self.instance, 'rent_price_per_day', None))

        if listing in ('sell', 'both') and not sell:
            raise serializers.ValidationError({'sell_price': 'Required when the gear is for sale.'})
        if listing in ('rent', 'both') and not rent:
            raise serializers.ValidationError({'rent_price_per_day': 'Required when the gear is for rent.'})
        return attrs

    def create(self, validated_data):
        validated_data['seller'] = self.context['request'].user
        return super().create(validated_data)


class GearOfferSerializer(serializers.ModelSerializer):
    gear_title = serializers.CharField(source='gear.title', read_only=True)
    gear_slug = serializers.CharField(source='gear.slug', read_only=True)
    asking_price = serializers.DecimalField(source='gear.sell_price', max_digits=10,
                                            decimal_places=2, read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = GearOffer
        fields = ['id', 'gear_title', 'gear_slug', 'asking_price', 'buyer_name',
                  'amount', 'message', 'contact_phone', 'status', 'seller_note', 'created_at']
        read_only_fields = ['status', 'seller_note', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Enter an amount greater than zero.')
        return value


class GearOfferResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['accepted', 'declined'])
    seller_note = serializers.CharField(required=False, allow_blank=True, max_length=500)



APPROVAL_FIELDS = ['created_by', 'approval_status', 'rejection_reason', 'reviewed_by', 'reviewed_at']


class GearCreateSerializer(serializers.ModelSerializer):
    """Seller input. Approval fields can never be set from the request."""
    class Meta:
        model = Gear
        exclude = APPROVAL_FIELDS


# class MyGearSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Gear
#         fields = '__all__'



class MyGearSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Gear
        fields = '__all__'

    def get_cover_image(self, obj):
        cover = _pick_cover(obj)
        return cover.image.url if cover else None


class GearReviewSerializer(serializers.ModelSerializer):
    seller = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Gear
        fields = '__all__'




import uuid
from django.utils.text import slugify

class GearCreateSerializer(serializers.ModelSerializer):
    """Any logged-in user. Approval, owner and counters can never come from the request."""
    class Meta:
        model = Gear
        fields = [
            'id', 'slug', 'title', 'description', 'category', 'brand', 'model_name',
            'size', 'weight_kg', 'condition', 'year_purchased', 'color',
            'listing_type', 'sell_price', 'rent_price_per_day', 'price_currency',
            'is_negotiable', 'deposit_amount', 'location',
            'approval_status',
        ]
        read_only_fields = ['id', 'slug', 'approval_status']

    def validate(self, attrs):
        listing = attrs.get('listing_type', 'sell')
        if listing in ('sell', 'both') and not attrs.get('sell_price'):
            raise serializers.ValidationError({'sell_price': 'Required when the gear is for sale.'})
        if listing in ('rent', 'both') and not attrs.get('rent_price_per_day'):
            raise serializers.ValidationError({'rent_price_per_day': 'Required when the gear is for rent.'})
        return attrs

    def create(self, validated_data):
        base = slugify(validated_data['title'])[:150] or 'gear'
        validated_data['slug'] = f"{base}-{uuid.uuid4().hex[:6]}"
        return super().create(validated_data)




class AdminGearSerializer(serializers.ModelSerializer):   # was GearReviewSerializer
    seller = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Gear
        fields = '__all__'