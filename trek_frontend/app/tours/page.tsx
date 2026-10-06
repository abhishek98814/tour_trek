'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTours } from '@/hooks/useTours';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { MapPin, Star, AlertTriangle, Mountain, Map, Search } from 'lucide-react';

const serif = Fraunces({ subsets: ['latin'], display: 'swap' });

const TOUR_TYPES = ['all', 'cultural', 'adventure', 'wildlife', 'spiritual', 'scenic', 'photography'];
const DIFFICULTIES = ['all', 'easy', 'moderate', 'challenging'];

const DIFF_DOT: Record<string, string> = {
  easy: 'bg-[#4f9a5a]',
  moderate: 'bg-[#e8a33d]',
  challenging: 'bg-[#c2412d]',
};

interface Tour {
  id: string | number;
  slug: string;
  title: string;
  destination?: string;
  tour_type?: string;
  difficulty?: string;
  duration_days?: number;
  duration_hours?: number;
  price_per_person?: number;
  discounted_price?: number;
  discount_percent?: number;
  average_rating?: number;
  total_bookings?: number;
  is_featured?: boolean;
  cover_image?: string;
  guide_included?: boolean;
  transport_included?: boolean;
  meals_included?: boolean;
  entry_fee_included?: boolean;
}

const mediaUrl = (path: string) =>
  path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}${path}`;

const npr = (n: number) => `NPR ${Math.round(n).toLocaleString('en-US')}`;

function TourCard({ tour }: { tour: Tour }) {
  const price = Number(tour.discounted_price || tour.price_per_person || 0);
  const original = Number(tour.price_per_person || 0);
  const hasDiscount = (tour.discount_percent ?? 0) > 0;

  const includes = [
    tour.guide_included && 'guide',
    tour.transport_included && 'transport',
    tour.meals_included && 'meals',
    tour.entry_fee_included && 'entry fees',
  ].filter(Boolean) as string[];

  const length = tour.duration_days
    ? `${tour.duration_days} ${tour.duration_days === 1 ? 'day' : 'days'}${
        tour.duration_hours ? ` (${tour.duration_hours}h)` : ''
      }`
    : null;

  return (
    <Link href={`/tours/${tour.slug}`} className="group block no-underline">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#dfe5e8]">
        {tour.cover_image ? (
          <img
            src={mediaUrl(tour.cover_image)}
            alt={tour.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#152238]">
            <Mountain className="h-12 w-12 text-white/40" strokeWidth={1.3} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          {tour.difficulty && (
            <span className="flex items-center gap-1.5 rounded bg-white/95 px-2 py-1 text-xs font-semibold capitalize text-[#152238]">
              <span className={`h-2 w-2 rounded-full ${DIFF_DOT[tour.difficulty] ?? 'bg-[#94a3b8]'}`} />
              {tour.difficulty}
            </span>
          )}
          {tour.is_featured && (
            <span className="rounded bg-[#e8a33d] px-2 py-1 text-xs font-semibold text-white">Featured</span>
          )}
        </div>
      </div>

      <div className="pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`${serif.className} text-[21px] font-semibold leading-snug text-[#152238] transition-colors group-hover:text-[#b9791f]`}
          >
            {tour.title}
          </h3>
          <span className="mt-1 flex flex-shrink-0 items-center gap-1 text-sm text-[#152238]">
            <Star className="h-3.5 w-3.5 fill-[#e8a33d] text-[#e8a33d]" />
            {Number(tour.average_rating) > 0 ? Number(tour.average_rating).toFixed(1) : 'New'}
          </span>
        </div>

        {tour.destination && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[#64748b]">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {tour.destination}
          </p>
        )}

        <p className="mt-2 text-sm capitalize text-[#475569]">
          {[tour.tour_type, length].filter(Boolean).join(', ')}
        </p>
        {includes.length > 0 && <p className="mt-0.5 text-sm text-[#64748b]">Includes {includes.join(', ')}</p>}

        <p className="mt-3 text-[#152238]">
          {hasDiscount && <span className="mr-2 text-sm text-[#94a3b8] line-through">{npr(original)}</span>}
          <span className="text-lg font-bold">{npr(price)}</span>
          <span className="ml-1 text-sm text-[#64748b]">per person</span>
          {hasDiscount && <span className="ml-2 text-sm font-semibold text-[#3f7a49]">{tour.discount_percent}% off</span>}
        </p>
        {Number(tour.total_bookings) > 0 && (
          <p className="mt-0.5 text-sm text-[#64748b]">{tour.total_bookings} booked</p>
        )}
      </div>
    </Link>
  );
}

function TourCardSkeleton() {
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

export default function ToursPage() {
  const [tourType, setTourType] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ active: 0, prev: -1 });
  const [paused, setPaused] = useState(false);

  // Filtered list for the grid
  const { data, isLoading, isError } = useTours({
    tour_type: tourType !== 'all' ? tourType : undefined,
    difficulty: difficulty !== 'all' ? difficulty : undefined,
    search: search || undefined,
  });
  // Unfiltered list for the hero, so the slides don't change when someone filters
  const { data: everything } = useTours({});

  const tours: Tour[] = data?.results || data || [];
  const hasActiveFilters = tourType !== 'all' || difficulty !== 'all' || !!search;

  // One hero slide per tour, using each tour's cover image
  const slides = useMemo(() => {
    const list: { src: string; title: string; slug: string; destination?: string }[] = [];
    const seen = new Set<string>();
    const source: Tour[] = everything?.results || everything || [];
    source.forEach((t) => {
      if (!t.cover_image) return;
      const src = mediaUrl(t.cover_image);
      if (seen.has(src)) return;
      seen.add(src);
      list.push({ src, title: t.title, slug: t.slug, destination: t.destination });
    });
    return list;
  }, [everything]);

  const cur = slides.length ? pos.active % slides.length : 0;
  const goTo = (n: number) => setPos((p) => (p.active === n ? p : { active: n, prev: p.active }));

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setPos((p) => ({ active: (p.active + 1) % slides.length, prev: p.active }));
    }, 5500);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      {/* Hero slider */}
      <section
        className="relative h-[360px] overflow-hidden bg-[#152238] sm:h-[480px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Our tours"
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

        {/* keeps the white text readable on bright photos */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1626]/85 via-[#0c1626]/40 to-[#0c1626]/10" />

        <div className="relative mx-auto flex h-full max-w-6xl items-end justify-between gap-6 px-6 pb-10 sm:pb-14">
          <div>
            <p className="hero-line mb-2 text-sm font-medium text-[#f0c48f]" style={{ animationDelay: '150ms' }}>
              Nepal, on your terms
            </p>
            <h1
              className={`${serif.className} hero-line mb-3 max-w-xl text-[clamp(30px,5vw,52px)] font-semibold leading-[1.1] text-white`}
              style={{ animationDelay: '300ms' }}
            >
              Tour packages built around what draws you here
            </h1>
            <p className="hero-line max-w-lg text-base text-white/80" style={{ animationDelay: '450ms' }}>
              Cultural walks through Kathmandu&apos;s old quarters, wildlife safaris in the Terai, and high-altitude
              routes for those chasing the ridgeline.
            </p>
          </div>

          {slides.length > 1 && (
            <div className="flex flex-shrink-0 flex-col items-end gap-3">
              <Link
                key={cur}
                href={`/tours/${slides[cur].slug}`}
                className="hero-caption hidden text-right text-white no-underline sm:block"
              >
                <span className={`${serif.className} block text-lg font-semibold`}>{slides[cur].title}</span>
                {slides[cur].destination && (
                  <span className="block text-sm text-white/70">{slides[cur].destination}</span>
                )}
              </Link>
              <div className="flex gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.src}
                    onClick={() => goTo(i)}
                    aria-label={`Show ${slide.title}`}
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
      <section className="border-b border-[#e3e7ea] bg-[#f7f8f6]">
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search by name, place or activity"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#dfe4e8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#152238] outline-none transition placeholder:text-[#94a3b8] focus:border-[#e8a33d] focus:ring-2 focus:ring-[#e8a33d]/20"
            />
          </div>

          <div className="mt-3 flex items-center gap-6 overflow-x-auto">
            {TOUR_TYPES.map((t) => {
              const active = tourType === t;
              return (
                <button
                  key={t}
                  onClick={() => setTourType(t)}
                  className={`relative flex-shrink-0 whitespace-nowrap py-3 text-sm font-medium capitalize transition-colors ${
                    active ? 'text-[#152238]' : 'text-[#64748b] hover:text-[#152238]'
                  }`}
                >
                  {t === 'all' ? 'All types' : t}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 bg-[#e8a33d] transition-transform duration-200 ${
                      active ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 text-sm">
          <span className="text-[#64748b]">Difficulty</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`capitalize transition-colors ${
                difficulty === d
                  ? 'font-semibold text-[#152238] underline decoration-[#e8a33d] decoration-2 underline-offset-[6px]'
                  : 'text-[#64748b] hover:text-[#152238]'
              }`}
            >
              {d === 'all' ? 'Any' : d}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setTourType('all');
                setDifficulty('all');
                setSearch('');
              }}
              className="ml-auto font-medium text-[#b23a28] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TourCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="mx-auto max-w-md py-16 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#b23a28]" />
            <p className="font-semibold text-[#152238]">We couldn&apos;t load the tours</p>
            <p className="mt-1 text-sm text-[#64748b]">
              Check that the Django server is running on port 8000, then refresh the page.
            </p>
          </div>
        )}

        {!isLoading && !isError && tours.length === 0 && (
          <div className="mx-auto max-w-md py-16 text-center">
            <Map className="mx-auto mb-4 h-10 w-10 text-[#b6c0c7]" strokeWidth={1.3} />
            <h3 className={`${serif.className} mb-2 text-2xl font-semibold text-[#152238]`}>
              {hasActiveFilters ? 'No tours match those filters' : 'No tours yet'}
            </h3>
            <p className="mb-6 text-[#64748b]">
              {hasActiveFilters
                ? 'Try a different type, difficulty or search word.'
                : 'Tours you add in the admin panel will show up here.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={() => {
                  setTourType('all');
                  setDifficulty('all');
                  setSearch('');
                }}
                className="rounded bg-[#152238] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b9791f]"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/admin-panel/tours"
                className="inline-block rounded bg-[#152238] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#b9791f]"
              >
                Add a tour
              </Link>
            )}
          </div>
        )}

        {!isLoading && tours.length > 0 && (
          <>
            <p className="mb-6 text-sm text-[#64748b]">
              {tours.length} {tours.length === 1 ? 'tour' : 'tours'}
            </p>
            <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </>
        )}
      </div>

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
    </div>
  );
}