'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/useToast';
import { filterAndSort, getStats, type Filter, type Sort } from '@/lib/bookingg';
import BookingCard from '@/components/booking/BookCard';
import BookingsHero from '@/components/booking/BookingsHero';
import BookingsHeroImages from '../../../components/booking/BookingsHeroImages';
import { StatsRow, Toolbar } from '@/components/booking/BookingsToolbar';
import { primaryButton } from '@/components/booking/styles';
import { BookingStyles, FullScreen, MessageCard, SkeletonCard, Toast } from '@/components/booking/ui';
import langtang from '../../../public/Langtang.jpg';
import everest from '../../../public/everest.jpg';

// Imported images are objects, the URL is `.src`
const HERO_IMAGES = [langtang.src, everest.src];

function LoadingScreen() {
  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', paddingTop: '120px' }}>
      <BookingStyles />
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div className="bp-skel" style={{ height: 120, borderRadius: 24 }} />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { accessToken, hasHydrated } = useAuthStore();
  const isLoggedIn = !!accessToken;

  const { bookings, loading, loadingMore, error, hasMore, retry, loadMore, replaceBooking } = useBookings(
    hasHydrated && isLoggedIn
  );
  const toast = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('soonest');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [openId, setOpenId] = useState<number | null>(null);

  const stats = useMemo(() => getStats(bookings), [bookings]);
  const visible = useMemo(() => filterAndSort(bookings, { filter, sort, search }), [bookings, filter, sort, search]);

  /* ----- before the list is ready ----- */

  if (!hasHydrated) return <LoadingScreen />;

  if (!isLoggedIn) {
    return (
      <FullScreen>
        <MessageCard icon="🔐" title="Please log in" text="Log in to see your bookings.">
          <Link href="/login" style={primaryButton}>
            Log in
          </Link>
        </MessageCard>
      </FullScreen>
    );
  }

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <FullScreen>
        <MessageCard icon="😕" title={error.message}>
          {error.unauthorized ? (
            <Link href="/login" style={{ ...primaryButton, marginTop: '16px' }}>
              Log in again
            </Link>
          ) : (
            <button onClick={retry} style={{ ...primaryButton, marginTop: '16px' }}>
              Try again
            </button>
          )}
        </MessageCard>
      </FullScreen>
    );
  }

  /* ----- main page ----- */

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', paddingBottom: '80px' }}>
      <BookingStyles />

      {/* Photos slide behind the hero; the hero content sits on top */}
      <div style={{ position: 'relative' }}>
        <BookingsHeroImages images={HERO_IMAGES} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BookingsHero bookings={bookings} filter={filter} onFilterChange={setFilter} />
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '-56px auto 0', padding: '0 24px', position: 'relative' }}>
        <StatsRow stats={stats} />

        {bookings.length > 0 && (
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        )}

        <div style={{ marginTop: '22px' }}>
          {bookings.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: '24px',
                border: '1px solid #e8ecf0',
                padding: '64px 24px',
                textAlign: 'center',
              }}
            >
              <div className="bp-float" style={{ fontSize: '56px', marginBottom: '16px' }}>
                🎒
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0a2e45', margin: '0 0 8px' }}>
                No bookings yet
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 22px' }}>
                Your next adventure is waiting. Pick a tour or trek to get started.
              </p>
              <Link href="/" style={primaryButton}>
                Explore trips
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                border: '1px dashed #cbd5e1',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              🔎 Nothing matches your search or filter.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(360px, 1fr))' : '1fr',
                gap: '16px',
                alignItems: 'start',
              }}
            >
              {visible.map((booking, i) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={i}
                  compact={view === 'grid'}
                  open={openId === booking.id}
                  onToggle={() => setOpenId((current) => (current === booking.id ? null : booking.id))}
                  onUpdated={replaceBooking}
                  onToast={toast.show}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                className="bp-btn"
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  ...primaryButton,
                  opacity: loadingMore ? 0.6 : 1,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingMore ? 'Loading…' : 'Show more'}
              </button>
            </div>
          )}
        </div>
      </div>

      {toast.message && <Toast message={toast.message} />}
    </div>
  );
}