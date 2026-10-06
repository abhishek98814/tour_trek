'use client';

import { useState } from 'react';
import {
  countdownText,
  daysUntil,
  formatDate,
  getEditState,
  isActive,
  timeAgo,
  tripLength,
  type Booking,
} from '@/lib/bookingg';
import BookingEditForm from './BookingEditForm';
import { colorFor, darkButton, primaryButton } from './styles';
import { InfoCell, StatusBadge } from './ui';
import { canPay } from '@/lib/payment';
import PayButton from './PayButton';

interface Props {
  booking: Booking;
  index: number;
  compact: boolean;
  open: boolean;
  onToggle: () => void;
  onUpdated: (b: Booking) => void;
  onToast: (msg: string) => void;
}

export default function BookingCard({ booking, index, compact, open, onToggle, onUpdated, onToast }: Props) {
  const [editing, setEditing] = useState(false);

  const { canEdit, message: editMessage } = getEditState(booking);
  const active = isActive(booking);
  const isTrek = booking.booking_type.toLowerCase().includes('trek');
  const length = tripLength(booking);
  const daysLeft = daysUntil(booking.start_date);
  const accent = colorFor(booking.status).dot;

  // how close the trip is, on a 60-day window
  const progress = active ? Math.max(4, Math.min(100, Math.round((1 - daysLeft / 60) * 100))) : 100;

  function handleSaved(updated: Booking) {
    onUpdated(updated);
    setEditing(false);
    onToast('All done! Your booking has been updated.');
  }

  return (
    <div
      className={`bp-card ${open ? 'open' : ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid #e8ecf0',
        padding: compact ? '20px 20px 20px 26px' : '24px 24px 22px 30px',
        boxShadow: '0 2px 10px rgba(10,46,69,.04)',
        animationDelay: `${Math.min(index, 8) * 60}ms`,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: accent }} />

      {/* header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '15px',
              background: 'linear-gradient(135deg,#ecfeff,#f0fdfa)',
              border: '1px solid #ccfbf1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            {isTrek ? '🏔️' : '🧭'}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0a2e45' }}>{booking.booking_reference}</div>
            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'capitalize', marginTop: '2px' }}>
              {booking.booking_type.replace('_', ' ')} booking · booked {timeAgo(booking.created_at)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <StatusBadge value={booking.status} />
          <StatusBadge value={booking.payment_status} />
        </div>
      </div>

      {/* timeline */}
      <div style={{ marginTop: '18px', padding: '16px 18px', borderRadius: '14px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>START</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0a2e45' }}>{formatDate(booking.start_date)}</div>
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '4px 10px',
              borderRadius: '999px',
            }}
          >
            {length ? `${length} days` : '→'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>END</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0a2e45' }}>{formatDate(booking.end_date)}</div>
          </div>
        </div>

        <div style={{ marginTop: '12px', height: '8px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '999px',
              background: active ? 'linear-gradient(90deg,#14b8a6,#0ea5e9)' : accent,
              transition: 'width .6s ease',
            }}
          />
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          ⏳ {countdownText(booking)}
        </div>
      </div>

      {/* quick info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '14px',
          marginTop: '16px',
        }}
      >
        <InfoCell icon="👥" label="Travellers" value={`${booking.num_participants} person(s)`} />
        <InfoCell
          icon="💰"
          label="Total"
          value={`${booking.currency} ${Number(booking.final_price).toLocaleString()}`}
          bold
        />
      </div>

<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
  {active && (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '999px',
        background: canEdit ? '#f0fdfa' : '#fffbeb',
        color: canEdit ? '#0d9488' : '#a16207',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {canEdit ? '✏️ You can still edit' : '🔒 Editing closed'}
    </span>
  )}
  {canPay(booking) && <PayButton booking={booking} onError={onToast} />}
</div>


      {/* footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '18px',
        }}
      >
        <div>
          {active && (
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                background: canEdit ? '#f0fdfa' : '#fffbeb',
                color: canEdit ? '#0d9488' : '#a16207',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {canEdit ? '✏️ You can still edit' : '🔒 Editing closed'}
            </span>
          )}
        </div>

        <button
          className="bp-btn"
          onClick={onToggle}
          style={{
            ...(open ? { ...primaryButton, background: '#e2e8f0', color: '#475569' } : darkButton),
          }}
        >
          {open ? 'Hide details ▲' : 'View details ▼'}
        </button>
      </div>

      {/* expanded panel */}
      {open && (
        <div className="bp-panel" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
          {editing ? (
            <BookingEditForm booking={booking} onSaved={handleSaved} onCancel={() => setEditing(false)} />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                }}
              >
                {[
                  { icon: '🗓️', label: 'Booked on', value: formatDate(booking.created_at) },
                  { icon: '💳', label: 'Payment', value: booking.payment_status },
                  { icon: '📌', label: 'Status', value: booking.status },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #eef2f6',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                      {item.icon} {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0a2e45',
                        marginTop: '4px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {active && (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'flex',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: canEdit ? '#f0fdfa' : '#fffbeb',
                    border: `1px solid ${canEdit ? '#99f6e4' : '#fde68a'}`,
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{canEdit ? '🕒' : '🔒'}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: canEdit ? '#0f766e' : '#92400e' }}>
                      {canEdit ? 'Need to change something?' : 'Editing is closed'}
                    </div>
                    <div style={{ fontSize: '12px', color: canEdit ? '#0d9488' : '#a16207', marginTop: '2px' }}>
                      {editMessage}
                    </div>
                  </div>
                </div>
              )}

              {!active && (
                <div style={{ marginTop: '14px', fontSize: '13px', color: '#64748b' }}>{editMessage}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                {/* <button
                  className="bp-btn"
                  disabled={!canEdit}
                  title={editMessage}
                  onClick={() => setEditing(true)}
                  style={{
                    ...primaryButton,
                    background: canEdit ? primaryButton.background : '#e2e8f0',
                    color: canEdit ? '#fff' : '#94a3b8',
                    cursor: canEdit ? 'pointer' : 'not-allowed',
                  }}
                >
                  {canEdit ? '✏️ Edit booking' : '🔒 Can’t edit'}
                </button> */}

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            className="bp-btn"
            disabled={!canEdit}
            title={editMessage}
            onClick={() => setEditing(true)}
            style={{
              ...primaryButton,
              background: canEdit ? primaryButton.background : '#e2e8f0',
              color: canEdit ? '#fff' : '#94a3b8',
              cursor: canEdit ? 'pointer' : 'not-allowed',
            }}
          >
            {canEdit ? '✏️ Edit booking' : '🔒 Can’t edit'}
          </button>
          {canPay(booking) && <PayButton booking={booking} onError={onToast} />}
        </div>




              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}