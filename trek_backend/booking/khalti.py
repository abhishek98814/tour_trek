"""
booking/khalti.py

Khalti ePayment API v2 integration.
Docs: https://docs.khalti.com/khalti-epayment/

Requires:
    pip install requests
"""

import requests
from django.conf import settings


class KhaltiError(Exception):
    pass


def initiate_payment(booking, return_url: str) -> dict:
    """
    booking: a Booking instance (must have contact_name, contact_email,
             contact_phone, final_price, booking_reference).
    return_url: where Khalti redirects the user's browser after payment
                (a page on your FRONTEND, e.g. FRONTEND_URL/payment/khalti/callback).

    Returns Khalti's response dict, e.g. {"pidx": "...", "payment_url": "...", ...}
    Raises KhaltiError on failure.
    """
    amount_paisa = int(booking.final_price * 100)  # Khalti wants amount in paisa (NPR smallest unit)

    payload = {
        "return_url": return_url,
        "website_url": settings.FRONTEND_URL,
        "amount": amount_paisa,
        "purchase_order_id": booking.booking_reference,
        "purchase_order_name": f"{booking.get_booking_type_display()} booking",
        "customer_info": {
            "name": booking.contact_name,
            "email": booking.contact_email,
            "phone": booking.contact_phone,
        },
    }

    resp = requests.post(
        f"{settings.KHALTI_BASE_URL}/epayment/initiate/",
        json=payload,
        headers={"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"},
        timeout=15,
    )

    if resp.status_code != 200:
        raise KhaltiError(f"Khalti initiate failed ({resp.status_code}): {resp.text}")

    return resp.json()


def lookup_payment(pidx: str) -> dict:
    """
    Verifies a payment's real status directly with Khalti — never trust the
    redirect query params alone, since those are client-controlled.

    Returns Khalti's lookup response, e.g. {"status": "Completed", ...}
    Possible statuses: "Completed", "Pending", "Expired", "User canceled", "Refunded"
    """
    resp = requests.post(
        f"{settings.KHALTI_BASE_URL}/epayment/lookup/",
        json={"pidx": pidx},
        headers={"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"},
        timeout=15,
    )

    if resp.status_code != 200:
        raise KhaltiError(f"Khalti lookup failed ({resp.status_code}): {resp.text}")

    return resp.json()