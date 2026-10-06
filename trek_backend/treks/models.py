# from django.db import models
# from django.conf import settings
from decimal import Decimal
from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"


class Trek(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('difficult', 'Difficult'),
        ('extreme', 'Extreme'),
    ]
    SEASON_CHOICES = [
        ('spring', 'Spring (Mar-May)'),
        ('summer', 'Summer (Jun-Aug)'),
        ('autumn', 'Autumn (Sep-Nov)'),
        ('winter', 'Winter (Dec-Feb)'),
        ('all', 'All Seasons'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    highlight = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='treks')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    duration_days = models.PositiveIntegerField()
    max_altitude = models.PositiveIntegerField()
    distance_km = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_group_size = models.PositiveIntegerField(default=12)
    min_age = models.PositiveIntegerField(default=12)

    start_point = models.CharField(max_length=100)
    end_point = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    gpx_file = models.FileField(upload_to='gpx_files/', null=True, blank=True)

    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.PositiveIntegerField(default=0)

    best_season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='autumn')
    tims_required = models.BooleanField(default=True)
    permit_info = models.TextField(blank=True, help_text="Permit details and costs")
    gear_list = models.TextField(blank=True, help_text="Recommended gear for the trek")

    included = models.TextField(blank=True)
    excluded = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    total_bookings = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ai_review_summary = models.TextField(blank=True, null=True)
    ai_summary_updated_at = models.DateTimeField(blank=True, null=True)


    def __str__(self):
        return self.title


    def discounted_price(self):
        if self.discount_percent > 0:
            return self.price_per_person * (Decimal(100) - Decimal(self.discount_percent)) / Decimal(100)
        return self.price_per_person

    class Meta:
        ordering = ['-created_at']


class TrekImage(models.Model):
    trek = models.ForeignKey(Trek, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="treks/")
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.trek.title}"


class TrekItinerary(models.Model):
    trek = models.ForeignKey(Trek, on_delete=models.CASCADE, related_name='itinerary')
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    distance_km = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    altitude_m = models.PositiveIntegerField(null=True, blank=True)
    accommodation = models.CharField(max_length=200, blank=True)
    meals = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Day {self.day} - {self.title}"

    class Meta:
        ordering = ['day']


class TrekAvailability(models.Model):
    trek = models.ForeignKey(Trek, on_delete=models.CASCADE, related_name='availability')
    start_date = models.DateField()
    end_date = models.DateField()
    available_slots = models.PositiveIntegerField()
    booked_slots = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def remaining_slots(self):
        return self.available_slots - self.booked_slots

    def __str__(self):
        return f"{self.trek.title} — {self.start_date} to {self.end_date}"

    class Meta:
        ordering = ['start_date']
        verbose_name_plural = "Trek Availabilities"


class Review(models.Model):
    trek = models.ForeignKey(Trek, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(help_text="1 to 5")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating}★ on {self.trek.title} by {self.user}"

    class Meta:
        ordering = ['-created_at']


