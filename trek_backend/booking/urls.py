from django.urls import path
from .views import (
    BookingListView, BookingCreateView, BookingDetailView, BookingCancelView,
    AdminBookingListView, PaymentInitView, PaymentVerifyView,
    InitiateKhaltiPaymentView, VerifyKhaltiPaymentView, BookingUpdateView,
)

urlpatterns = [
    path('', BookingListView.as_view(), name='booking-list'),
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('admin/', AdminBookingListView.as_view(), name='booking-admin-list'),

    path('payments/init/', PaymentInitView.as_view(), name='payment-init'),
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment-verify'),

    path('payments/khalti/initiate/', InitiateKhaltiPaymentView.as_view(), name='khalti-initiate'),
    path('payments/khalti/verify/', VerifyKhaltiPaymentView.as_view(), name='khalti-verify'),

    # numeric id (PATCH edit) must come BEFORE the reference routes
    path('<int:pk>/', BookingUpdateView.as_view(), name='booking-update'),

    path('<str:booking_reference>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<str:booking_reference>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
]