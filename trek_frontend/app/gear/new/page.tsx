'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';
import { readApiError } from '@/lib/bookingg';

const FIELDS: { name: string; label: string; type: 'text' | 'number' | 'textarea'; required?: boolean }[] = [
  { name: 'name', label: 'Gear name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'price', label: 'Price (NPR)', type: 'number', required: true },
  { name: 'stock', label: 'Quantity available', type: 'number' },
];

const inputClass =
  'w-full rounded-lg border border-[#d5dbe0] bg-white px-3.5 py-2.5 text-sm text-[#17242f] outline-none transition focus:border-[#1f8f86] focus:ring-4 focus:ring-[#1f8f86]/15';

export default function NewGearPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const body: Record<string, string | number> = {};
    FIELDS.forEach((f) => {
      const v = (values[f.name] ?? '').trim();
      if (v !== '') body[f.name] = f.type === 'number' ? Number(v) : v;
    });

    try {
      const res = await authFetch('/gear/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(await readApiError(res, "We couldn't submit your gear."));
        return;
      }
      setDone(true);
    } catch (err) {
      console.error('CREATE GEAR ERROR:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#f7f8f6] px-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#1f8f86]" />
        <h1 className="text-2xl font-semibold text-[#17242f]">Submitted for review</h1>
        <p className="max-w-sm text-sm text-[#64748b]">
          An admin will review your gear. It will appear in the shop once it is approved.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => { setValues({}); setDone(false); }}
            className="rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f8f86]"
          >
            Add another
          </button>
          <Link href="/dashboard" className="rounded border border-[#d5dbe0] px-5 py-2.5 text-sm font-semibold text-[#17242f] no-underline hover:border-[#1f8f86]">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-6 pb-24 pt-28">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-xl border border-[#e3e7ea] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#17242f]">Add new gear</h1>
        <p className="mb-6 mt-1 text-sm text-[#64748b]">New gear is reviewed by an admin before it goes live.</p>

        <div className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.name}>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  className={`${inputClass} min-h-[110px] resize-y`}
                  value={values[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : (
                <input
                  className={inputClass}
                  type={f.type}
                  min={f.type === 'number' ? 0 : undefined}
                  value={values[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3.5 py-3 text-sm font-medium text-[#b91c1c]">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded bg-[#0f3d57] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f8f86] disabled:opacity-60"
        >
          {saving ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>
    </main>
  );
}