from rest_framework import serializers
from .models import Review, ReviewImage, ReviewHelpful


class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'uploaded_at']


class ReviewListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'username', 'profile_picture', 'review_type',
            'title', 'comment', 'rating', 'value_rating',
            'service_rating', 'safety_rating', 'scenery_rating',
            'is_verified', 'is_featured', 'helpful_count',
            'travel_date', 'created_at',
        ]


class ReviewDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'is_verified', 'helpful_count',
                            'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        exclude = ['user', 'is_verified', 'is_featured',
                   'helpful_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'review', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']



from .models import ReviewAnalysis
 
 
class ReviewAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewAnalysis
        fields = [
            'review_type', 'object_id', 'summary', 'sentiment',
            'pros', 'cons', 'recommendation',
            'review_count_at_analysis', 'average_rating_at_analysis', 'updated_at',
        ]