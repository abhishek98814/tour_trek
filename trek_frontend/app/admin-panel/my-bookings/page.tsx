'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';

interface Booking {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date?: string;
  num_participants: number;
  final_price: string;
  currency: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fefce8', text: '#854d0e' },
  confirmed: { bg: '#f0fdfa', text: '#0d9488' },
  cancelled: { bg: '#fef2f2', text: '#dc2626' },
  completed: { bg: '#eff6ff', text: '#2563eb' },
  refunded: { bg: '#f1f5f9', text: '#475569' },
};

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  unpaid: { bg: '#fef2f2', text: '#dc2626' },
  partial: { bg: '#fefce8', text: '#854d0e' },
  paid: { bg: '#f0fdfa', text: '#0d9488' },
  refunded: { bg: '#f1f5f9', text: '#475569' },
};

export default function BookingPage() {
  const { accessToken } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBookings() {
    console.log('FETCHING BOOKINGS');
    console.log('HAS TOKEN:', !!accessToken);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('STATUS:', res.status);

      const result = await res.json();

      console.log('RESPONSE:', result);

      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Please login again.'
            : 'Could not load your bookings.'
        );
        return;
      }

      if (Array.isArray(result)) {
        setBookings(result);
      } else if (Array.isArray(result.results)) {
        setBookings(result.results);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('FETCH BOOKINGS ERROR:', err);
      setError('Something went wrong loading your bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [accessToken]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fb',
        }}
      >
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

        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!accessToken) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🔐
          </div>

          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0a2e45',
              margin: '0 0 8px',
            }}
          >
            Please login
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 20px',
            }}
          >
            Please login to view your bookings.
          </p>

          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#14b8a6',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            😕
          </div>

          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0a2e45',
              margin: '0 0 8px',
            }}
          >
            {error}
          </h2>

          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBookings();
            }}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#14b8a6',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#f8f9fb',
        minHeight: '100vh',
        paddingTop: '88px',
        paddingBottom: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0a2e45',
              margin: '0 0 6px',
            }}
          >
            My Bookings
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0,
            }}
          >
            View and manage your bookings.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e8ecf0',
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              📋
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0a2e45',
                margin: '0 0 8px',
              }}
            >
              No bookings yet
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 20px',
              }}
            >
              You haven't made any bookings yet.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#14b8a6',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Explore Trips
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {bookings.map((booking) => {
              const sc =
                statusColors[booking.status] ||
                statusColors.pending;

              const psc =
                paymentStatusColors[booking.payment_status] ||
                paymentStatusColors.unpaid;

              return (
                <div
                  key={booking.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #e8ecf0',
                    padding: '22px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 800,
                          color: '#0a2e45',
                          marginBottom: '5px',
                        }}
                      >
                        {booking.booking_reference}
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          color: '#64748b',
                          textTransform: 'capitalize',
                        }}
                      >
                        {booking.booking_type} booking
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: sc.bg,
                          color: sc.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {booking.status}
                      </span>

                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: psc.bg,
                          color: psc.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginBottom: '4px',
                        }}
                      >
                        Start Date
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0a2e45',
                        }}
                      >
                        {booking.start_date}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginBottom: '4px',
                        }}
                      >
                        Participants
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0a2e45',
                        }}
                      >
                        {booking.num_participants} person(s)
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginBottom: '4px',
                        }}
                      >
                        Total
                      </div>

                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0a2e45',
                        }}
                      >
                        {booking.currency}{' '}
                        {Number(
                          booking.final_price
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '20px',
                    }}
                  >
                    <Link
                      href={`/booking/${booking.booking_reference}`}
                      style={{
                        display: 'inline-block',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: '#0f3d57',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      View Booking →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}