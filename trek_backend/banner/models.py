from django.db import models
from django.conf import settings
# Create your models here.

class Banner(models.Model):
    ("bannerImage", "BannerImagge"),
    ("shortBanner", "shortBanner"),
    ("longBanner", "LongBanner")

    STATUS_CHOICE = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed')
        ('applied', 'Applied')
    ]


    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="Banner")
