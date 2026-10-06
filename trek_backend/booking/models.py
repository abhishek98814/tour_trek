from django.db import models
from django.conf import settings


class Booking(models.Model):
    BOOKING_TYPE_CHOICES = [
        ('trek', 'Trek'),
        ('tour', 'Tour'),
        ('gear_rent', 'Gear Rental'),
        ('gear_buy', 'Gear Purchase'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('esewa', 'eSewa'),
        ('khalti', 'Khalti'),
        ('stripe', 'Stripe'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
    ]

    # User
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name='bookings')
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES)
    booking_reference = models.CharField(max_length=20, unique=True)

    # Content (one will be filled based on booking_type)
    trek_id = models.PositiveIntegerField(null=True, blank=True)
    tour_id = models.PositiveIntegerField(null=True, blank=True)
    gear_id = models.PositiveIntegerField(null=True, blank=True)

    # Booking details
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    num_participants = models.PositiveIntegerField(default=1)
    special_requests = models.TextField(blank=True)

    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NPR')

    # Payment
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES,
                                       default='unpaid')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES,
                                       blank=True)
    transaction_id = models.CharField(max_length=200, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Contact info
    contact_name = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    emergency_contact = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.booking_reference} — {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            import random
            import string
            self.booking_reference = 'TN' + ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=8)
            )
        self.final_price = self.total_price - self.discount_amount
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']


class BookingParticipant(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE,
                                 related_name='participants')
    full_name = models.CharField(max_length=200)
    age = models.PositiveIntegerField()
    nationality = models.CharField(max_length=100)
    passport_number = models.CharField(max_length=50, blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    medical_conditions = models.TextField(blank=True)

    def __str__(self):
        return f"{self.full_name} — {self.booking.booking_reference}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE,
                                 related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=20)
    transaction_id = models.CharField(max_length=200, unique=True)
    gateway_response = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES,
                               default='initiated')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.transaction_id} — {self.status}"

    class Meta:
        ordering = ['-created_at']