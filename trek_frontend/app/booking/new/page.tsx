'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { authFetch } from '../../../lib/authFetch';

const ITEM_ENDPOINTS: Record<string, string> = {
  trek: '/treks/',
  tour: '/tours/',
  gear_rent: '/gear/',
  gear_buy: '/gear/',
};

interface Window {
  start_date: string;
  end_date: string;
}

interface BookableItem {
  id: number;
  name: string;
  basePrice: number;
  discountPercent: number;
  unitPrice: number; // what the customer pays (per person, per day, or one-off)
  deposit: number; // refundable deposit, gear rent only
  windows: Window[]; // dates the gear can be rented
  currency: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItem(data: any, type: string): BookableItem {
  const basePrice = Number(
    type === 'gear_rent'
      ? data.rent_price_per_day
      : type === 'gear_buy'
      ? data.sell_price
      : data.price_per_person ?? data.price ?? 0
  );
  const discountPercent = Number(data.discount_percent ?? 0);

  return {
    id: data.id,
    name: data.title ?? data.name ?? '',
    basePrice,
    discountPercent,
    unitPrice: basePrice * (1 - discountPercent / 100),
    deposit: type === 'gear_rent' ? Number(data.deposit_amount ?? 0) : 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    windows: (data.rental_availability ?? []).filter((w: any) => w.is_available),
    currency: (data.currency ?? 'NPR').toUpperCase(),
  };
}

const DAY = 86400000;
const daysBetween = (a: string, b: string) =>
  Math.max(1, Math.round((+new Date(b) - +new Date(a)) / DAY) + 1); // both dates count

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ------------------------------------------------------------------ */

interface ParticipantForm {
  full_name: string;
  age: string;
  nationality: string;
  passport_number: string;
  medical_conditions: string;
}

const emptyParticipant = (): ParticipantForm => ({
  full_name: '', age: '', nationality: '', passport_number: '', medical_conditions: '',
});

const PAYMENT_METHODS = [
  { value: 'khalti', label: 'Khalti' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'stripe', label: 'Card (Stripe)' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
];

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', border: '1px solid #e8ecf0', padding: '24px', marginBottom: '20px',
};
const h3: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: '#0a2e45', margin: '0 0 16px' };
const label: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px',
};
const input: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
  fontSize: '13px', color: '#0a2e45', background: '#fff', boxSizing: 'border-box', outline: 'none',
};
const grid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px',
};
const primaryButton: React.CSSProperties = {
  display: 'inline-block', padding: '10px 20px', borderRadius: '10px', border: 'none',
  background: '#14b8a6', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
};
const summaryRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px',
};

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={label}>{title}</label>
      {children}
    </div>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', padding: '24px' }}>
      {children}
    </div>
  );
}

function MessageCard({ icon, title, text, children }: { icon: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '20px', border: '1px solid #e8ecf0', maxWidth: '400px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2e45', margin: '0 0 8px' }}>{title}</h2>
      {text && <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>{text}</p>}
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <FullScreen>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#14b8a6', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </FullScreen>
  );
}

function BookingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { accessToken, hasHydrated } = useAuthStore();
  const isLoggedIn = !!accessToken;

  const bookingType = params.get('type') || 'trek';
  const slug = params.get('slug');
  const isGear = bookingType.startsWith('gear');
  const isRent = bookingType === 'gear_rent';
  const isBuy = bookingType === 'gear_buy';

  const [item, setItem] = useState<BookableItem | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemError, setItemError] = useState<string | null>(null);

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

  const [participants, setParticipants] = useState<ParticipantForm[]>([emptyParticipant()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      const endpoint = ITEM_ENDPOINTS[bookingType];

      if (!slug || !endpoint) {
        setItemError('This booking link is incomplete.');
        setItemLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}${encodeURIComponent(slug)}/`);

        if (!res.ok) {
          setItemError(res.status === 404 ? 'We could not find that item.' : 'Could not load the details.');
          return;
        }

        setItem(normalizeItem(await res.json(), bookingType));
      } catch (err) {
        console.error('LOAD ITEM ERROR:', err);
        setItemError('Something went wrong loading the details.');
      } finally {
        setItemLoading(false);
      }
    }

    loadItem();
  }, [bookingType, slug]);

  const unitPrice = item?.unitPrice ?? 0;
  const deposit = item?.deposit ?? 0;
  const currency = item?.currency ?? 'NPR';

  // gear rent = price x days, gear buy = one price, trips = price x people
  const days = isRent && startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) : 0;
  const subtotal = isRent ? unitPrice * days : isBuy ? unitPrice : unitPrice * numParticipants;
  const total = subtotal + (isRent ? deposit : 0);

  const priceUnit = isRent ? 'per day' : isBuy ? '' : 'per person';

  function changeParticipantCount(n: number) {
    const count = Math.max(1, Math.min(50, n || 1));
    setNumParticipants(count);
    setParticipants((prev) =>
      count > prev.length
        ? [...prev, ...Array.from({ length: count - prev.length }, emptyParticipant)]
        : prev.slice(0, count)
    );
  }

  function updateParticipant(index: number, field: keyof ParticipantForm, value: string) {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  // true when the chosen dates fit inside one of the owner's available windows
  function insideWindow(start: string, end: string) {
    if (!item || item.windows.length === 0) return true; // no windows set = no restriction
    return item.windows.some((w) => start >= w.start_date && end <= w.end_date);
  }

  function formatApiError(data: unknown): string {
    if (!data || typeof data !== 'object') return 'Could not create booking.';
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    return Object.entries(d)
      .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(' ') : JSON.stringify(val)}`)
      .join('\n');
  }

  async function handleSubmit() {
    if (submitting) return;

    setError(null);
    if (!item) return;

    if (!startDate) return setError(isGear ? 'Please choose when you need it.' : 'Please choose a start date.');
    if (isRent && !endDate) return setError('Please choose a return date.');
    if (endDate && endDate < startDate) return setError('The end date cannot be before the start date.');
    if (isRent && !insideWindow(startDate, endDate))
      return setError('Those dates are outside the times this gear is available. Pick dates inside one of the listed windows.');
    if (!contactName || !contactEmail || !contactPhone) return setError('Please fill in your contact details.');
    if (!isGear && participants.some((p) => !p.full_name || !p.age || !p.nationality))
      return setError('Please fill in name, age and nationality for every participant.');

    // NOTE: the server should recalculate prices itself. These fields are only a reference.
    const body: Record<string, unknown> = {
      booking_type: bookingType,
      trek_id: bookingType === 'trek' ? item.id : null,
      tour_id: bookingType === 'tour' ? item.id : null,
      gear_id: isGear ? item.id : null,
      start_date: startDate,
      end_date: endDate || null,
      num_participants: isGear ? 1 : numParticipants,
      special_requests: specialRequests,
      unit_price: unitPrice.toFixed(2),
      total_price: total.toFixed(2),
      discount_amount: '0.00',
      ...(isRent ? { deposit_amount: deposit.toFixed(2), rental_days: days } : {}),
      currency,
      payment_method: paymentMethod,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      emergency_contact: emergencyContact,
      participants: isGear
        ? []
        : participants.map((p) => ({
            full_name: p.full_name,
            age: Number(p.age),
            nationality: p.nationality,
            passport_number: p.passport_number,
            medical_conditions: p.medical_conditions,
          })),
    };

    setSubmitting(true);
    let redirected = false;

    try {
      const res = await authFetch('/bookings/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        setError(res.status === 401 ? 'Your session has expired. Please login again.' : formatApiError(result));
        return;
      }

      const reference = result?.booking_reference;
      if (!reference) {
        setError('Booking was not created. Please try again.');
        return;
      }

      redirected = true;
      router.push(`/booking/${encodeURIComponent(reference)}`);
    } catch (err) {
      console.error('CREATE BOOKING ERROR:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      if (!redirected) setSubmitting(false);
    }
  }

  /* ---------- states ---------- */

  if (!hasHydrated || itemLoading) return <Spinner />;

  if (!isLoggedIn) {
    return (
      <FullScreen>
        <MessageCard icon="🔐" title="Please login" text="You need to be logged in to make a booking.">
          <Link href="/login" style={primaryButton}>Login</Link>
        </MessageCard>
      </FullScreen>
    );
  }

  if (itemError || !item) {
    return (
      <FullScreen>
        <MessageCard icon="😕" title={itemError ?? 'Not found.'}>
          <Link href={isGear ? '/gear' : '/'} style={{ ...primaryButton, marginTop: '16px' }}>
            {isGear ? 'Browse gear' : 'Explore Trips'}
          </Link>
        </MessageCard>
      </FullScreen>
    );
  }

  /* ---------- form ---------- */

  return (
    <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingTop: '88px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <Link href={isGear ? `/gear/${slug}` : '/booking'} style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '13px', color: '#14b8a6', fontWeight: 600 }}>
            {isGear ? '← Back to the gear' : '← My bookings'}
          </span>
        </Link>

        <div style={{ margin: '16px 0 28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0a2e45', margin: '0 0 6px' }}>
            {isRent ? 'Rent this gear' : isBuy ? 'Buy this gear' : 'Book your trip'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {item.name} · {currency} {unitPrice.toLocaleString()} {priceUnit}
            {item.discountPercent > 0 && ` (${item.discountPercent}% off)`}
          </p>
        </div>

        {/* Dates */}
        <div style={card}>
          <h3 style={h3}>{isRent ? 'Rental dates' : isBuy ? 'When do you need it?' : 'Trip details'}</h3>

          {isRent && item.windows.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ ...label, marginBottom: '8px' }}>The owner can lend it during</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {item.windows.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setStartDate(w.start_date); setEndDate(w.end_date); }}
                    style={{ padding: '7px 12px', borderRadius: '999px', border: '1.5px solid #99f6e4', background: '#f0fdfa', color: '#0d9488', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {fmt(w.start_date)} to {fmt(w.end_date)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={grid}>
            <Field title={isRent ? 'Pick-up date *' : isBuy ? 'Preferred date *' : 'Start date *'}>
              <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={input} />
            </Field>
            {!isBuy && (
              <Field title={isRent ? 'Return date *' : 'End date'}>
                <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} style={input} />
              </Field>
            )}
            {!isGear && (
              <Field title="Number of participants *">
                <input type="number" min={1} max={50} value={numParticipants} onChange={(e) => changeParticipantCount(Number(e.target.value))} style={input} />
              </Field>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <Field title={isGear ? 'Message to the owner' : 'Special requests'}>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={isGear ? 'Pick-up time, your shoe size, anything the owner should know' : 'Dietary needs, room preferences, anything we should know'}
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div style={card}>
          <h3 style={h3}>Contact details</h3>
          <div style={grid}>
            <Field title="Full name *"><input value={contactName} onChange={(e) => setContactName(e.target.value)} style={input} /></Field>
            <Field title="Email *"><input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={input} /></Field>
            <Field title="Phone *"><input type="tel" maxLength={15} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={input} /></Field>
            <Field title="Emergency contact">
              <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Name and phone number" style={input} />
            </Field>
          </div>
        </div>

        {/* Participants (trips only) */}
        {!isGear && (
          <div style={card}>
            <h3 style={h3}>Participants ({participants.length})</h3>
            {participants.map((p, i) => (
              <div key={i} style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: i < participants.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f3d57, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  {i === 0 && (
                    <button type="button" onClick={() => updateParticipant(0, 'full_name', contactName)}
                      style={{ background: 'none', border: 'none', color: '#14b8a6', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Same as contact name
                    </button>
                  )}
                </div>
                <div style={grid}>
                  <Field title="Full name *"><input value={p.full_name} onChange={(e) => updateParticipant(i, 'full_name', e.target.value)} style={input} /></Field>
                  <Field title="Age *"><input type="number" min={0} value={p.age} onChange={(e) => updateParticipant(i, 'age', e.target.value)} style={input} /></Field>
                  <Field title="Nationality *"><input value={p.nationality} onChange={(e) => updateParticipant(i, 'nationality', e.target.value)} style={input} /></Field>
                  <Field title="Passport number"><input value={p.passport_number} onChange={(e) => updateParticipant(i, 'passport_number', e.target.value)} style={input} /></Field>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Field title="Medical conditions">
                    <input value={p.medical_conditions} onChange={(e) => updateParticipant(i, 'medical_conditions', e.target.value)} placeholder="Allergies, altitude sickness history, medication…" style={input} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment + summary */}
        <div style={card}>
          <h3 style={h3}>Payment</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map((m) => {
              const active = paymentMethod === m.value;
              return (
                <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: `1.5px solid ${active ? '#14b8a6' : '#e2e8f0'}`, background: active ? '#f0fdfa' : '#fff', color: active ? '#0d9488' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {m.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={summaryRow}>
              <span>
                {currency} {unitPrice.toLocaleString()}
                {isRent ? ` × ${days || '–'} day${days === 1 ? '' : 's'}` : isBuy ? '' : ` × ${numParticipants}`}
              </span>
              <span>{isRent && !days ? 'Pick your dates' : `${currency} ${subtotal.toLocaleString()}`}</span>
            </div>
            {isRent && deposit > 0 && (
              <div style={summaryRow}>
                <span>Refundable deposit</span>
                <span>{currency} {deposit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0a2e45' }}>
              <span>Total</span>
              <span>{isRent && !days ? '–' : `${currency} ${total.toLocaleString()}`}</span>
            </div>
            {isRent && deposit > 0 && (
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0' }}>
                You get the deposit back when you return the gear in the same condition.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px', whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: '14px 24px', borderRadius: '12px', border: 'none', background: '#14b8a6', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Creating booking…' : 'Confirm booking'}
        </button>
        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
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