import { FILTERS, matchesFilter, type Booking, type Filter } from '@/lib/bookingg';

interface Props {
  bookings: Booking[];
  filter: Filter;
  onFilterChange: (f: Filter) => void;
}

export default function BookingsHero({ bookings, filter, onFilterChange }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        padding: '112px 24px 100px', 
        color: '#fff',
      }}
    >
      <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0c48f' }}>Your adventures</div>
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            margin: '8px 0',
            textShadow: '0 2px 12px rgba(0,0,0,.35)',
          }}
        >
          My Bookings
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.88)', margin: 0, maxWidth: '520px' }}>
          Everything you&apos;ve booked, all in one place. Check details or change your plans anytime.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '26px' }}>
          {FILTERS.map(({ key, label }) => {
            const selected = filter === key;
            const count = bookings.filter((b) => matchesFilter(b, key)).length;
            return (
              <button
                key={key}
                className="bp-tab"
                onClick={() => onFilterChange(key)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  border: selected ? 'none' : '1px solid rgba(255,255,255,.3)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: selected ? '#fff' : 'rgba(10,26,38,.35)',
                  backdropFilter: selected ? undefined : 'blur(6px)',
                  color: selected ? '#0f3d57' : '#fff',
                }}
              >
                {label} <span style={{ opacity: 0.65 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}