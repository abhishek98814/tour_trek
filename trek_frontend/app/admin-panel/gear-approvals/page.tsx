'use client';

import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { readApiError } from '@/lib/bookingg';

interface GearItem {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  seller?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

type Filter = 'pending' | 'approved' | 'rejected';
const FILTERS: Filter[] = ['pending', 'approved', 'rejected'];

export default function GearApprovalsPage() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [items, setItems] = useState<GearItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setItems(null);
    setError(null);
    try {
      const res = await authFetch(`/gear/admin/list/?approval_status=${filter}`);
      if (!res.ok) {
        setError(await readApiError(res, "We couldn't load gear."));
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error('LOAD GEAR ERROR:', err);
      setError('Something went wrong while loading gear.');
      setItems([]);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function review(id: number, action: 'approve' | 'reject') {
    setError(null);
    setBusyId(id);
    try {
      const res = await authFetch(`/gear/admin/${id}/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'reject' ? { reason } : {}),
      });
      if (!res.ok) {
        setError(await readApiError(res, `We couldn't ${action} this gear.`));
        return;
      }
      setItems((prev) => (prev ?? []).filter((g) => g.id !== id));
      setRejectingId(null);
      setReason('');
    } catch (err) {
      console.error('REVIEW GEAR ERROR:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Gear approvals</h1>

      <div className="mb-6 flex gap-2">
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

      {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {items === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No {filter} gear.</p>
      ) : (
        <div className="space-y-3">
          {items.map((g) => (
            <div key={g.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{g.name ?? g.title ?? `Gear #${g.id}`}</p>
                  <p className="text-sm text-gray-500">
                    by {g.seller ?? 'unknown'}
                    {g.price ? ` · NPR ${Number(g.price).toLocaleString()}` : ''}
                  </p>
                  {g.description && <p className="mt-2 max-w-xl text-sm text-gray-700">{g.description}</p>}
                  {g.approval_status === 'rejected' && g.rejection_reason && (
                    <p className="mt-2 text-sm text-red-700">Reason: {g.rejection_reason}</p>
                  )}
                </div>

                {g.approval_status !== 'approved' && rejectingId !== g.id && (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === g.id}
                      onClick={() => review(g.id, 'approve')}
                      className="rounded bg-[#1f8f86] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    {g.approval_status === 'pending' && (
                      <button
                        disabled={busyId === g.id}
                        onClick={() => { setRejectingId(g.id); setReason(''); }}
                        className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>

              {rejectingId === g.id && (
                <div className="mt-3">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell the seller why this was rejected…"
                    className="w-full rounded border p-2 text-sm"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={!reason.trim() || busyId === g.id}
                      onClick={() => review(g.id, 'reject')}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Confirm reject
                    </button>
                    <button onClick={() => setRejectingId(null)} className="rounded border px-4 py-2 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}