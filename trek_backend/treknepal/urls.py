from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Apps
    path('api/auth/', include('account.urls')),
    path('api/treks/', include('treks.urls')),
    path('api/tours/', include('tour.urls')),
    path('api/gear/', include('gear.urls')),
    path('api/bookings/', include('booking.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/reviews/', include('reviews.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)