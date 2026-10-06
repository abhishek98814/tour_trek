'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { authFetch } from '@/lib/authFetch';

type Result =
  | { state: 'loading' }
  | { state: 'success' }
  | { state: 'pending' }
  | { state: 'failed'; message: string };

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '11px 22px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
};

function CallbackContent() {
  const params = useSearchParams();
  const { accessToken, hasHydrated } = useAuthStore();
  const pidx = params.get('pidx');

  const calledRef = useRef(false);
  const [result, setResult] = useState<Result>({ state: 'loading' });

  useEffect(() => {
    if (!hasHydrated || calledRef.current) return;
    calledRef.current = true;

    if (!accessToken) {
      setResult({ state: 'failed', message: 'Please log in again to confirm your payment.' });
      return;
    }
    if (!pidx) {
      setResult({ state: 'failed', message: 'Invalid payment response.' });
      return;
    }

    (async () => {
      try {
        const res = await authFetch('/bookings/payments/khalti/verify/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pidx }),
        });
        const data = await res.json();

        if (!res.ok) {
          setResult({ state: 'failed', message: data.detail || "We couldn't verify your payment." });
          return;
        }

        if (data.khalti_status === 'Completed') {
          setResult({ state: 'success' });
        } else if (data.khalti_status === 'Pending' || data.khalti_status === 'Initiated') {
          setResult({ state: 'pending' });
        } else if (data.khalti_status === 'User canceled') {
          setResult({ state: 'failed', message: 'You cancelled the payment.' });
        } else {
          setResult({ state: 'failed', message: 'The payment was not completed.' });
        }
      } catch (err) {
        console.error('VERIFY PAYMENT ERROR:', err);
        setResult({ state: 'failed', message: 'Something went wrong while verifying your payment.' });
      }
    })();
  }, [hasHydrated, accessToken, pidx]);

  const content = {
    loading: { icon: '⏳', title: 'Verifying your payment…', text: 'Please do not close this page.', link: null },
    success: { icon: '✅', title: 'Payment successful', text: 'Your booking is confirmed.', link: 'View my bookings' },
    pending: {
      icon: '🕒',
      title: 'Payment pending',
      text: 'Your payment is still being processed. Check your bookings in a few minutes.',
      link: 'Go to my bookings',
    },
    failed: {
      icon: '❌',
      title: 'Payment failed',
      text: result.state === 'failed' ? result.message : '',
      link: 'Back to my bookings',
    },
  }[result.state];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f7fa',
        padding: '24px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '48px',
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid #e8ecf0',
          boxShadow: '0 12px 40px rgba(10,46,69,.08)',
          maxWidth: '420px',
        }}
      >
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>{content.icon}</div>
        <h2 style={{ color: '#0a2e45', margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>
          {content.title}
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 22px' }}>{content.text}</p>
        {content.link && (
          <Link href="/booking" style={linkStyle}>
            {content.link}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function KhaltiCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}