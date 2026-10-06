'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { readApiError } from '@/lib/bookingg';

interface Category {
  id: number;
  name: string;
}

const CONDITIONS = [
  ['new', 'New'], ['like_new', 'Like New'], ['good', 'Good'], ['fair', 'Fair'], ['poor', 'Poor'],
];
const SIZES = [
  ['one_size', 'One Size'], ['xs', 'XS'], ['s', 'S'], ['m', 'M'],
  ['l', 'L'], ['xl', 'XL'], ['xxl', 'XXL'], ['na', 'N/A'],
];
const LISTING_TYPES = [
  ['sell', 'For sale', 'One-time sale'],
  ['rent', 'For rent', 'Earn per day'],
  ['both', 'Sale & rent', 'Offer both'],
];

const MAX_FILES = 8;
const MAX_SIZE = 5 * 1024 * 1024;

const input =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 transition focus:border-[#1f8f86] focus:bg-white focus:outline-none ' +
  'focus:ring-4 focus:ring-[#1f8f86]/15';
const label = 'mb-1.5 block text-sm font-medium text-slate-700';
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={card}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#0f3d57]">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={label}>{name}</label>
      {children}
    </div>
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
        NPR
      </span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        className={`${input} pl-14`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
      />
    </div>
  );
}

export default function CreateGearPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    model_name: '',
    size: 'one_size',
    condition: 'good',
    color: '',
    year_purchased: '',
    weight_kg: '',
    listing_type: 'sell',
    sell_price: '',
    rent_price_per_day: '',
    deposit_amount: '',
    is_negotiable: false,
    location: 'Kathmandu',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/gear/categories/');
        if (!res.ok) return;
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results ?? []);
      } catch (err) {
        console.error('LOAD CATEGORIES ERROR:', err);
      }
    })();
  }, []);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const valid = incoming.filter(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= MAX_SIZE
    );
    if (valid.length < incoming.length) {
      setError('Some photos were skipped. Use JPG, PNG or WebP files under 5 MB.');
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function makeCover(i: number) {
    setFiles((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(i, 1);
      return [picked, ...copy];
    });
  }

  const showSell = form.listing_type === 'sell' || form.listing_type === 'both';
  const showRent = form.listing_type === 'rent' || form.listing_type === 'both';

  async function handleSubmit() {
    setError(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (showSell && !form.sell_price) {
      setError('Enter a sale price.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (showRent && !form.rent_price_per_day) {
      setError('Enter a rent price per day.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: Record<string, unknown> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v === '' || v === null) return;
      payload[k] = v;
    });
    if (!showSell) delete payload.sell_price;
    if (!showRent) {
      delete payload.rent_price_per_day;
      delete payload.deposit_amount;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/gear/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(await readApiError(res, "We couldn't create this gear."));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const created = await res.json();

      // step 2: upload photos
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        const imgRes = await authFetch(`/gear/${created.slug}/images/`, {
          method: 'POST',
          body: fd, // no Content-Type header, the browser sets the boundary
        });
        if (!imgRes.ok) {
          setError(
            (await readApiError(imgRes, 'Images failed to upload.')) +
              ' Your gear was saved, you can add photos later.'
          );
          return;
        }
      }

      setDone(true);
    } catch (err) {
      console.error('CREATE GEAR ERROR:', err);
      setError('Something went wrong. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f8f86]/10">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1f8f86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f3d57]">Gear submitted</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Your listing is waiting for admin approval. It will appear publicly once approved.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/gear/my-gear')}
              className="rounded-xl bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2f44] focus:outline-none focus:ring-4 focus:ring-[#0f3d57]/20"
            >
              View my gear
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* header */}
      <div className="bg-gradient-to-br from-[#0f3d57] to-[#1f8f86]">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">List your gear</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Sell or rent what you no longer use. Good photos and an honest description get you
            faster replies.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-3xl space-y-5 px-4 sm:px-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
          >
            <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* basics */}
        <Section title="The basics" hint="What are you listing?">
          <div className="space-y-4">
            <Field name="Title *">
              <input
                className={input}
                placeholder="e.g. Osprey Atmos 65 backpack"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>
            <Field name="Description *">
              <textarea
                className={input}
                rows={4}
                placeholder="Condition, how often it was used, what's included…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field name="Category">
                <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field name="Location">
                <input className={input} value={form.location} onChange={(e) => set('location', e.target.value)} />
              </Field>
            </div>
          </div>
        </Section>

        {/* photos */}
        <Section title="Photos" hint={`Up to ${MAX_FILES} photos, JPG, PNG or WebP, 5 MB each. The first one is the cover.`}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus:ring-4 focus:ring-[#1f8f86]/15 ${
              dragging
                ? 'border-[#1f8f86] bg-[#1f8f86]/5'
                : 'border-slate-300 bg-slate-50/60 hover:border-[#1f8f86] hover:bg-[#1f8f86]/5'
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1f8f86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Drop photos here or click to browse</p>
            <p className="mt-0.5 text-xs text-slate-500">{files.length}/{MAX_FILES} added</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute left-2 top-2 rounded-full bg-[#0f3d57] px-2 py-0.5 text-[11px] font-semibold text-white">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 opacity-0 transition focus:opacity-100 group-hover:opacity-100"
                    >
                      Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* details */}
        <Section title="Gear details" hint="Optional, but buyers filter by these.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field name="Brand">
              <input className={input} value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </Field>
            <Field name="Model">
              <input className={input} value={form.model_name} onChange={(e) => set('model_name', e.target.value)} />
            </Field>
            <Field name="Color">
              <input className={input} value={form.color} onChange={(e) => set('color', e.target.value)} />
            </Field>
            <Field name="Year purchased">
              <input
                type="number"
                className={input}
                placeholder="2023"
                value={form.year_purchased}
                onChange={(e) => set('year_purchased', e.target.value)}
              />
            </Field>
            <Field name="Weight (kg)">
              <input
                type="number"
                step="0.01"
                className={input}
                value={form.weight_kg}
                onChange={(e) => set('weight_kg', e.target.value)}
              />
            </Field>
            <Field name="Size">
              <select className={input} value={form.size} onChange={(e) => set('size', e.target.value)}>
                {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <span className={label}>Condition</span>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(([v, l]) => {
                const active = form.condition === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('condition', v)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-[#1f8f86]/15 ${
                      active
                        ? 'border-[#1f8f86] bg-[#1f8f86] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#1f8f86]/50'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* pricing */}
        <Section title="Pricing" hint="Choose how you want to offer this gear.">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
            {LISTING_TYPES.map(([v, l, sub]) => {
              const active = form.listing_type === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('listing_type', v)}
                  aria-pressed={active}
                  className={`rounded-xl px-2 py-2.5 text-center transition focus:outline-none focus:ring-4 focus:ring-[#1f8f86]/15 ${
                    active ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                  }`}
                >
                  <span className={`block text-sm font-semibold ${active ? 'text-[#0f3d57]' : 'text-slate-600'}`}>{l}</span>
                  <span className="hidden text-xs text-slate-500 sm:block">{sub}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {showSell && (
              <Field name="Sale price *">
                <PriceInput value={form.sell_price} onChange={(v) => set('sell_price', v)} />
              </Field>
            )}
            {showRent && (
              <>
                <Field name="Rent per day *">
                  <PriceInput value={form.rent_price_per_day} onChange={(v) => set('rent_price_per_day', v)} />
                </Field>
                <Field name="Deposit">
                  <PriceInput value={form.deposit_amount} onChange={(v) => set('deposit_amount', v)} />
                </Field>
              </>
            )}
          </div>

          {showSell && (
            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-[#1f8f86]"
                checked={form.is_negotiable}
                onChange={(e) => set('is_negotiable', e.target.checked)}
              />
              Price is negotiable
            </label>
          )}
        </Section>
      </div>

      {/* sticky submit bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="hidden text-xs text-slate-500 sm:block">
            Listings go live after admin approval.
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-[#1f8f86] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#187a72] focus:outline-none focus:ring-4 focus:ring-[#1f8f86]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </div>
  );
}