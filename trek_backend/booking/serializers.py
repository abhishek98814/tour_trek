from datetime import timedelta
from decimal import Decimal

from django.apps import apps
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Booking, BookingParticipant, Payment

# App labels of the other apps, they match INSTALLED_APPS in settings.py
TREK_APP = 'treks'
TOUR_APP = 'tour'
GEAR_APP = 'gear'

# Trek prices have no currency field, so trek bookings use this one.
DEFAULT_CURRENCY = 'USD'
# Tours are priced in rupees (Khalti only takes NPR anyway).
TOUR_CURRENCY = 'NPR'

EDIT_LOCK_DAYS = 7


class BookingParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingParticipant
        fields = ['id', 'full_name', 'age', 'nationality',
                  'passport_number', 'emergency_contact', 'medical_conditions']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'currency', 'payment_method',
                  'transaction_id', 'status', 'paid_at', 'created_at']
        read_only_fields = ['created_at']


class BookingListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'username', 'booking_type',
            'start_date', 'end_date', 'num_participants',
            'final_price', 'currency', 'payment_status',
            'status', 'created_at',
        ]


class BookingDetailSerializer(serializers.ModelSerializer):
    participants = BookingParticipantSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['booking_reference', 'final_price',
                            'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    participants = BookingParticipantSerializer(many=True, required=False)

    class Meta:
        model = Booking
        exclude = ['user', 'final_price', 'payment_status', 'status',
                   'transaction_id', 'paid_at', 'cancelled_at',
                   'completed_at', 'created_at', 'updated_at']
        # Prices are calculated on the server. Anything the client
        # sends for these fields is ignored.
        read_only_fields = ['booking_reference', 'unit_price', 'total_price',
                            'discount_amount', 'currency']

    # ---------- trek ----------
    def _price_trek(self, data):
        Trek = apps.get_model(TREK_APP, 'Trek')

        trek_id = data.get('trek_id')
        if not trek_id:
            raise serializers.ValidationError({'trek_id': 'This field is required for trek bookings.'})

        try:
            trek = Trek.objects.get(id=trek_id, status='active')
        except Trek.DoesNotExist:
            raise serializers.ValidationError({'trek_id': 'This trek is not available.'})

        n = data.get('num_participants', 1)
        if n > trek.max_group_size:
            raise serializers.ValidationError({
                'num_participants': f'Maximum group size for this trek is {trek.max_group_size}.'
            })

        unit_price = trek.price_per_person
        total_price = unit_price * n
        # discounted_price() already applies trek.discount_percent
        discount = (unit_price - trek.discounted_price()) * n

        return {
            'unit_price': unit_price,
            'total_price': total_price,
            'discount_amount': discount.quantize(Decimal('0.01')),
            'currency': DEFAULT_CURRENCY,
        }

    # ---------- tour ----------
    def _price_tour(self, data):
        Tour = apps.get_model(TOUR_APP, 'Tour')

        tour_id = data.get('tour_id')
        if not tour_id:
            raise serializers.ValidationError({'tour_id': 'This field is required for tour bookings.'})

        try:
            tour = Tour.objects.get(id=tour_id, status='active')
        except Tour.DoesNotExist:
            raise serializers.ValidationError({'tour_id': 'This tour is not available.'})

        n = data.get('num_participants', 1)

        if tour.max_group_size and n > tour.max_group_size:
            raise serializers.ValidationError({
                'num_participants': f'Maximum group size for this tour is {tour.max_group_size}.'
            })
        if tour.min_group_size and n < tour.min_group_size:
            raise serializers.ValidationError({
                'num_participants': f'Minimum group size for this tour is {tour.min_group_size}.'
            })

        unit_price = tour.price_per_person
        total_price = unit_price * n

        # works whether discounted_price is a method or a property on your model
        discounted = tour.discounted_price
        if callable(discounted):
            discounted = discounted()
        discount = (unit_price - discounted) * n

        return {
            'unit_price': unit_price,
            'total_price': total_price,
            'discount_amount': discount.quantize(Decimal('0.01')),
            'currency': TOUR_CURRENCY,
        }

    # ---------- gear (rentals only) ----------
    def _price_gear(self, data):
        Gear = apps.get_model(GEAR_APP, 'Gear')

        gear_id = data.get('gear_id')
        if not gear_id:
            raise serializers.ValidationError({'gear_id': 'This field is required for gear bookings.'})

        try:
            gear = Gear.objects.get(id=gear_id, status='active', is_available=True)
        except Gear.DoesNotExist:
            raise serializers.ValidationError({'gear_id': 'This gear is not available.'})

        if gear.listing_type not in ('rent', 'both') or not gear.rent_price_per_day:
            raise serializers.ValidationError({'gear_id': 'This gear is not available for rent.'})

        start = data.get('start_date')
        end = data.get('end_date')
        if not start or not end:
            raise serializers.ValidationError({'end_date': 'Start and end date are required for rentals.'})
        if end < start:
            raise serializers.ValidationError({'end_date': 'End date must be after the start date.'})

        # if the owner set rental windows, the dates must fall inside one
        windows = gear.rental_availability.filter(is_available=True)
        if windows.exists() and not windows.filter(start_date__lte=start, end_date__gte=end).exists():
            raise serializers.ValidationError({'start_date': 'Gear is not available for these dates.'})

        # don't double-book the same item
        clash = Booking.objects.filter(
            booking_type='gear', gear_id=gear.id,
            status__in=['pending', 'confirmed'],
            start_date__lte=end, end_date__gte=start,
        ).exists()
        if clash:
            raise serializers.ValidationError({'start_date': 'Already booked for these dates.'})

        days = (end - start).days + 1
        unit_price = gear.rent_price_per_day  # price per day
        total_price = unit_price * days

        return {
            'unit_price': unit_price,
            'total_price': total_price,
            'discount_amount': Decimal('0.00'),
            'currency': gear.price_currency,
        }

    def validate(self, data):
        participants = data.get('participants', [])
        if participants and len(participants) != data.get('num_participants', 1):
            raise serializers.ValidationError(
                'Number of participants does not match the participant list.'
            )

        booking_type = data.get('booking_type')
        if booking_type == 'trek':
            data.update(self._price_trek(data))
        elif booking_type == 'tour':
            data.update(self._price_tour(data))
        elif booking_type == 'gear':
            data.update(self._price_gear(data))
        else:
            raise serializers.ValidationError(
                {'booking_type': 'Unknown booking type.'}
            )

        return data

    @transaction.atomic
    def create(self, validated_data):
        participants_data = validated_data.pop('participants', [])
        validated_data['user'] = self.context['request'].user
        booking = Booking.objects.create(**validated_data)
        BookingParticipant.objects.bulk_create(
            BookingParticipant(booking=booking, **p) for p in participants_data
        )
        return booking


class PaymentInitSerializer(serializers.Serializer):
    """Used by the old placeholder PaymentInitView/PaymentVerifyView (non-Khalti methods)."""
    booking_reference = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=[
        'esewa', 'khalti', 'stripe', 'bank', 'cash'
    ])
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class InitiatePaymentSerializer(serializers.Serializer):
    """Used by the real Khalti InitiateKhaltiPaymentView."""
    booking_id = serializers.IntegerField()


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "booking_reference", "booking_type", "start_date", "end_date",
                  "num_participants", "final_price", "currency", "payment_status",
                  "status", "created_at"]
        read_only_fields = ["id", "booking_reference", "booking_type", "end_date",
                            "final_price", "currency", "payment_status", "status",
                            "created_at"]

    def validate(self, attrs):
        booking = self.instance
        limit = timezone.localdate() + timedelta(days=EDIT_LOCK_DAYS)

        if booking.status not in ("pending", "confirmed"):
            raise serializers.ValidationError(f"A {booking.status} booking cannot be edited.")

        if booking.start_date < limit:
            raise serializers.ValidationError(
                f"Booking can only be edited {EDIT_LOCK_DAYS} or more days before the start date."
            )

        if booking.payment_status in ("paid", "partial"):
            raise serializers.ValidationError("A paid booking cannot be edited.")

        new_start = attrs.get("start_date", booking.start_date)
        if new_start < limit:
            raise serializers.ValidationError(
                f"New start date must be at least {EDIT_LOCK_DAYS} days from today."
            )

        if attrs.get("num_participants", booking.num_participants) < 1:
            raise serializers.ValidationError("Participants must be at least 1.")

        return attrs

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)