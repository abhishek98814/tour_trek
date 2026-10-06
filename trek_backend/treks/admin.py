from django.contrib import admin
from .models import (
    Category,
    Trek,
    TrekImage,
    TrekItinerary,
    TrekAvailability,
    Review
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class TrekImageInline(admin.TabularInline):
    model = TrekImage
    extra = 1


@admin.register(Trek)
class TrekAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "difficulty",
        "region",
        "price_per_person",
        "duration_days",
        "status",
        "is_featured",
        "created_at",
    )

    list_filter = (
        "difficulty",
        "best_season",
        "status",
        "is_featured",
        "category",
    )

    search_fields = (
        "title",
        "region",
        "start_point",
        "end_point",
        "slug",
    )

    prepopulated_fields = {"slug": ("title",)}

    readonly_fields = (
        "total_bookings",
        "average_rating",
        "created_at",
        "updated_at",
    )

    # 🔥 THIS NOW WORKS
    inlines = [TrekImageInline]


@admin.register(TrekImage)
class TrekImageAdmin(admin.ModelAdmin):
    list_display = (
        "trek",
        "caption",
        "is_cover",
        "uploaded_at",
    )

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('trek', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('trek__title', 'user__username', 'comment')
    readonly_fields = ('created_at',)