'use client';

import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/authFetch';

export interface Booking {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date?: string; // calculated by backend, read-only
  num_participants: number;
  final_price: string;
  currency: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  created_at: string;
}

export const EDIT_LOCK_DAYS = 7;

/* ---------- shared helpers (also used by the page) ---------- */

export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d); // local date, no timezone shift
}

export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  return parseDate(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseDate(dateStr).getTime() - today.getTime()) / 86400000);
}

export function getEditState(booking: Booking): { canEdit: boolean; reason: string } {
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return { canEdit: false, reason: `A ${booking.status} booking cannot be edited.` };
  }
  if (daysUntil(booking.start_date) < EDIT_LOCK_DAYS) {
    return {
      canEdit: false,
      reason: `Editing is only allowed at least ${EDIT_LOCK_DAYS} days before the start date.`,
    };
  }
  return { canEdit: true, reason: '' };
}

export function countdownText(booking: Booking): string {
  if (booking.status === 'cancelled') return 'Cancelled';
  if (booking.status === 'refunded') return 'Refunded';
  if (booking.status === 'completed') return 'Completed';
  const d = daysUntil(booking.start_date);
  if (d > 1) return `Starts in ${d} days`;
  if (d === 1) return 'Starts tomorrow';
  if (d === 0) return 'Starts today';
  return 'In progress / past';
}

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return toInputDate(d);
}

const badgeColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
  confirmed: { bg: '#f0fdfa', text: '#0d9488', dot: '#14b8a6' },
  cancelled: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  completed: { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  refunded: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  unpaid: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  partial: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
  paid: { bg: '#f0fdfa', text: '#0d9488', dot: '#14b8a6' },
};

const css = `
@keyframes bm-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes bm-pop { from { opacity: 0; transform: translateY(16px) scale(.97) } to { opacity: 1; transform: none } }
@keyframes bm-slide { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
.bm-overlay { animation: bm-fade .2s ease; }
.bm-dialog { animation: bm-pop .28s cubic-bezier(.2,.8,.2,1); }
.bm-edit-box { animation: bm-slide .25s ease; }
.bm-btn { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; }
.bm-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15,61,87,.18); }
.bm-input:focus { outline: none; border-color: #14b8a6 !important; box-shadow: 0 0 0 4px rgba(20,184,166,.15); }
.bm-step:not(:disabled):hover { background: #ccfbf1 !important; }
`;

const buttonBase: React.CSSProperties = {
  padding: '11px 22px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
};

function Badge({ value, dark = false }: { value: string; dark?: boolean }) {
  const c = badgeColors[value] || badgeColors.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        background: dark ? 'rgba(255,255,255,.16)' : c.bg,
        color: dark ? '#fff' : c.text,
        textTransform: 'capitalize',
        backdropFilter: dark ? 'blur(4px)' : undefined,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
      {value}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  children,
  highlight = false,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '14px',
        background: highlight ? 'linear-gradient(135deg,#f0fdfa,#ecfeff)' : '#f8fafc',
        border: `1px solid ${highlight ? '#99f6e4' : '#eef2f6'}`,
      }}
    >
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0a2e45' }}>{children}</div>
    </div>
  );
}

/* ---------- component ---------- */

interface Props {
  booking: Booking;
  onClose: () => void;
  onUpdated: (updated: Booking) => void;
}

export default function BookingModal({ booking, onClose, onUpdated }: Props) {
  const { canEdit, reason } = getEditState(booking);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const [startDate, setStartDate] = useState(booking.start_date);
  const [participants, setParticipants] = useState(booking.num_participants);

  // earliest date the user is allowed to pick
  const minStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + EDIT_LOCK_DAYS);
    return toInputDate(d);
  }, []);

  // trip length in days, derived from the saved booking (end - start + 1)
  const durationDays = useMemo(() => {
    if (!booking.end_date) return null;
    const diff = Math.round(
      (parseDate(booking.end_date).getTime() - parseDate(booking.start_date).getTime()) / 86400000
    );
    return diff + 1;
  }, [booking.start_date, booking.end_date]);

  // live preview while editing (backend stays the source of truth)
  const previewEnd =
    durationDays && startDate ? addDays(startDate, durationDays - 1) : booking.end_date;

  const unitPrice = booking.num_participants > 0 ? Number(booking.final_price) / booking.num_participants : 0;
  const estimatedTotal = unitPrice * (participants > 0 ? participants : 0);

  // close on Escape + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, saving]);

  function startEdit() {
    setJustSaved(false);
    setFormError(null);
    setIsEditing(true);
  }

  function resetForm() {
    setStartDate(booking.start_date);
    setParticipants(booking.num_participants);
    setFormError(null);
    setIsEditing(false);
  }

  const hasChanges =
    startDate !== booking.start_date || participants !== booking.num_participants;

  async function handleSave() {
    setFormError(null);

    if (!startDate) return setFormError('Please select a start date.');
    if (startDate < minStartStr) {
      return setFormError(`Start date must be at least ${EDIT_LOCK_DAYS} days from today.`);
    }
    if (!Number.isInteger(participants) || participants < 1) {
      return setFormError('Participants must be at least 1.');
    }
    if (!hasChanges) {
      return setFormError('You have not changed anything.');
    }

    setSaving(true);
    try {
      const res = await authFetch(`/bookings/${booking.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          num_participants: participants,
        }),
      });

      if (!res.ok) {
        let message = 'Could not update the booking.';
        try {
          const data = await res.json();
          message =
            data.detail ||
            (typeof data === 'object' ? Object.values(data).flat().join(' ') : message) ||
            message;
        } catch {
          /* keep default message */
        }
        setFormError(message);
        return;
      }

      const updated: Booking = await res.json();
      onUpdated({ ...booking, ...updated }); // updated end_date comes from backend
      setStartDate(updated.start_date ?? startDate);
      setParticipants(updated.num_participants ?? participants);
      setIsEditing(false);
      setJustSaved(true);
    } catch (err) {
      console.error('UPDATE BOOKING ERROR:', err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isTrek = booking.booking_type.toLowerCase().includes('trek');
  const daysLeft = daysUntil(booking.start_date);
  const showCountdown = ['pending', 'confirmed'].includes(booking.status);

  return (
    <div
      className="bm-overlay"
      onClick={() => !saving && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 30, 46, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
    >
      <style>{css}</style>

      <div
        className="bm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Booking ${booking.booking_reference}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,.35)',
        }}
      >
        {/* ---------- header ---------- */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '28px 28px 26px',
            background: 'linear-gradient(135deg,#0a2e45 0%,#0f3d57 45%,#0d9488 100%)',
            color: '#fff',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.07)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 50,
              bottom: -60,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.05)',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                {isTrek ? '🏔️' : '🧭'}
              </div>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '1.5px', opacity: 0.75, fontWeight: 700 }}>
                  {booking.booking_type.replace('_', ' ').toUpperCase()} BOOKING
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>
                  {booking.booking_reference}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="bm-btn"
              style={{
                ...buttonBase,
                padding: '8px 13px',
                background: 'rgba(255,255,255,.16)',
                color: '#fff',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
            <Badge value={booking.status} dark />
            <Badge value={booking.payment_status} dark />
            {showCountdown && (
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#fff',
                  color: '#0f3d57',
                }}
              >
                ⏳ {countdownText(booking)}
              </span>
            )}
          </div>
        </div>

        {/* ---------- body ---------- */}
        <div style={{ padding: '24px 28px 28px' }}>
          {justSaved && (
            <div
              role="status"
              style={{
                marginBottom: '18px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                color: '#0d9488',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ✅ Booking updated successfully.
            </div>
          )}

          {/* date timeline */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #eef2f6',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: '0 0 auto' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>START</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0a2e45' }}>
                  {formatDate(isEditing ? startDate : booking.start_date)}
                </div>
              </div>

              <div style={{ flex: 1, position: 'relative', height: '24px' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '11px',
                    borderTop: '2px dashed #cbd5e1',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    transform: 'translateX(-50%)',
                    background: '#f8fafc',
                    padding: '0 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0d9488',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {durationDays ? `${durationDays} days` : '→'}
                </div>
              </div>

              <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>END</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0a2e45' }}>
                  {formatDate(isEditing ? previewEnd : booking.end_date)}
                </div>
              </div>
            </div>
            {isEditing && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                End date is calculated automatically from the trip duration.
              </div>
            )}
          </div>

          {/* info cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <InfoCard icon="👥" label="Participants">
              {booking.num_participants} person(s)
            </InfoCard>
            <InfoCard icon="💰" label="Total" highlight>
              {booking.currency} {Number(booking.final_price).toLocaleString()}
            </InfoCard>
            <InfoCard icon="🗓️" label="Booked On">
              {formatDate(booking.created_at.slice(0, 10))}
            </InfoCard>
          </div>

          {/* ---------- edit section ---------- */}
          {isEditing ? (
            <div
              className="bm-edit-box"
              style={{
                marginTop: '22px',
                padding: '20px',
                borderRadius: '18px',
                border: '2px solid #99f6e4',
                background: 'linear-gradient(180deg,#f0fdfa,#fff)',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0a2e45', marginBottom: '16px' }}>
                ✏️ Edit your booking
              </div>

              <label style={{ display: 'block' }}>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
                  New start date
                </div>
                <input
                  className="bm-input"
                  type="date"
                  value={startDate}
                  min={minStartStr}
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
                  Earliest allowed: {formatDate(minStartStr)}
                </div>
              </label>

              <div style={{ marginTop: '18px' }}>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
                  Participants
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="bm-step"
                    onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                    disabled={participants <= 1}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      border: '1.5px solid #99f6e4',
                      background: '#f0fdfa',
                      color: '#0d9488',
                      fontSize: '20px',
                      fontWeight: 700,
                      cursor: participants <= 1 ? 'not-allowed' : 'pointer',
                      opacity: participants <= 1 ? 0.5 : 1,
                    }}
                  >
                    −
                  </button>
                  <input
                    className="bm-input"
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
                    className="bm-step"
                    onClick={() => setParticipants((p) => (Number.isFinite(p) ? p : 0) + 1)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      border: '1.5px solid #99f6e4',
                      background: '#f0fdfa',
                      color: '#0d9488',
                      fontSize: '20px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {unitPrice > 0 && participants >= 1 && (
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
                Final price is confirmed by the server after saving.
              </div>
            </div>
          ) : (
            !canEdit && (
              <div
                style={{
                  marginTop: '22px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                }}
              >
                <div style={{ fontSize: '20px' }}>🔒</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>Editing is locked</div>
                  <div style={{ fontSize: '12px', color: '#a16207', marginTop: '2px' }}>{reason}</div>
                </div>
              </div>
            )
          )}

          {formError && (
            <div
              role="alert"
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ⚠️ {formError}
            </div>
          )}

          {/* ---------- footer ---------- */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {isEditing ? (
              <>
                <button
                  className="bm-btn"
                  onClick={resetForm}
                  disabled={saving}
                  style={{ ...buttonBase, background: '#f1f5f9', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  className="bm-btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...buttonBase,
                    background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
                    color: '#fff',
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  className="bm-btn"
                  onClick={onClose}
                  style={{ ...buttonBase, background: '#f1f5f9', color: '#475569' }}
                >
                  Close
                </button>
                <button
                  className="bm-btn"
                  onClick={startEdit}
                  disabled={!canEdit}
                  title={canEdit ? 'Edit booking' : reason}
                  style={{
                    ...buttonBase,
                    background: canEdit ? 'linear-gradient(135deg,#0f3d57,#0a2e45)' : '#e2e8f0',
                    color: canEdit ? '#fff' : '#94a3b8',
                    cursor: canEdit ? 'pointer' : 'not-allowed',
                  }}
                >
                  {canEdit ? '✏️ Edit Booking' : '🔒 Edit Locked'}
                </button>
              </>
            )}
          </div>

          {canEdit && !isEditing && (
            <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '11px', color: '#94a3b8' }}>
              You can edit this booking for another {Math.max(daysLeft - EDIT_LOCK_DAYS, 0)} day(s).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}