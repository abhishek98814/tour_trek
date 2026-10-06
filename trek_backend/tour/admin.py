from django.contrib import admin
from .models import (
    TourCategory,
    Tour,
    TourImage,
    TourItinerary,
    TourAvailability,
    TourGuide
)

# -------------------------
# Inline Image Upload inside Tour
# -------------------------
class TourImageInline(admin.TabularInline):
    model = TourImage
    extra = 1


class TourItineraryInline(admin.TabularInline):
    model = TourItinerary
    extra = 1


class TourAvailabilityInline(admin.TabularInline):
    model = TourAvailability
    extra = 1


# -------------------------
# Tour Admin
# -------------------------
@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'price_per_person', 'status', 'is_featured')
    list_filter = ('status', 'tour_type', 'difficulty', 'is_featured')
    search_fields = ('title', 'destination', 'region')
    prepopulated_fields = {'slug': ('title',)}

    inlines = [
        TourImageInline,
        TourItineraryInline,
        TourAvailabilityInline
    ]


# -------------------------
# Category
# -------------------------
@admin.register(TourCategory)
class TourCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}


# -------------------------
# Guide
# -------------------------
@admin.register(TourGuide)
class TourGuideAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'experience_years', 'is_verified')
    search_fields = ('user__username', 'license_number')


# Optional direct registrations
admin.site.register(TourImage)
admin.site.register(TourItinerary)
admin.site.register(TourAvailability)