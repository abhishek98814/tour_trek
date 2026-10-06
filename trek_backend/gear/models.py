from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class GearCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Gear Categories"


class Gear(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]
    LISTING_TYPE_CHOICES = [
        ('sell', 'For Sale'),
        ('rent', 'For Rent'),
        ('both', 'Sale & Rent'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('inactive', 'Inactive'),
    ]
    APPROVAL_CHOICES = [
    ('pending', 'Pending review'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
    ]   
    SIZE_CHOICES = [
        ('xs', 'XS'),
        ('s', 'S'),
        ('m', 'M'),
        ('l', 'L'),
        ('xl', 'XL'),
        ('xxl', 'XXL'),
        ('one_size', 'One Size'),
        ('na', 'N/A'),
    ]

    # Basic info
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(GearCategory, on_delete=models.SET_NULL,
                                 null=True, related_name='gear_items')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='gear_listings')

    brand = models.CharField(max_length=100, blank=True)
    model_name = models.CharField(max_length=100, blank=True)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, default='one_size')
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    year_purchased = models.PositiveIntegerField(null=True, blank=True)
    color = models.CharField(max_length=50, blank=True)

    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES, default='sell')

   
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rent_price_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_currency = models.CharField(max_length=3, default='NPR')
    is_negotiable = models.BooleanField(default=False)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2,
                                         null=True, blank=True,
                                         help_text="Deposit for rentals")

   
    location = models.CharField(max_length=200, default='Kathmandu')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    approval_status = models.CharField(max_length=10, choices=APPROVAL_CHOICES, default='pending', db_index=True)
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reviewed_gear',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # only add this if Gear has no owner field yet:
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.CASCADE, related_name='gear_items',
    )   




    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Gear Items"


class GearImage(models.Model):
    gear = models.ForeignKey(Gear, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='gear_images/')
    caption = models.CharField(max_length=200, blank=True)
    is_cover = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.gear.title}"


class GearRentalAvailability(models.Model):
    gear = models.ForeignKey(Gear, on_delete=models.CASCADE, related_name='rental_availability')
    start_date = models.DateField()
    end_date = models.DateField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.gear.title} — {self.start_date} to {self.end_date}"

    class Meta:
        ordering = ['start_date']
        verbose_name_plural = "Gear Rental Availabilities"


class GearReview(models.Model):
    gear = models.ForeignKey(Gear, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.gear.title} by {self.reviewer.username}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['gear', 'reviewer']


class GearOffer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    gear = models.ForeignKey(Gear, on_delete=models.CASCADE, related_name='offers')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name='gear_offers')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    seller_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.buyer.username} offered {self.amount} for {self.gear.title}"

    class Meta:
        ordering = ['-created_at']