import { authFetch } from '@/lib/authFetch';
import { isActive, readApiError, type Booking } from '@/lib/bookingg';

export function canPay(b: Booking): boolean {
  return isActive(b) && (b.payment_status === 'unpaid' || b.payment_status === 'partial');
}

export async function startPayment(bookingId: number): Promise<{ url?: string; error?: string }> {
  try {
    const res = await authFetch('/bookings/payments/khalti/initiate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    });

    if (!res.ok) {
      return { error: await readApiError(res, "We couldn't start the payment.") };
    }

    const data = await res.json();
    if (!data.payment_url) return { error: "We couldn't start the payment." };

    return { url: data.payment_url as string };
  } catch (err) {
    console.error('START PAYMENT ERROR:', err);
    return { error: 'Something went wrong. Please try again.' };
  }
}