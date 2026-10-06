from django.db import models

# Create your models here.
from django.conf import settings 



class Hero(models.Model):
    title = models.CharField(max_length=255)
    desc = models.TextField()
    bannr = models.ImageField("Banner", upload_to="hero_banner")
    sliding_Banner = models.ImageField("sliding_banner", upload_to="sliding_banners")

    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Hero"
        verbose_name_plural = "Heros"   


    def __str__(self):
        return self.title


class AiHero(models.Model):

    title = models.CharField(max_length=255)
    banner_desc = models.TextField()
    