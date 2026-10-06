from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Q


def _admin_emails():
    User = get_user_model()
    qs = User.objects.filter(is_active=True).filter(Q(role='admin') | Q(is_superuser=True))
    return [e for e in qs.values_list('email', flat=True) if e]


def _send(recipients, subject, body):
    # one email per person so nobody sees the other addresses
    # fail_silently: a broken mail server must never break the offer itself
    for to in {r for r in recipients if r}:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to], fail_silently=True)


def notify_new_offer(offer):
    """Tell the gear owner and every admin that a new offer came in."""
    gear = offer.gear
    buyer = offer.buyer

    subject = f'New offer on "{gear.title}": NPR {offer.amount:,.0f}'
    body = (
        f'{buyer.username} made an offer on "{gear.title}".\n\n'
        f'Asking price: NPR {gear.sell_price:,.0f}\n'
        f'Offer:        NPR {offer.amount:,.0f}\n\n'
        f'Message: {offer.message or "(none)"}\n\n'
        f'Buyer contact\n'
        f'  Email: {buyer.email or "not given"}\n'
        f'  Phone: {offer.contact_phone or "not given"}\n\n'
        f'Accept or decline it from your dashboard.'
    )
    _send([gear.seller.email, *_admin_emails()], subject, body)


def notify_offer_response(offer):
    """Tell the buyer what the seller decided."""
    gear = offer.gear
    subject = f'Your offer on "{gear.title}" was {offer.status}'
    body = (
        f'The seller {offer.status} your offer of NPR {offer.amount:,.0f} '
        f'for "{gear.title}".\n\n'
        f'Note from the seller: {offer.seller_note or "(none)"}'
    )
    _send([offer.buyer.email], subject, body)