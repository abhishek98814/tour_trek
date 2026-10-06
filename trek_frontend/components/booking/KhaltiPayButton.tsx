'use client';
import { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import useAuthStore from '@/store/authStore';

interface KhaltiPayButtonProps {
  bookingId: number | string;
  className?: string;
}

export default function KhaltiPayButton({ bookingId, className }: KhaltiPayButtonProps) {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/payments/khalti/initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Could not start payment. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className={
          className ||
          'flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#5C2D91] to-[#3d1d61] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting payment…
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Pay with Khalti
          </>
        )}
      </button>

      {error && <p className="mt-2 text-center text-xs font-medium text-[#dc2626]">{error}</p>}
    </div>
  );
}