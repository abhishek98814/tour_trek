'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Compass,
  Map as MapIcon,
  Mountain,
  Package,
  Settings,
  LayoutGrid,
  Store,
  type LucideIcon,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useBookings } from '@/hooks/useBookings';
import { countdownText, formatDate, isActive, type Booking } from '@/lib/bookingg';
import { fetchList, getProfile, GEAR_ENDPOINT, mediaUrl, type UserProfile } from '@/lib/profile';
import ProfileSettings from '@/components/dashboard/ProfileSettings';

const serif = Fraunces({ subsets: ['latin'], display: 'swap' });

/* ---------- types & helpers ---------- */

type TabKey = 'overview' | 'treks' | 'tours' | 'gear' | 'listings' | 'settings';

interface GearOrder {
  id: number | string;
  order_number?: string;
  reference?: string;
  status?: string;
  total_price?: number | string;
  total_amount?: number | string;
  currency?: string;
  created_at?: string;
}

interface MyTour {
  id: number;
  slug: string;
  title: string;
  destination?: string;
  price_per_person?: number | string;
  total_bookings?: number;
}

const statusStyle: Record<string, string> = {
  pending: 'bg-[#fef9c3] text-[#854d0e]',
  confirmed: 'bg-[#dcfce7] text-[#166534]',
  completed: 'bg-[#dbeafe] text-[#1d4ed8]',
  cancelled: 'bg-[#fee2e2] text-[#b91c1c]',
  refunded: 'bg-[#e2e8f0] text-[#475569]',
  paid: 'bg-[#dcfce7] text-[#166534]',
  unpaid: 'bg-[#fee2e2] text-[#b91c1c]',
  partial: 'bg-[#fef9c3] text-[#854d0e]',
};

const isType = (b: Booking, type: string) => b.booking_type.toLowerCase().includes(type);

function Pill({ value }: { value: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[value] ?? 'bg-[#e2e8f0] text-[#475569]'}`}>
      {value}
    </span>
  );
}

function EmptyState({ icon: Icon, title, text, href, cta }: { icon: LucideIcon; title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-[#cbd5e1] bg-white px-6 py-14 text-center">
      <Icon className="mx-auto mb-4 h-10 w-10 text-[#b6c0c7]" strokeWidth={1.3} />
      <h3 className={`${serif.className} mb-2 text-xl font-semibold text-[#17242f]`}>{title}</h3>
      <p className="mb-5 text-sm text-[#64748b]">{text}</p>
      {href && cta && (
        <Link href={href} className="inline-block rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#1f8f86]">
          {cta}
        </Link>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const Icon = isType(booking, 'trek') ? Mountain : Compass;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e3e7ea] bg-white p-4 transition-shadow hover:shadow-[0_10px_28px_-14px_rgba(15,61,87,0.3)]">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#e6f4f2] text-[#1f8f86]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-[#17242f]">{booking.booking_reference}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#64748b]">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(booking.start_date)}
            {booking.end_date ? ` → ${formatDate(booking.end_date)}` : ''}
            <span className="text-[#94a3b8]">·</span>
            {booking.num_participants} {booking.num_participants === 1 ? 'person' : 'people'}
          </p>
          {isActive(booking) && <p className="mt-0.5 text-xs font-medium text-[#1f8f86]">{countdownText(booking)}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-bold text-[#17242f]">
            {booking.currency} {Number(booking.final_price).toLocaleString()}
          </p>
          <div className="mt-1 flex justify-end gap-1.5">
            <Pill value={booking.status} />
            <Pill value={booking.payment_status} />
          </div>
        </div>
        <Link href="/booking" className="rounded border border-[#d5dbe0] px-3.5 py-2 text-sm font-semibold text-[#17242f] no-underline transition-colors hover:border-[#1f8f86] hover:text-[#1f8f86]">
          Manage
        </Link>
      </div>
    </div>
  );
}

function BookingList({ items, emptyIcon, emptyTitle, emptyText, href, cta }: {
  items: Booking[]; emptyIcon: LucideIcon; emptyTitle: string; emptyText: string; href: string; cta: string;
}) {
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} href={href} cta={cta} />;
  }
  return (
    <div className="space-y-3">
      {items.map((b) => (
        <BookingRow key={b.id} booking={b} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      <div className="h-[260px] animate-pulse bg-[#dfe5e8]" />
      <div className="mx-auto max-w-[1200px] space-y-3 px-6 py-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[#e6eaed]" />
        ))}
      </div>
    </main>
  );
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const { accessToken, hasHydrated } = useAuthStore();
  const isLoggedIn = !!accessToken;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<{ message: string; unauthorized: boolean } | null>(null);

  const { bookings, loading: bookingsLoading, hasMore, loadingMore, loadMore } = useBookings(hasHydrated && isLoggedIn);

  const [gear, setGear] = useState<GearOrder[] | null | undefined>(undefined); // undefined = loading, null = failed
  const [myTours, setMyTours] = useState<MyTour[] | null | undefined>(undefined);
  const [tab, setTab] = useState<TabKey>('overview');

  const canList = profile ? ['guide', 'agency', 'admin'].includes(profile.role) : false;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) {
      setProfileLoading(false);
      return;
    }
    (async () => {
      const { profile: p, error, unauthorized } = await getProfile();
      if (p) setProfile(p);
      else setProfileError({ message: error ?? "We couldn't load your profile.", unauthorized: !!unauthorized });
      setProfileLoading(false);
    })();
  }, [hasHydrated, isLoggedIn]);

  useEffect(() => {
    if (!profile) return;
    fetchList<GearOrder>(GEAR_ENDPOINT).then(setGear);
    if (canList) fetchList<MyTour>('/tours/my-tours/').then(setMyTours);
  }, [profile, canList]);

  const treks = useMemo(() => bookings.filter((b) => isType(b, 'trek')), [bookings]);
  const tours = useMemo(() => bookings.filter((b) => isType(b, 'tour')), [bookings]);
  const upcoming = useMemo(
    () => bookings.filter(isActive).sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [bookings]
  );

  const tabs: { key: TabKey; label: string; icon: LucideIcon; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid },
    { key: 'treks', label: 'My treks', icon: Mountain, count: treks.length },
    { key: 'tours', label: 'My tours', icon: Compass, count: tours.length },
    { key: 'gear', label: 'Gear orders', icon: Package, count: gear?.length ?? 0 },
    ...(canList ? [{ key: 'listings' as TabKey, label: 'My listings', icon: Store, count: myTours?.length ?? 0 }] : []),
    { key: 'settings', label: 'Profile settings', icon: Settings },
  ];

  /* ----- before the dashboard is ready ----- */

  if (!hasHydrated || profileLoading) return <Skeleton />;

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className={`${serif.className} text-2xl font-semibold text-[#17242f]`}>Please log in</p>
        <p className="text-sm text-[#64748b]">Log in to see your dashboard.</p>
        <Link href="/login" className="mt-2 rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#1f8f86]">
          Log in
        </Link>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-[#b91c1c]" />
        <p className="text-base font-semibold text-[#17242f]">{profileError?.message ?? "We couldn't load your profile."}</p>
        {profileError?.unauthorized ? (
          <Link href="/login" className="rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#1f8f86]">
            Log in again
          </Link>
        ) : (
          <button onClick={() => window.location.reload()} className="rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f8f86]">
            Try again
          </button>
        )}
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;
  const avatar = mediaUrl(profile.profile_picture);
  const stats = [
    { icon: MapIcon, label: 'Total bookings', value: bookings.length },
    { icon: Mountain, label: 'Treks', value: treks.length },
    { icon: Compass, label: 'Tours', value: tours.length },
    { icon: Package, label: 'Gear orders', value: gear?.length ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      {/* ---------- Header ---------- */}
      <section className="relative overflow-hidden bg-[#0f3d57]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1a26] via-[#0f3d57] to-[#1f8f86]/70" />
        <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center gap-6 px-6 pb-14 pt-28">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-[#1f8f86]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-white">
                {fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-sm font-medium text-[#f0c48f]">Your dashboard</p>
            <h1 className={`${serif.className} text-[clamp(28px,4.5vw,44px)] font-semibold leading-tight text-white`}>{fullName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/70">@{profile.username}</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold capitalize text-white">{profile.role}</span>
              {profile.is_verified && (
                <span className="flex items-center gap-1 rounded-full bg-[#dd8a3c] px-2.5 py-1 text-xs font-semibold text-white">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              <span className="text-xs text-white/60">Member since {formatDate(profile.created_at)}</span>
            </div>
            {profile.bio && <p className="mt-3 max-w-[620px] text-sm text-white/80">{profile.bio}</p>}
          </div>
        </div>
      </section>

      {/* ---------- Sticky tabs ---------- */}
      <section className="sticky top-[72px] z-[100] border-b border-[#e3e7ea] bg-[#f7f8f6]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 overflow-x-auto px-6">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap py-4 text-sm font-medium transition-colors ${
                  active ? 'text-[#17242f]' : 'text-[#64748b] hover:text-[#17242f]'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="rounded-full bg-[#e6f4f2] px-1.5 text-xs font-semibold text-[#1f8f86]">{t.count}</span>
                )}
                <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-[#1f8f86] transition-transform duration-200 ${active ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- Content ---------- */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
        {bookingsLoading && tab !== 'settings' && tab !== 'gear' && tab !== 'listings' ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#e6eaed]" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#e3e7ea] bg-white p-5">
                      <s.icon className="mb-3 h-5 w-5 text-[#1f8f86]" />
                      <p className={`${serif.className} text-3xl font-semibold text-[#17242f]`}>{s.value}</p>
                      <p className="mt-0.5 text-sm text-[#64748b]">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className={`${serif.className} text-2xl font-semibold text-[#17242f]`}>Upcoming trips</h2>
                    <Link href="/booking" className="text-sm font-semibold text-[#1f8f86] no-underline hover:underline">
                      All bookings →
                    </Link>
                  </div>
                  {upcoming.length === 0 ? (
                    <EmptyState icon={MapIcon} title="No upcoming trips" text="Pick a trek or tour and your next adventure will show up here." href="/trek" cta="Explore treks" />
                  ) : (
                    <div className="space-y-3">
                      {upcoming.slice(0, 3).map((b) => (
                        <BookingRow key={b.id} booking={b} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'treks' && (
              <BookingList items={treks} emptyIcon={Mountain} emptyTitle="No trek bookings yet" emptyText="Treks you book will be listed here." href="/trek" cta="Explore treks" />
            )}

            {tab === 'tours' && (
              <BookingList items={tours} emptyIcon={Compass} emptyTitle="No tour bookings yet" emptyText="Tours you book will be listed here." href="/tour" cta="Explore tours" />
            )}

            {tab === 'gear' &&
              (gear === undefined ? (
                <div className="h-20 animate-pulse rounded-xl bg-[#e6eaed]" />
              ) : !gear || gear.length === 0 ? (
                <EmptyState icon={Package} title="No gear orders yet" text="Gear you order or rent will be listed here." href="/gear" cta="Browse gear" />
              ) : (
                <div className="space-y-3">
                  {gear.map((g) => (
                    <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3e7ea] bg-white p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fdf1e3] text-[#dd8a3c]">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#17242f]">{g.order_number || g.reference || `Order #${g.id}`}</p>
                          {g.created_at && <p className="text-sm text-[#64748b]">{formatDate(g.created_at)}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(g.total_price || g.total_amount) && (
                          <span className="font-bold text-[#17242f]">
                            {g.currency ?? 'NPR'} {Number(g.total_price ?? g.total_amount).toLocaleString()}
                          </span>
                        )}
                        {g.status && <Pill value={g.status} />}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {tab === 'listings' && canList &&
              (myTours === undefined ? (
                <div className="h-20 animate-pulse rounded-xl bg-[#e6eaed]" />
              ) : !myTours || myTours.length === 0 ? (
                <EmptyState icon={Store} title="No listings yet" text="Tours you create will show up here." />
              ) : (
                <div className="space-y-3">
                  {myTours.map((t) => (
                    <Link key={t.id} href={`/tour/${t.slug}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3e7ea] bg-white p-4 no-underline transition-shadow hover:shadow-[0_10px_28px_-14px_rgba(15,61,87,0.3)]">
                      <div>
                        <p className="font-semibold text-[#17242f]">{t.title}</p>
                        {t.destination && <p className="text-sm text-[#64748b]">{t.destination}</p>}
                      </div>
                      <div className="text-right text-sm text-[#64748b]">
                        {t.price_per_person && <p className="font-bold text-[#17242f]">NPR {Math.round(Number(t.price_per_person)).toLocaleString()}</p>}
                        <p>{t.total_bookings ?? 0} bookings</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}

            {tab === 'settings' && <ProfileSettings profile={profile} serifClass={serif.className} onSaved={setProfile} />}

            {hasMore && ['overview', 'treks', 'tours'].includes(tab) && (
              <div className="mt-8 text-center">
                <button onClick={loadMore} disabled={loadingMore} className="rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f8f86] disabled:opacity-60">
                  {loadingMore ? 'Loading…' : 'Show more bookings'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}