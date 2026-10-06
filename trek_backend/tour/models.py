from decimal import Decimal  # add this
from django.db import models
from django.conf import settings


class TourCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Tour Categories"


class Tour(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
    ]
    TOUR_TYPE_CHOICES = [
        ('cultural', 'Cultural'),
        ('adventure', 'Adventure'),
        ('wildlife', 'Wildlife'),
        ('spiritual', 'Spiritual'),
        ('scenic', 'Scenic'),
        ('photography', 'Photography'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    SEASON_CHOICES = [
        ('spring', 'Spring (Mar-May)'),
        ('summer', 'Summer (Jun-Aug)'),
        ('autumn', 'Autumn (Sep-Nov)'),
        ('winter', 'Winter (Dec-Feb)'),
        ('all', 'All Seasons'),
    ]

    # Basic info
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    highlights = models.TextField(blank=True, null=True)
    category = models.ForeignKey(TourCategory, on_delete=models.SET_NULL, null=True, related_name='tours')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tours')
    tour_type = models.CharField(max_length=20, choices=TOUR_TYPE_CHOICES, default='cultural')

    # Tour details
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='easy')
    duration_days = models.PositiveIntegerField()
    duration_hours = models.PositiveIntegerField(null=True, blank=True, help_text="For day tours")
    max_group_size = models.PositiveIntegerField(default=15)
    min_group_size = models.PositiveIntegerField(default=1)
    min_age = models.PositiveIntegerField(default=5)

    # Location
    destination = models.CharField(max_length=200)
    pickup_point = models.CharField(max_length=200, blank=True)
    dropoff_point = models.CharField(max_length=200, blank=True)
    region = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Pricing
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    price_currency = models.CharField(max_length=3, default='NPR')
    discount_percent = models.PositiveIntegerField(default=0)
    child_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Nepal specific
    best_season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all')
    entry_fee_included = models.BooleanField(default=False)
    guide_included = models.BooleanField(default=True)
    transport_included = models.BooleanField(default=False)
    meals_included = models.BooleanField(default=False)

    # Inclusions
    included = models.TextField(blank=True)
    excluded = models.TextField(blank=True)
    requirements = models.TextField(blank=True, help_text="What to bring, dress code etc")

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    total_bookings = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def discounted_price(self):
        if self.discount_percent > 0:
            return self.price_per_person * (Decimal(100) - Decimal(self.discount_percent)) / Decimal(100)
        return self.price_per_person

    class Meta:
        ordering = ['-created_at']


class TourImage(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='tour_images/')
    caption = models.CharField(max_length=200, blank=True)
    is_cover = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.tour.title}"


class TourItinerary(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='itinerary')
    day = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    accommodation = models.CharField(max_length=200, blank=True)
    meals = models.CharField(max_length=100, blank=True)
    places_to_visit = models.TextField(blank=True)

    def __str__(self):
        return f"Day {self.day} - {self.title}"

    class Meta:
        ordering = ['day']


class TourAvailability(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='availability')
    start_date = models.DateField()
    end_date = models.DateField()
    available_slots = models.PositiveIntegerField()
    booked_slots = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def remaining_slots(self):
        return self.available_slots - self.booked_slots

    def __str__(self):
        return f"{self.tour.title} — {self.start_date} to {self.end_date}"

    class Meta:
        ordering = ['start_date']
        verbose_name_plural = "Tour Availabilities"


class TourGuide(models.Model):
    LANGUAGE_CHOICES = [
        ('nepali', 'Nepali'),
        ('english', 'English'),
        ('hindi', 'Hindi'),
        ('chinese', 'Chinese'),
        ('japanese', 'Japanese'),
        ('french', 'French'),
        ('german', 'German'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='guide_profile')
    license_number = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField(default=0)
    languages = models.CharField(max_length=200, choices=LANGUAGE_CHOICES, default='english')
    specialization = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_tours = models.PositiveIntegerField(default=0)
    profile_picture = models.ImageField(upload_to='guide_profiles/', null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Guide: {self.user.username}"