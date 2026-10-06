from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminStatsView, AdminUserListView, AdminUserUpdateView,
    ChangePasswordView, CustomTokenObtainPairView, ProfileView, RegisterView, 
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('me/', ProfileView.as_view(), name='profile'),
    path('me/password/', ChangePasswordView.as_view(), name='change-password'),

    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserUpdateView.as_view(), name='admin-user-update'),
]