from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Review, ReviewImage, ReviewHelpful, ReviewAnalysis


class ReviewImageInline(admin.TabularInline):
    model = Review.images.through
    extra = 0
    verbose_name = "Image"
    verbose_name_plural = "Images"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'user', 'review_type', 'rating',
        'is_verified', 'is_featured', 'helpful_count', 'created_at',
    )
    list_filter = ('review_type', 'rating', 'is_verified', 'is_featured', 'created_at')
    search_fields = ('title', 'comment', 'user__username', 'booking_reference')
    list_editable = ('is_verified', 'is_featured')
    readonly_fields = ('created_at', 'updated_at', 'helpful_count')
    date_hierarchy = 'created_at'
    inlines = [ReviewImageInline]
    exclude = ('images',)  # managed via the inline above instead

    fieldsets = (
        ('Reviewer', {'fields': ('user', 'booking_reference')}),
        ('Target', {'fields': ('review_type', 'trek_id', 'tour_id', 'gear_id', 'guide_id')}),
        ('Content', {'fields': ('title', 'comment', 'rating', 'travel_date')}),
        ('Detailed ratings', {
            'fields': ('value_rating', 'service_rating', 'safety_rating', 'scenery_rating'),
            'classes': ('collapse',),
        }),
        ('Status', {'fields': ('is_verified', 'is_featured', 'helpful_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(ReviewImage)
class ReviewImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ('review', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('review__title', 'user__username')


@admin.register(ReviewAnalysis)
class ReviewAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'review_type', 'object_id', 'sentiment',
        'review_count_at_analysis', 'average_rating_at_analysis', 'updated_at',
    )
    list_filter = ('review_type', 'sentiment')
    readonly_fields = (
        'summary', 'sentiment', 'pros', 'cons', 'recommendation',
        'review_count_at_analysis', 'average_rating_at_analysis', 'updated_at',
    )
    search_fields = ('object_id',)