'use client';

import { useState, type CSSProperties } from 'react';
import {
  addDays,
  earliestAllowedStart,
  EDIT_LOCK_DAYS,
  formatDate,
  tripLength,
  updateBooking,
  type Booking,
} from '@/lib/bookingg';
import { primaryButton, softButton } from './styles';

interface Props {
  booking: Booking;
  onSaved: (updated: Booking) => void;
  onCancel: () => void;
}

const stepButton: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: '12px',
  border: '1.5px solid #99f6e4',
  background: '#f0fdfa',
  color: '#0d9488',
  fontSize: '20px',
  fontWeight: 700,
};

const labelStyle: CSSProperties = { fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '6px' };

export default function BookingEditForm({ booking, onSaved, onCancel }: Props) {
  const [startDate, setStartDate] = useState(booking.start_date);
  const [participants, setParticipants] = useState(booking.num_participants);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const earliest = earliestAllowedStart();
  const length = tripLength(booking);
  const newEnd = length && startDate ? addDays(startDate, length - 1) : booking.end_date;

  const pricePerPerson = booking.num_participants > 0 ? Number(booking.final_price) / booking.num_participants : 0;
  const estimatedTotal = pricePerPerson * Math.max(participants, 0);
  const changed = startDate !== booking.start_date || participants !== booking.num_participants;

  async function handleSave() {
    setError(null);

    if (!startDate) return setError('Please pick a start date.');
    if (startDate < earliest) {
      return setError(`Your new start date must be at least ${EDIT_LOCK_DAYS} days from today.`);
    }
    if (!Number.isInteger(participants) || participants < 1) {
      return setError('You need at least 1 participant.');
    }
    if (!changed) return setError("You haven't changed anything yet.");

    setSaving(true);
    try {
      const { booking: updated, error: apiError } = await updateBooking(booking.id, {
        start_date: startDate,
        num_participants: participants,
      });

      if (apiError || !updated) {
        setError(apiError ?? "We couldn't update your booking.");
        return;
      }
      onSaved({ ...booking, ...updated });
    } catch (err) {
      console.error('UPDATE BOOKING ERROR:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '18px',
        border: '2px solid #99f6e4',
        background: 'linear-gradient(180deg,#f0fdfa,#fff)',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0a2e45', marginBottom: '16px' }}>
        ✏️ Change your booking
      </div>

      <label style={{ display: 'block' }}>
        <div style={labelStyle}>New start date</div>
        <input
          className="bp-input"
          type="date"
          value={startDate}
          min={earliest}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            fontSize: '14px',
            color: '#0a2e45',
            boxSizing: 'border-box',
            background: '#fff',
          }}
        />
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
          Earliest you can pick: {formatDate(earliest)}
          {newEnd && startDate ? ` · Your trip would end on ${formatDate(newEnd)}` : ''}
        </div>
      </label>

      <div style={{ marginTop: '18px' }}>
        <div style={labelStyle}>How many people?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="bp-step"
            disabled={participants <= 1}
            onClick={() => setParticipants((p) => Math.max(1, p - 1))}
            style={{
              ...stepButton,
              cursor: participants <= 1 ? 'not-allowed' : 'pointer',
              opacity: participants <= 1 ? 0.5 : 1,
            }}
          >
            −
          </button>
          <input
            className="bp-input"
            type="number"
            min={1}
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            style={{
              width: '80px',
              textAlign: 'center',
              padding: '11px 8px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0a2e45',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            className="bp-step"
            onClick={() => setParticipants((p) => (Number.isFinite(p) ? p : 0) + 1)}
            style={{ ...stepButton, cursor: 'pointer' }}
          >
            +
          </button>
        </div>
      </div>

      {pricePerPerson > 0 && participants >= 1 && (
        <div
          style={{
            marginTop: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#0a2e45',
            color: '#fff',
          }}
        >
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Estimated new total</span>
          <span style={{ fontSize: '16px', fontWeight: 800 }}>
            {booking.currency} {Math.round(estimatedTotal).toLocaleString()}
          </span>
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
        This is just an estimate. We&apos;ll confirm the final price when you save.
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: '14px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
        <button className="bp-btn" onClick={onCancel} disabled={saving} style={softButton}>
          Cancel
        </button>
        <button
          className="bp-btn"
          onClick={handleSave}
          disabled={saving}
          style={{
            ...primaryButton,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}