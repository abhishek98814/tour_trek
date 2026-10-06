'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import KhaltiPayButton from '@/components/booking/KhaltiPayButton';
import useAuthStore from '@/store/authStore';
import { authFetch } from '@/lib/authFetch';

const HERO_FALLBACK = '/images/booking-hero.jpg';

interface Participant {
  id: number;
  full_name: string;
  age: number;
  nationality: string;
  passport_number?: string;
  medical_conditions?: string;
}

interface Payment {
  id: number;
  amount: string;
  currency: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  paid_at?: string;
  created_at: string;
}

interface LinkedItem {
  title?: string;
  cover_image?: string;
}

interface BookingDetail {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date?: string;
  num_participants: number;
  special_requests?: string;
  unit_price: string;
  total_price: string;
  discount_amount: string;
  final_price: string;
  currency: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  payment_method?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  participants: Participant[];
  payments: Payment[];
  created_at: string;
  cover_image?: string;
  item_title?: string;
  trek?: LinkedItem;
  tour?: LinkedItem;
}

const badgeColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fefce8', text: '#854d0e' },
  confirmed: { bg: '#f0fdfa', text: '#0d9488' },
  cancelled: { bg: '#fef2f2', text: '#dc2626' },
  completed: { bg: '#eff6ff', text: '#2563eb' },
  refunded: { bg: '#f1f5f9', text: '#475569' },
  unpaid: { bg: '#fef2f2', text: '#dc2626' },
  partial: { bg: '#fefce8', text: '#854d0e' },
  paid: { bg: '#f0fdfa', text: '#0d9488' },
};

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  border: '1px solid #e8ecf0',
  padding: '24px',
  marginBottom: '20px',
};

const h3: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0a2e45',
  margin: '0 0 16px',
};

const linkButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 20px',
  borderRadius: '10px',
  background: '#14b8a6',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
};

function mediaUrl(path: string) {
  return path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}${path}`;
}

function StatusBadge({ value }: { value: string }) {
  const c = badgeColors[value] || badgeColors.pending;
  return (
    <span
      style={{
        padding: '6px 14px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        background: c.bg,
        color: c.text,
        textTransform: 'capitalize',
      }}
    >
      {value}
    </span>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fb',
        padding: '24px',
      }}
    >
      {children}
    </div>
  );
}

export default function BookingDetailPage() {
  const { accessToken, hasHydrated } = useAuthStore();
  const isLoggedIn = !!accessToken;
  const { reference } = useParams<{ reference: string }>();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  async function fetchBooking() {
    try {
      const res = await authFetch(
        `/bookings/${encodeURIComponent(reference)}/`
      );

      if (!res.ok) {
        setError(
          res.status === 404
            ? 'Booking not found.'
            : res.status === 401
            ? 'Your session has expired. Please login again.'
            : 'Could not load this booking.'
        );
        return;
      }

      setBooking(await res.json());
    } catch (err) {
      console.error('FETCH BOOKING ERROR:', err);
      setError('Something went wrong loading this booking.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) return; 

    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    if (!reference) return;

    fetchBooking();
  }, [hasHydrated, isLoggedIn, reference]);

  async function handleCancel() {
    if (!booking) return;
    if (!confirm('Cancel this booking? This cannot be undone.')) return;

    setCancelling(true);
    try {
      const res = await authFetch(
        `/bookings/${encodeURIComponent(booking.booking_reference)}/cancel/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Cancelled by user' }),
        }
      );

      if (res.ok) {
        await fetchBooking();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || data?.detail || 'Could not cancel this booking.');
      }
    } finally {
      setCancelling(false);
    }
  }

  if (!hasHydrated || loading) {
    return (
      <FullScreen>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid #e5e7eb',
            borderTopColor: '#14b8a6',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </FullScreen>
    );
  }

  if (!isLoggedIn) {
    return (
      <FullScreen>
        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #e8ecf0',
            maxWidth: '400px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2e45', margin: '0 0 8px' }}>
            Please login
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>
            Please login to view this booking.
          </p>
          <Link href="/login" style={linkButton}>
            Login
          </Link>
        </div>
      </FullScreen>
    );
  }

  if (error || !booking) {
    return (
      <FullScreen>
        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: '#fff',
            borderRadius: '20px',
            border: '1px solid #e8ecf0',
            maxWidth: '400px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2e45', margin: '0 0 8px' }}>
            {error ?? 'Booking not found.'}
          </h2>
          <Link
            href="/booking"
            style={{ color: '#14b8a6', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
          >
            ← Back to my bookings
          </Link>
        </div>
      </FullScreen>
    );
  }

  const money = (v: string) =>
    `${booking.currency} ${Number(v).toLocaleString()}`;

  const showPayment =
    booking.payment_status !== 'paid' &&
    booking.status !== 'cancelled' &&
    booking.status !== 'completed';

  const usesKhalti = !booking.payment_method || booking.payment_method === 'khalti';

  const imagePath = booking.cover_image || booking.trek?.cover_image || booking.tour?.cover_image || null;
  const heroSrc = imagePath ? mediaUrl(imagePath) : HERO_FALLBACK;
  const itemTitle = booking.item_title || booking.trek?.title || booking.tour?.title;

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingTop: '72px', paddingBottom: '60px' }}>
      {/* ---------- Hero ---------- */}
      <section className="bk-hero">
        {!heroFailed && (
          <img
            src={heroSrc}
            alt={itemTitle ?? ''}
            onError={() => setHeroFailed(true)}
            className="bk-hero-img"
          />
        )}
        {/* keeps the white text readable on bright photos */}
        <div className="bk-hero-fade" />

        <div className="bk-hero-inner">
          <Link href="/booking" className="bk-hero-line bk-back" style={{ animationDelay: '100ms' }}>
            ← Back to my bookings
          </Link>

          <div className="bk-hero-row">
            <div>
              {itemTitle && (
                <p className="bk-hero-line bk-item" style={{ animationDelay: '200ms' }}>
                  {itemTitle}
                </p>
              )}
              <h1 className="bk-hero-line bk-title" style={{ animationDelay: '300ms' }}>
                {booking.booking_reference}
              </h1>
              <p className="bk-hero-line bk-sub" style={{ animationDelay: '400ms' }}>
                {booking.booking_type.replace('_', ' ')} booking · created{' '}
                {new Date(booking.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bk-hero-line" style={{ display: 'flex', gap: '8px', animationDelay: '500ms' }}>
              <StatusBadge value={booking.status} />
              <StatusBadge value={booking.payment_status} />
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 24px 0' }}>
        {showPayment && (
          <div style={card}>
            <h3 style={{ ...h3, margin: '0 0 4px' }}>Complete your payment</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              {money(booking.final_price)} due
            </p>
            {usesKhalti ? (
              <KhaltiPayButton bookingId={booking.id} />
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                You chose to pay by{' '}
                <strong style={{ textTransform: 'capitalize' }}>
                  {booking.payment_method?.replace('_', ' ')}
                </strong>
                . Our team will contact you with payment instructions.
              </p>
            )}
          </div>
        )}

        <div style={card}>
          <h3 style={h3}>Trip Details</h3>
          {[
            { label: 'Start Date', value: booking.start_date },
            { label: 'End Date', value: booking.end_date || 'Not set' },
            { label: 'Participants', value: `${booking.num_participants} person(s)` },
            { label: 'Price per person', value: money(booking.unit_price) },
            ...(Number(booking.discount_amount) > 0
              ? [{ label: 'Discount', value: `− ${money(booking.discount_amount)}` }]
              : []),
            { label: 'Total Price', value: money(booking.final_price) },
            ...(booking.special_requests
              ? [{ label: 'Special Requests', value: booking.special_requests }]
              : []),
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f1f5f9',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748b', flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2e45', textAlign: 'right' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {booking.participants?.length > 0 && (
          <div style={card}>
            <h3 style={h3}>Participants ({booking.participants.length})</h3>
            {booking.participants.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom:
                    i < booking.participants.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f3d57, #14b8a6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a2e45' }}>
                    {p.full_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Age {p.age} · {p.nationality}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {booking.payments?.length > 0 && (
          <div style={card}>
            <h3 style={h3}>Payment History</h3>
            {booking.payments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f1f5f9',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a2e45', textTransform: 'capitalize' }}>
                    {p.payment_method}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a2e45' }}>
                    {p.currency} {Number(p.amount).toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color:
                        p.status === 'success'
                          ? '#0d9488'
                          : p.status === 'failed'
                          ? '#dc2626'
                          : '#94a3b8',
                      textTransform: 'capitalize',
                    }}
                  >
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!['completed', 'cancelled'].includes(booking.status) &&
          booking.payment_status !== 'paid' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                padding: '11px 24px',
                borderRadius: '10px',
                border: '1.5px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 700,
                cursor: cancelling ? 'not-allowed' : 'pointer',
                opacity: cancelling ? 0.6 : 1,
              }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          )}
      </div>

      <style>{`
        .bk-hero {
          position: relative;
          overflow: hidden;
          background: #0f3d57;
          min-height: 280px;
          display: flex;
        }
        .bk-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: bkSettle 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .bk-hero-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10, 26, 38, 0.88), rgba(10, 26, 38, 0.4) 55%, rgba(10, 26, 38, 0.15));
        }
        .bk-hero-inner {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 24px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 48px;
        }
        .bk-hero-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }
        .bk-back {
          align-self: flex-start;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
        }
        .bk-back:hover { color: #fff; }
        .bk-item { margin: 0 0 4px; font-size: 14px; color: #f0c48f; font-weight: 600; }
        .bk-title {
          margin: 0 0 4px;
          font-size: clamp(26px, 4.5vw, 36px);
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
        }
        .bk-sub {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75);
          text-transform: capitalize;
        }
        .bk-hero-line {
          opacity: 0;
          animation: bkRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes bkSettle { from { transform: scale(1.08); } to { transform: scale(1); } }
        @keyframes bkRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bk-hero-img { animation: none; }
          .bk-hero-line { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}