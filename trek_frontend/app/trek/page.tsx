'use client';
import { useTreks } from '@/hooks/useTreks';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Fraunces } from 'next/font/google';
import { MapPin, Star, AlertTriangle, Mountain } from 'lucide-react';

const serif = Fraunces({ subsets: ['latin'], display: 'swap' });

/** Only used when none of the treks has an image yet (put it in public/images/). */
const HERO_IMAGE = '/images/himalaya-hero.jpg';

const difficultyConfig: Record<string, { label: string; dot: string }> = {
  easy: { label: 'Easy', dot: 'bg-[#14b8a6]' },
  moderate: { label: 'Moderate', dot: 'bg-[#f59e0b]' },
  difficult: { label: 'Difficult', dot: 'bg-[#ef4444]' },
  extreme: { label: 'Extreme', dot: 'bg-[#8b5cf6]' },
};

interface TrekImage {
  image: string;
  is_cover?: boolean;
}

interface Trek {
  id: string | number;
  slug: string;
  title: string;
  region?: string;
  difficulty?: string;
  duration_days?: number;
  max_altitude?: number;
  average_rating?: number;
  total_bookings?: number;
  price_per_person?: number;
  discounted_price?: number;
  discount_percent?: number;
  is_featured?: boolean;
  cover_image?: string;
  images?: TrekImage[];
}

const mediaUrl = (path: string) =>
  path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}${path}`;

const npr = (n: number) => `NPR ${Math.round(n).toLocaleString('en-US')}`;

function TrekCard({ trek }: { trek: Trek }) {
  const diff = difficultyConfig[trek.difficulty ?? ''] ?? difficultyConfig.moderate;
  const price = Number(trek.discounted_price || trek.price_per_person || 0);
  const original = Number(trek.price_per_person || 0);
  const hasDiscount = (trek.discount_percent ?? 0) > 0;
  const coverImage =
    trek.cover_image || trek.images?.find((i) => i.is_cover)?.image || trek.images?.[0]?.image || null;

  const facts = [
    trek.duration_days ? `${trek.duration_days} days` : null,
    trek.max_altitude ? `up to ${Number(trek.max_altitude).toLocaleString('en-US')} m` : null,
    trek.total_bookings ? `${trek.total_bookings} booked` : null,
  ].filter(Boolean);

  return (
    <Link href={`/trek/${trek.slug}`} className="group block no-underline">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#dfe5e8]">
        {coverImage ? (
          <img
            src={mediaUrl(coverImage)}
            alt={trek.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0f3d57]">
            <Mountain className="h-12 w-12 text-white/50" strokeWidth={1.3} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="flex items-center gap-1.5 rounded bg-white/95 px-2 py-1 text-xs font-semibold text-[#17242f]">
            <span className={`h-2 w-2 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
          {hasDiscount && (
            <span className="rounded bg-[#dd8a3c] px-2 py-1 text-xs font-semibold text-white">
              {trek.discount_percent}% off
            </span>
          )}
        </div>
      </div>

      <div className="pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`${serif.className} text-[21px] font-semibold leading-snug text-[#17242f] transition-colors group-hover:text-[#1f8f86]`}
          >
            {trek.title}
          </h3>
          <span className="mt-1 flex flex-shrink-0 items-center gap-1 text-sm text-[#17242f]">
            <Star className="h-3.5 w-3.5 fill-[#dd8a3c] text-[#dd8a3c]" />
            {trek.average_rating ? Number(trek.average_rating).toFixed(1) : 'New'}
          </span>
        </div>

        {trek.region && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[#64748b]">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {trek.region}
          </p>
        )}

        {facts.length > 0 && <p className="mt-2 text-sm text-[#475569]">{facts.join(', ')}</p>}

        <p className="mt-3 text-[#17242f]">
          {hasDiscount && <span className="mr-2 text-sm text-[#94a3b8] line-through">{npr(original)}</span>}
          <span className="text-lg font-bold">{npr(price)}</span>
          <span className="ml-1 text-sm text-[#64748b]">per person</span>
        </p>
      </div>
    </Link>
  );
}

function TrekCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/3] animate-pulse rounded-md bg-[#e6eaed]" />
      <div className="space-y-2.5 pt-3.5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#e6eaed]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#e6eaed]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-[#e6eaed]" />
      </div>
    </div>
  );
}

const filters = [
  { key: 'all', label: 'All treks' },
  { key: 'easy', label: 'Easy' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'difficult', label: 'Difficult' },
  { key: 'extreme', label: 'Extreme' },
];

export default function TreksPage() {
  const { data, isLoading, isError } = useTreks();
  const [filter, setFilter] = useState<string>('all');
  const [pos, setPos] = useState({ active: 0, prev: -1 });
  const [paused, setPaused] = useState(false);

  const allTreks: Trek[] = data?.results || data || [];
  const treks = filter === 'all' ? allTreks : allTreks.filter((t) => t.difficulty === filter);

  // One hero slide per trek, using each trek's cover image
  const slides = useMemo(() => {
    const list: { src: string; title: string; slug?: string; region?: string }[] = [];
    const seen = new Set<string>();
    const source: Trek[] = data?.results || data || [];
    source.forEach((t) => {
      const img = t.cover_image || t.images?.find((i) => i.is_cover)?.image || t.images?.[0]?.image;
      if (!img) return;
      const src = mediaUrl(img);
      if (seen.has(src)) return;
      seen.add(src);
      list.push({ src, title: t.title, slug: t.slug, region: t.region });
    });
    return list.length ? list : [{ src: HERO_IMAGE, title: '' }];
  }, [data]);

  const cur = pos.active % slides.length;
  const goTo = (n: number) => setPos((p) => (p.active === n ? p : { active: n, prev: p.active }));

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setPos((p) => ({ active: (p.active + 1) % slides.length, prev: p.active }));
    }, 5500);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-[#b91c1c]" />
        <p className="text-base font-semibold text-[#17242f]">We couldn&apos;t load the treks</p>
        <p className="text-sm text-[#64748b]">Check that the Django server is running, then refresh the page.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      {/* Hero slider */}
      <section
        className="relative h-[360px] overflow-hidden bg-[#0f3d57] sm:h-[480px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Our treks"
      >
        {slides.map((slide, i) => {
          const isActive = i === cur;
          const isPrev = i === pos.prev && !isActive;
          return (
            <div
              key={slide.src}
              aria-hidden={!isActive}
              className="hero-slide absolute inset-0"
              style={{
                transform: isActive ? 'translateX(0)' : isPrev ? 'translateX(-100%)' : 'translateX(100%)',
                transition: isActive || isPrev ? 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)' : 'none',
              }}
            >
              <img
                src={slide.src}
                alt={slide.title}
                className={`h-full w-full object-cover ${isActive || isPrev ? 'hero-kb' : ''}`}
              />
            </div>
          );
        })}

        {/* keeps the white text readable on bright snow photos */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1a26]/85 via-[#0a1a26]/35 to-[#0a1a26]/10" />

        <div className="relative mx-auto flex h-full max-w-[1200px] items-end justify-between gap-6 px-6 pb-10 sm:pb-14">
          <div>
            <p className="hero-line mb-2 text-sm font-medium text-[#f0c48f]" style={{ animationDelay: '150ms' }}>
              Himalayan Expeditions
            </p>
            <h1
              className={`${serif.className} hero-line mb-3 text-[clamp(36px,6vw,64px)] font-semibold leading-[1.05] text-white`}
              style={{ animationDelay: '300ms' }}
            >
              Trek Packages
            </h1>
            <p className="hero-line max-w-[520px] text-base text-white/80" style={{ animationDelay: '450ms' }}>
              {isLoading
                ? 'Finding routes…'
                : `${allTreks.length} curated routes through Nepal's most iconic landscapes.`}
            </p>
          </div>

          {slides.length > 1 && (
            <div className="flex flex-shrink-0 flex-col items-end gap-3">
              {slides[cur].title && (
                <Link
                  key={cur}
                  href={slides[cur].slug ? `/trek/${slides[cur].slug}` : '#'}
                  className="hero-caption hidden text-right text-white no-underline sm:block"
                >
                  <span className={`${serif.className} block text-lg font-semibold`}>{slides[cur].title}</span>
                  {slides[cur].region && <span className="block text-sm text-white/70">{slides[cur].region}</span>}
                </Link>
              )}
              <div className="flex gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.src}
                    onClick={() => goTo(i)}
                    aria-label={`Show ${slide.title || `slide ${i + 1}`}`}
                    aria-current={i === cur}
                    className={`h-1 rounded-full bg-white transition-all duration-500 ${
                      i === cur ? 'w-8 opacity-100' : 'w-4 opacity-40 hover:opacity-70'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[72px] z-[100] border-b border-[#e3e7ea] bg-[#f7f8f6]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 overflow-x-auto px-6">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`relative flex-shrink-0 whitespace-nowrap py-4 text-sm font-medium transition-colors ${
                  active ? 'text-[#17242f]' : 'text-[#64748b] hover:text-[#17242f]'
                }`}
              >
                {f.label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-[#1f8f86] transition-transform duration-200 ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
          {!isLoading && (
            <span className="ml-auto flex-shrink-0 whitespace-nowrap text-sm text-[#64748b]">
              {treks.length} {treks.length === 1 ? 'trek' : 'treks'}
            </span>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-10">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-7 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <TrekCardSkeleton key={i} />
            ))}
          </div>
        ) : treks.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <Mountain className="mx-auto mb-4 h-10 w-10 text-[#b6c0c7]" strokeWidth={1.3} />
            <h3 className={`${serif.className} mb-2 text-2xl font-semibold text-[#17242f]`}>
              {filter !== 'all' ? `No ${filter} treks yet` : 'No treks yet'}
            </h3>
            <p className="mb-6 text-[#64748b]">
              {filter !== 'all'
                ? 'Try a different difficulty, or see everything we offer.'
                : 'Treks you add in the admin panel will show up here.'}
            </p>
            {filter !== 'all' ? (
              <button
                onClick={() => setFilter('all')}
                className="rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f8f86]"
              >
                Show all treks
              </button>
            ) : (
              <Link
                href="/admin-panel/treks"
                className="inline-block rounded bg-[#0f3d57] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#1f8f86]"
              >
                Add a trek
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-7 gap-y-10">
            {treks.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .hero-kb {
          animation: heroZoom 8s ease-out forwards;
        }
        .hero-line {
          opacity: 0;
          animation: heroRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-caption {
          animation: heroRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        @keyframes heroZoom {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }
        @keyframes heroRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-kb,
          .hero-line,
          .hero-caption {
            animation: none;
            opacity: 1;
          }
          .hero-slide {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}