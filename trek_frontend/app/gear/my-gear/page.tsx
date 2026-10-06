'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/authFetch';
import { readApiError } from '@/lib/bookingg';

interface MyGear {
  id: number;
  slug: string;
  title: string;
  listing_type: 'sell' | 'rent' | 'both';
  sell_price?: string | null;
  rent_price_per_day?: string | null;
  price_currency?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  cover_image?: string | null;
  created_at: string;
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected';
const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected'];

const BADGE: Record<MyGear['approval_status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

// swap this for the media helper you already use for trek images
const mediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:8000'}${path}`;
};

export default function MyGearPage() {
  const [items, setItems] = useState<MyGear[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/gear/my-gear/');
        if (!res.ok) {
          setError(await readApiError(res, "We couldn't load your gear."));
          setItems([]);
          return;
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.results ?? []);
      } catch (err) {
        console.error('LOAD MY GEAR ERROR:', err);
        setError('Something went wrong while loading your gear.');
        setItems([]);
      }
    })();
  }, []);

  const visible = (items ?? []).filter((g) => filter === 'all' || g.approval_status === filter);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My gear</h1>
        <Link
          href="/gear/create"
          className="rounded bg-[#1f8f86] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Create gear
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
              filter === f ? 'bg-[#0f3d57] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {items === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500">
          {filter === 'all' ? "You haven't listed any gear yet." : `No ${filter} gear.`}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((g) => {
            const img = mediaUrl(g.cover_image);
            const cur = g.price_currency || 'NPR';
            return (
              <div key={g.id} className="flex gap-4 rounded-lg border p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={g.title} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{g.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE[g.approval_status]}`}
                    >
                      {g.approval_status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {g.sell_price && `${cur} ${Number(g.sell_price).toLocaleString()} to buy`}
                    {g.sell_price && g.rent_price_per_day && ' · '}
                    {g.rent_price_per_day && `${cur} ${Number(g.rent_price_per_day).toLocaleString()}/day to rent`}
                  </p>

                  {g.approval_status === 'pending' && (
                    <p className="mt-2 text-sm text-gray-600">Waiting for admin approval.</p>
                  )}
                  {g.approval_status === 'rejected' && g.rejection_reason && (
                    <p className="mt-2 text-sm text-red-700">Rejected: {g.rejection_reason}</p>
                  )}
                  {g.approval_status === 'approved' && (
                    <Link href={`/gear/${g.slug}`} className="mt-2 inline-block text-sm font-semibold text-[#0f3d57]">
                      View listing →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}