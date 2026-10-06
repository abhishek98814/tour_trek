'use client';

import { useState } from 'react';
import { startPayment } from '@/lib/payment';
import type { Booking } from '@/lib/bookingg';

interface Props {
  booking: Booking;
  onError: (message: string) => void;
}

export default function PayButton({ booking, onError }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { url, error } = await startPayment(booking.id);

    if (error || !url) {
      onError(error ?? "We couldn't start the payment.");
      setLoading(false);
      return;
    }

    window.location.href = url; // go to the payment page
  }

  return (
    <button
      className="bp-btn"
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '11px 22px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg,#7c3aed,#5c2d91)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading
        ? 'Redirecting…'
        : `💳  ${"Nprs"} ${Number(booking.final_price).toLocaleString()}`}
    </button>
  );
}