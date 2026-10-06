import { authFetch } from '@/lib/authFetch';

/* ---------- types ---------- */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface Booking {
  id: number;
  booking_reference: string;
  booking_type: string;
  start_date: string;
  end_date?: string; // calculated by the backend, never sent from here
  num_participants: number;
  final_price: string;
  currency: string;
  payment_status: PaymentStatus;
  status: BookingStatus;
  created_at: string;
}

export const EDIT_LOCK_DAYS = 7;

/* ---------- dates ---------- */

export function parseDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d); // local date, no timezone shift
}

export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return toInputDate(d);
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

export function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
}

export function earliestAllowedStart(): string {
  return addDays(toInputDate(new Date()), EDIT_LOCK_DAYS);
}

/* ---------- booking rules ---------- */

export function isActive(b: Booking): boolean {
  return b.status === 'pending' || b.status === 'confirmed';
}

export function getEditState(b: Booking): { canEdit: boolean; message: string } {
  if (!isActive(b)) {
    return { canEdit: false, message: `A ${b.status} booking can't be changed.` };
  }
  if (daysUntil(b.start_date) < EDIT_LOCK_DAYS) {
    return {
      canEdit: false,
      message: `Changes are only possible up to ${EDIT_LOCK_DAYS} days before the trip starts.`,
    };
  }
  const lastDay = addDays(b.start_date, -EDIT_LOCK_DAYS);
  return { canEdit: true, message: `You can make changes until ${formatDate(lastDay)}.` };
}

export function tripLength(b: Booking): number | null {
  if (!b.end_date) return null;
  const diff = Math.round((parseDate(b.end_date).getTime() - parseDate(b.start_date).getTime()) / 86400000);
  return diff + 1;
}

export function countdownText(b: Booking): string {
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'refunded') return 'Refunded';
  if (b.status === 'completed') return 'Trip completed';
  const d = daysUntil(b.start_date);
  if (d > 1) return `Starts in ${d} days`;
  if (d === 1) return 'Starts tomorrow';
  if (d === 0) return 'Starts today';
  return 'Already started';
}

/* ---------- filtering, sorting, stats ---------- */

export type Filter = 'all' | 'upcoming' | 'completed' | 'cancelled';
export type Sort = 'soonest' | 'latest' | 'price_high' | 'price_low';

export const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function matchesFilter(b: Booking, filter: Filter): boolean {
  switch (filter) {
    case 'upcoming':
      return isActive(b);
    case 'completed':
      return b.status === 'completed';
    case 'cancelled':
      return b.status === 'cancelled' || b.status === 'refunded';
    default:
      return true;
  }
}

export function filterAndSort(
  bookings: Booking[],
  { filter, sort, search }: { filter: Filter; sort: Sort; search: string }
): Booking[] {
  const q = search.trim().toLowerCase();

  const list = bookings.filter(
    (b) =>
      matchesFilter(b, filter) &&
      (!q || b.booking_reference.toLowerCase().includes(q) || b.booking_type.toLowerCase().includes(q))
  );

  const price = (b: Booking) => Number(b.final_price);
  const sorters: Record<Sort, (a: Booking, b: Booking) => number> = {
    soonest: (a, b) => a.start_date.localeCompare(b.start_date),
    latest: (a, b) => b.start_date.localeCompare(a.start_date),
    price_high: (a, b) => price(b) - price(a),
    price_low: (a, b) => price(a) - price(b),
  };

  return list.sort(sorters[sort]);
}

export function getStats(bookings: Booking[]) {
  const upcoming = bookings.filter(isActive);
  const daysToTrips = upcoming.map((b) => daysUntil(b.start_date)).filter((d) => d >= 0);

  return {
    total: bookings.length,
    upcoming: upcoming.length,
    paid: bookings.filter((b) => b.payment_status === 'paid').length,
    nextTripInDays: daysToTrips.length ? Math.min(...daysToTrips) : null,
  };
}

/* ---------- api ---------- */

export async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data?.detail) return String(data.detail);
    if (data && typeof data === 'object') {
      const text = Object.values(data).flat().join(' ');
      if (text) return text;
    }
  } catch {
    /* response was not JSON */
  }
  return fallback;
}

export async function updateBooking(
  id: number,
  changes: { start_date: string; num_participants: number }
): Promise<{ booking?: Booking; error?: string }> {
  const res = await authFetch(`/bookings/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });

  if (!res.ok) {
    return { error: await readApiError(res, "We couldn't update your booking.") };
  }
  return { booking: (await res.json()) as Booking };
}