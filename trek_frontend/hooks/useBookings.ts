'use client';

import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type { Booking } from '@/lib/bookingg';

interface LoadError {
  message: string;
  unauthorized: boolean;
}

export function useBookings(enabled: boolean) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<LoadError | null>(null);

  // url = a DRF "next" page link; without it we load the first page
  const load = useCallback(async (url?: string) => {
    const appending = !!url;

    try {
      const res = await authFetch(url ?? '/bookings/');

      if (!res.ok) {
        const expired = res.status === 401;
        setError({
          message: expired ? 'Your session has expired.' : "We couldn't load your bookings.",
          unauthorized: expired,
        });
        return;
      }

      const data = await res.json();
      const items: Booking[] = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];

      setBookings((prev) => (appending ? [...prev, ...items] : items));
      setNextUrl(Array.isArray(data) ? null : data.next ?? null);
    } catch (err) {
      console.error('FETCH BOOKINGS ERROR:', err);
      setError({ message: 'Something went wrong while loading your bookings.', unauthorized: false });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    load();
  }, [load]);

  const loadMore = useCallback(() => {
    if (!nextUrl) return;
    setLoadingMore(true);
    load(nextUrl);
  }, [nextUrl, load]);

  const replaceBooking = useCallback((updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  return {
    bookings,
    loading,
    loadingMore,
    error,
    hasMore: !!nextUrl,
    retry,
    loadMore,
    replaceBooking,
  };
}