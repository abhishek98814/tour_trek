import type { CSSProperties } from 'react';
import type { Sort } from '@/lib/bookingg';

interface Stats {
  total: number;
  upcoming: number;
  paid: number;
  nextTripInDays: number | null;
}

export function StatsRow({ stats }: { stats: Stats }) {
  const nextTrip =
    stats.nextTripInDays === null ? '—' : stats.nextTripInDays === 0 ? 'Today' : `${stats.nextTripInDays}d`;

  const cards = [
    { icon: '📋', label: 'Total bookings', value: String(stats.total) },
    { icon: '🎒', label: 'Upcoming', value: String(stats.upcoming) },
    { icon: '✅', label: 'Paid', value: String(stats.paid) },
    { icon: '⏱️', label: 'Next trip', value: nextTrip },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="bp-stat"
          style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '18px 20px',
            border: '1px solid #e8ecf0',
            boxShadow: '0 10px 30px rgba(10,46,69,.08)',
          }}
        >
          <div style={{ fontSize: '20px' }}>{c.icon}</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0a2e45', marginTop: '6px' }}>{c.value}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

const controlStyle: CSSProperties = {
  padding: '11px 14px',
  borderRadius: '12px',
  border: '1.5px solid #e2e8f0',
  background: '#fff',
  fontSize: '13px',
  color: '#0a2e45',
};

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: Sort;
  onSortChange: (s: Sort) => void;
  view: 'list' | 'grid';
  onViewChange: (v: 'list' | 'grid') => void;
}

export function Toolbar({ search, onSearchChange, sort, onSortChange, view, onViewChange }: ToolbarProps) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '26px' }}>
      <input
        className="bp-input"
        type="text"
        placeholder="🔍  Search by reference or type…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ ...controlStyle, flex: '1 1 220px', minWidth: 0 }}
      />

      <select
        className="bp-input"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as Sort)}
        style={{ ...controlStyle, cursor: 'pointer' }}
      >
        <option value="soonest">Soonest first</option>
        <option value="latest">Latest first</option>
        <option value="price_high">Price: high to low</option>
        <option value="price_low">Price: low to high</option>
      </select>

      <div
        style={{
          display: 'flex',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {(['list', 'grid'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            aria-label={`${v} view`}
            style={{
              padding: '11px 14px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              background: view === v ? '#0f3d57' : 'transparent',
              color: view === v ? '#fff' : '#64748b',
            }}
          >
            {v === 'list' ? '☰' : '▦'}
          </button>
        ))}
      </div>
    </div>
  );
}