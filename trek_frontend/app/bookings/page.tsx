'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';

/**
 * Booking form
 * Route: /booking/new?type=trek&id=12&price=1200&currency=USD&name=Everest%20Base%20Camp
 *
 * type     -> trek | tour | gear_rent | gear_buy
 * id       -> id of the trek / tour / gear item
 * price    -> unit price per person / item
 * currency -> 3-letter code (default USD)
 * name     -> display name only (shown at top of the form)
 */

interface ParticipantForm {
  full_name: string;
  age: string;
  nationality: string;
  passport_number: string;
  medical_conditions: string;
}

const emptyParticipant = (): ParticipantForm => ({
  full_name: '',
  age: '',
  nationality: '',
  passport_number: '',
  medical_conditions: '',
});

const PAYMENT_METHODS = [
  { value: 'khalti', label: 'Khalti' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'stripe', label: 'Card (Stripe)' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
];

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

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748b',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  fontSize: '13px',
  color: '#0a2e45',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
};

function Field({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={label}>{title}</label>
      {children}
    </div>
  );
}

function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { accessToken } = useAuthStore();

  const bookingType = params.get('type') || 'trek';
  const itemId = params.get('id');
  const itemName = params.get('name') || '';
  const unitPrice = Number(params.get('price') || 0);
  const currency = (params.get('currency') || 'USD').toUpperCase();

  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numParticipants, setNumParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('khalti');

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [participants, setParticipants] = useState<ParticipantForm[]>([
    emptyParticipant(),
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = unitPrice * numParticipants;

  function changeParticipantCount(n: number) {
    const count = Math.max(1, Math.min(50, n || 1));
    setNumParticipants(count);
    setParticipants((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, emptyParticipant),
        ];
      }
      return prev.slice(0, count);
    });
  }

  function updateParticipant(
    index: number,
    field: keyof ParticipantForm,
    value: string
  ) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  // DRF returns { field: ["msg"] } — flatten into readable text
  function formatApiError(data: unknown): string {
    if (!data || typeof data !== 'object') return 'Could not create booking.';
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    return Object.entries(d)
      .map(([key, val]) => {
        const msg = Array.isArray(val) ? val.join(' ') : JSON.stringify(val);
        return `${key.replace(/_/g, ' ')}: ${msg}`;
      })
      .join('\n');
  }

  async function handleSubmit() {
    setError(null);

    if (!startDate) return setError('Please choose a start date.');
    if (!contactName || !contactEmail || !contactPhone)
      return setError('Please fill in your contact details.');
    if (participants.some((p) => !p.full_name || !p.age || !p.nationality))
      return setError(
        'Please fill in name, age and nationality for every participant.'
      );
    if (endDate && endDate < startDate)
      return setError('End date cannot be before the start date.');

    const body: Record<string, unknown> = {
      booking_type: bookingType,
      trek_id: bookingType === 'trek' && itemId ? Number(itemId) : null,
      tour_id: bookingType === 'tour' && itemId ? Number(itemId) : null,
      gear_id:
        bookingType.startsWith('gear') && itemId ? Number(itemId) : null,
      start_date: startDate,
      end_date: endDate || null,
      num_participants: numParticipants,
      special_requests: specialRequests,
      unit_price: unitPrice.toFixed(2),
      total_price: total.toFixed(2),
      discount_amount: '0.00',
      currency,
      payment_method: paymentMethod,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      emergency_contact: emergencyContact,
      participants: participants.map((p) => ({
        full_name: p.full_name,
        age: Number(p.age),
        nationality: p.nationality,
        passport_number: p.passport_number,
        medical_conditions: p.medical_conditions,
      })),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Please login again.'
            : formatApiError(result)
        );
        return;
      }

      // Go to the detail page — it shows the Khalti pay button
      router.push(`/booking/${result.booking_reference}`);
    } catch (err) {
      console.error('CREATE BOOKING ERROR:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
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
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>
            You need to be logged in to make a booking.
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

  return (
    <div
      style={{
        background: '#f8f9fb',
        minHeight: '100vh',
        paddingTop: '88px',
        paddingBottom: '60px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <Link href="/dashboard/my-bookings" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '13px', color: '#14b8a6', fontWeight: 600 }}>
            ← My bookings
          </span>
        </Link>

        <div style={{ margin: '16px 0 28px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0a2e45',
              margin: '0 0 6px',
            }}
          >
            Book your trip
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {itemName ? `${itemName} · ` : ''}
            <span style={{ textTransform: 'capitalize' }}>
              {bookingType.replace('_', ' ')}
            </span>
          </p>
        </div>

        {/* Trip details */}
        <div style={card}>
          <h3 style={h3}>Trip details</h3>
          <div style={grid}>
            <Field title="Start date *">
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={input}
              />
            </Field>
            <Field title="End date">
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={input}
              />
            </Field>
            <Field title="Number of participants *">
              <input
                type="number"
                min={1}
                max={50}
                value={numParticipants}
                onChange={(e) => changeParticipantCount(Number(e.target.value))}
                style={input}
              />
            </Field>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Field title="Special requests">
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Dietary needs, room preferences, anything we should know"
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div style={card}>
          <h3 style={h3}>Contact details</h3>
          <div style={grid}>
            <Field title="Full name *">
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={input}
              />
            </Field>
            <Field title="Email *">
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={input}
              />
            </Field>
            <Field title="Phone *">
              <input
                type="tel"
                maxLength={15}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={input}
              />
            </Field>
            <Field title="Emergency contact">
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name and phone number"
                style={input}
              />
            </Field>
          </div>
        </div>

        {/* Participants */}
        <div style={card}>
          <h3 style={h3}>Participants ({participants.length})</h3>
          {participants.map((p, i) => (
            <div
              key={i}
              style={{
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom:
                  i < participants.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f3d57, #14b8a6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                {i === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      updateParticipant(0, 'full_name', contactName);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#14b8a6',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Same as contact name
                  </button>
                )}
              </div>
              <div style={grid}>
                <Field title="Full name *">
                  <input
                    value={p.full_name}
                    onChange={(e) =>
                      updateParticipant(i, 'full_name', e.target.value)
                    }
                    style={input}
                  />
                </Field>
                <Field title="Age *">
                  <input
                    type="number"
                    min={0}
                    value={p.age}
                    onChange={(e) => updateParticipant(i, 'age', e.target.value)}
                    style={input}
                  />
                </Field>
                <Field title="Nationality *">
                  <input
                    value={p.nationality}
                    onChange={(e) =>
                      updateParticipant(i, 'nationality', e.target.value)
                    }
                    style={input}
                  />
                </Field>
                <Field title="Passport number">
                  <input
                    value={p.passport_number}
                    onChange={(e) =>
                      updateParticipant(i, 'passport_number', e.target.value)
                    }
                    style={input}
                  />
                </Field>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Field title="Medical conditions">
                  <input
                    value={p.medical_conditions}
                    onChange={(e) =>
                      updateParticipant(i, 'medical_conditions', e.target.value)
                    }
                    placeholder="Allergies, altitude sickness history, medication…"
                    style={input}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        {/* Payment method + summary */}
        <div style={card}>
          <h3 style={h3}>Payment</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map((m) => {
              const active = paymentMethod === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${active ? '#14b8a6' : '#e2e8f0'}`,
                    background: active ? '#f0fdfa' : '#fff',
                    color: active ? '#0d9488' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#64748b',
                marginBottom: '8px',
              }}
            >
              <span>
                {currency} {unitPrice.toLocaleString()} × {numParticipants}
              </span>
              <span>
                {currency} {total.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: '#0a2e45',
              }}
            >
              <span>Total</span>
              <span>
                {currency} {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              marginBottom: '20px',
              whiteSpace: 'pre-line',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            background: '#14b8a6',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Creating booking…' : 'Confirm booking'}
        </button>
        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
            margin: '10px 0 0',
          }}
        >
          You&apos;ll pay on the next page.
        </p>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary for production builds
export default function NewBookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingForm />
    </Suspense>
  );
}