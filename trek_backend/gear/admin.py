from django.contrib import admin
from .models import Gear, GearImage, GearCategory, GearRentalAvailability, GearReview, GearOffer



@admin.register(GearOffer)
class GearOfferAdmin(admin.ModelAdmin):
       list_display = ['gear', 'buyer', 'amount', 'status', 'created_at']
       list_filter = ['status']

admin.site.register(Gear)
admin.site.register(GearImage)
admin.site.register(GearCategory)
admin.site.register(GearRentalAvailability)
admin.site.register(GearReview)