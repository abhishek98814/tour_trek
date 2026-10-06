from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .khalti import initiate_payment, lookup_payment, KhaltiError
from .models import Booking, BookingParticipant, Payment
from .serializers import (
    BookingListSerializer, BookingDetailSerializer, BookingCreateSerializer,
    PaymentSerializer, PaymentInitSerializer, InitiatePaymentSerializer,
)


class BookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return BookingCreateSerializer if self.request.method == 'POST' else BookingListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)



class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'booking_reference'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_reference):
        booking = get_object_or_404(
            Booking, booking_reference=booking_reference, user=request.user
        )
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {'error': f'Booking is already {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.cancellation_reason = request.data.get('reason', '')
        booking.save()
        return Response({'message': 'Booking cancelled successfully'})


class AdminBookingListView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Booking.objects.all()



class PaymentInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = get_object_or_404(
            Booking,
            booking_reference=serializer.validated_data['booking_reference'],
            user=request.user
        )

        if booking.payment_status == 'paid':
            return Response(
                {'error': 'Booking is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = Payment.objects.create(
            booking=booking,
            amount=serializer.validated_data['amount'],
            currency=booking.currency,
            payment_method=serializer.validated_data['payment_method'],
            transaction_id=f"TXN-{booking.booking_reference}-{timezone.now().timestamp()}",
            status='pending'
        )

        return Response({
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'amount': payment.amount,
            'currency': payment.currency,
            'payment_method': payment.payment_method,
            'status': payment.status,
            'message': 'Payment initiated. Integrate eSewa/Stripe here.'
        })


class PaymentVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        payment = get_object_or_404(Payment, transaction_id=transaction_id)

        payment.status = 'success'
        payment.paid_at = timezone.now()
        payment.save()

        payment.booking.payment_status = 'paid'
        payment.booking.status = 'confirmed'
        payment.booking.paid_at = timezone.now()
        payment.booking.transaction_id = transaction_id
        payment.booking.save()

        return Response({'message': 'Payment verified successfully',
                          'booking_status': 'confirmed'})



class InitiateKhaltiPaymentView(APIView):
    """
    POST /api/bookings/payments/khalti/initiate/
    Body: {"booking_id": 12}

    Starts a Khalti payment for a booking the user owns. Returns the
    payment_url the frontend should redirect the browser to.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        in_serializer = InitiatePaymentSerializer(data=request.data)
        in_serializer.is_valid(raise_exception=True)

        booking = get_object_or_404(
            Booking, id=in_serializer.validated_data["booking_id"], user=request.user
        )

        if booking.payment_status == "paid":
            return Response({"detail": "This booking is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        return_url = f"{settings.FRONTEND_URL}/payment/khalti/callback"

        try:
            khalti_response = initiate_payment(booking, return_url)
        except KhaltiError as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        Payment.objects.create(
            booking=booking,
            amount=booking.final_price,
            currency=booking.currency,
            payment_method="khalti",
            transaction_id=khalti_response["pidx"],
            gateway_response=khalti_response,
            status="initiated",
        )

        return Response({
            "payment_url": khalti_response["payment_url"],
            "pidx": khalti_response["pidx"],
        }, status=status.HTTP_201_CREATED)


class VerifyKhaltiPaymentView(APIView):
    """
    POST /api/bookings/payments/khalti/verify/
    Body: {"pidx": "..."}

    Called by the frontend after Khalti redirects the user back. Looks up
    the REAL status directly with Khalti (never trusts the redirect query
    params alone), then updates the Payment and Booking accordingly.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        pidx = request.data.get("pidx")
        if not pidx:
            return Response({"detail": "'pidx' is required."}, status=status.HTTP_400_BAD_REQUEST)

        payment = get_object_or_404(Payment, transaction_id=pidx, booking__user=request.user)

        try:
            lookup = lookup_payment(pidx)
        except KhaltiError as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        khalti_status = lookup.get("status")
        payment.gateway_response = lookup

        if khalti_status == "Completed":
            payment.status = "success"
            payment.paid_at = timezone.now()
            payment.save()

            booking = payment.booking
            booking.payment_status = "paid"
            booking.payment_method = "khalti"
            booking.transaction_id = pidx
            booking.paid_at = timezone.now()
            booking.status = "confirmed"
            booking.save()
        elif khalti_status in ("Expired", "User canceled"):
            payment.status = "failed"
            payment.save()
        else:
            payment.save()

        return Response({
            "khalti_status": khalti_status,
            "payment": PaymentSerializer(payment).data,
            "booking_payment_status": payment.booking.payment_status,
        })




from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingUpdateSerializer


class BookingUpdateView(generics.UpdateAPIView):
    serializer_class = BookingUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)