'use client';
import { useEffect, useState } from 'react';
import { useGear } from '@/hooks/useGear';
import { mediaUrl } from '../../lib/media';
import Link from 'next/link';
import {
  Search, Backpack, MapPin, X, AlertTriangle, Tent, Footprints, Shirt, Hand,
  Flashlight, MountainSnow, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpRight,
  Tag, CalendarDays, Camera, Truck,
} from 'lucide-react';



const CONDITIONS = [
  { value: 'all', label: 'Any condition' },
  { value: 'new', label: 'Brand new' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good shape' },
  { value: 'fair', label: 'Well used' },
  { value: 'poor', label: 'Rough but works' },
];
const LISTING_TYPES = [
  { value: 'all', label: 'Buy or rent' },
  { value: 'sell', label: 'For sale' },
  { value: 'rent', label: 'For rent' },
  { value: 'both', label: 'Sale or rent' },
];
const SIZES = [
  { value: 'all', label: 'Any' }, { value: 'xs', label: 'XS' }, { value: 's', label: 'S' },
  { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' }, { value: 'one_size', label: 'One size' },
];

const conditionLabel: Record<string, string> = Object.fromEntries(
  CONDITIONS.filter((c) => c.value !== 'all').map((c) => [c.value, c.label])
);
// a small dot beside the condition, from "fresh" to "worn"
const conditionDot: Record<string, string> = {
  new: 'bg-[#2f7d57]', like_new: 'bg-[#5a9a5b]', good: 'bg-[#c9a227]', fair: 'bg-[#d27a2c]', poor: 'bg-[#b8322a]',
};

const categories = [
  { label: 'All gear', slug: '', icon: null },
  { label: 'Tents', slug: 'tents', icon: Tent },
  { label: 'Boots', slug: 'boots', icon: Footprints },
  { label: 'Jackets', slug: 'jackets', icon: Shirt },
  { label: 'Backpacks', slug: 'backpacks', icon: Backpack },
  { label: 'Gloves', slug: 'gloves', icon: Hand },
  { label: 'Lights', slug: 'lights', icon: Flashlight },
  { label: 'Climbing', slug: 'climbing', icon: MountainSnow },
];

/* ---------- types & helpers ---------- */

interface GearImage { image: string }
interface GearItem {
  id: string | number; slug: string; title: string; brand?: string; condition?: string;
  listing_type?: 'sell' | 'rent' | 'both'; location?: string; size?: string;
  weight_kg?: number | string | null; sell_price?: number | string | null;
  rent_price_per_day?: number | string | null; is_negotiable?: boolean; is_featured?: boolean;
  cover_image?: string | null; images?: GearImage[]; seller_name?: string; seller_avatar?: string;
  created_at?: string;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

const initials = (name?: string) =>
  name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '';
const firstName = (name?: string) => name?.split(' ')[0];
const money = (v: number | string) => `Rs ${Number(v).toLocaleString('en-IN')}`;

function priceOf(item: GearItem) {
  if (item.sell_price)
    return { main: money(item.sell_price), sub: item.rent_price_per_day ? `or ${money(item.rent_price_per_day)} a day to rent` : '' };
  if (item.rent_price_per_day) return { main: money(item.rent_price_per_day), sub: 'a day to rent' };
  return { main: 'Ask the seller', sub: '' };
}

/* ---------- small pieces ---------- */

function Avatar({ item }: { item: GearItem }) {
  const src = mediaUrl(item.seller_avatar);
  return src ? (
    <img src={src} alt="" className="h-6 w-6 rounded-full object-cover" />
  ) : (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d9ded6] text-[10px] font-bold text-[#3c4a44]">
      {initials(item.seller_name)}
    </span>
  );
}

function Cover({ item }: { item: GearItem }) {
  const cover = mediaUrl(item.cover_image || item.images?.[0]?.image);
  return cover ? (
    <img src={cover} alt={item.title} loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-[#dfe4dc]">
      <Backpack className="h-9 w-9 text-[#9aa79f]" strokeWidth={1.3} />
    </div>
  );
}

function GearCard({ item }: { item: GearItem }) {
  const p = priceOf(item);
  const posted = timeAgo(item.created_at);
  const tag = item.listing_type === 'both' ? 'Sale or rent' : item.listing_type === 'rent' ? 'For rent' : 'For sale';
  const details = [
    item.brand,
    item.size && item.size !== 'na' ? `Size ${item.size.replace('_', ' ')}` : null,
    Number(item.weight_kg) > 0 ? `${Number(item.weight_kg)} kg` : null,
  ].filter(Boolean).join('  /  ');

  return (
    <Link href={`/gear/${item.slug}`} className="group block text-[#1c2622] no-underline">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#dfe4dc]">
        <Cover item={item} />
        <span className="absolute left-0 top-3 bg-[#1c2622] px-2.5 py-1 text-[12px] font-semibold text-white">{tag}</span>
        {item.is_featured && (
          <span className="absolute bottom-0 right-0 bg-[#b8322a] px-2.5 py-1 text-[12px] font-semibold text-white">
            Our pick
          </span>
        )}
      </div>

      <div className="pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug group-hover:underline group-hover:decoration-[#b8322a] group-hover:underline-offset-4">
            {item.title}
          </h3>
          <div className="whitespace-nowrap text-right text-[17px] font-bold tabular-nums">{p.main}</div>
        </div>

        <div className="mt-1 flex items-start justify-between gap-3 text-[13px] text-[#5f6b66]">
          <span className="truncate">{details}</span>
          {item.is_negotiable && item.sell_price ? <span className="whitespace-nowrap text-[#2f7d57]">Open to offers</span> : null}
        </div>
        {p.sub && <div className="mt-0.5 text-right text-[12.5px] text-[#5f6b66]">{p.sub}</div>}

        <div className="mt-3 flex items-center gap-2 border-t border-[#d5d9d2] pt-3 text-[13px] text-[#5f6b66]">
          {item.condition && (
            <span className="flex items-center gap-1.5 font-medium text-[#1c2622]">
              <span className={`h-2 w-2 rounded-full ${conditionDot[item.condition] ?? 'bg-[#999]'}`} />
              {conditionLabel[item.condition] ?? item.condition}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
          )}
        </div>

        {item.seller_name && (
          <div className="mt-2.5 flex items-center gap-2 text-[13px] text-[#5f6b66]">
            <Avatar item={item} />
            <span className="truncate">
              {firstName(item.seller_name)}{posted ? `, listed ${posted}` : ''}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-[#dfe4dc]" />
      <div className="mt-3.5 h-4 w-3/4 bg-[#dfe4dc]" />
      <div className="mt-2 h-3 w-1/2 bg-[#e6eae3]" />
      <div className="mt-6 h-3 w-2/3 bg-[#e6eae3]" />
    </div>
  );
}

function FilterGroup({
  title, options, value, onChange,
}: { title: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-2.5 text-[14px] font-bold text-[#1c2622]">{title}</legend>
      <div className="flex flex-col">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`flex items-center gap-2.5 border-l-2 py-1.5 pl-3 text-left text-[14px] transition-colors ${
                active ? 'border-[#b8322a] font-semibold text-[#1c2622]' : 'border-transparent text-[#5f6b66] hover:text-[#1c2622]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}


/* ---------- hero (banner area) ---------- */

/*
  BANNERS: drop your images in /public/banners and set `image` (e.g. '/banners/season.jpg').
  Best size: 1600 x 800 px, subject on the RIGHT side (text sits on the left).
  Leave `image` empty and a coloured fallback with a mountain ridge is shown.
*/
type HeroAction = { category?: string; listing?: string };
interface Banner { id: string; title: string; text: string; cta: string; action: HeroAction; image: string; tone: string }

const BANNERS: Banner[] = [
  {
    id: 'season',
    title: 'Trek season is here. Gear up second-hand.',
    text: 'Down jackets, boots and sleeping bags that have already done the hard miles, at a fraction of the price.',
    cta: 'Shop jackets',
    action: { category: 'Jackets' },
    image: '', // '/banners/season.jpg'
    tone: '#17384a',
  },
  {
    id: 'rent',
    title: 'Rent it for the trek. Hand it back after.',
    text: 'Need a 4-season tent for ten days, not ten years? Rent by the day from trekkers near you.',
    cta: 'Browse rentals',
    action: { listing: 'rent' },
    image: '', // '/banners/rent.jpg'
    tone: '#7a2a24',
  },
  {
    id: 'tents',
    title: 'Tents that have seen real weather.',
    text: 'Check the photos, ask the seller anything, and make an offer if the price allows it.',
    cta: 'See tents',
    action: { category: 'Tents' },
    image: '', // '/banners/tents.jpg'
    tone: '#2f4a3a',
  },
];

const PROMOS = [
  {
    id: 'rent', title: 'Rent by the day', text: 'Pay only for the days you trek.', cta: 'See rentals',
    action: { listing: 'rent' } as HeroAction, href: '', image: '', tone: '#24566e',
  },
  {
    id: 'sell', title: 'Sell your old gear', text: 'List it in a few minutes.', cta: 'Start a listing',
    action: {} as HeroAction, href: '/gear/create', image: '', tone: '#b8322a',
  },
];

const PERKS = [
  { icon: Tag, title: 'Open to offers', text: 'Many sellers negotiate' },
  { icon: CalendarDays, title: 'Buy or rent', text: 'Own it or borrow it' },
  { icon: Camera, title: 'Real photos', text: 'Shot by the seller' },
  { icon: Truck, title: 'Across Nepal', text: 'Kathmandu to Pokhara and beyond' },
];

function Ridge({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="610" cy="120" r="46" fill="#fff" opacity="0.14" />
      <path d="M0 400V270l90-60 70 40 120-120 90 90 80-70 110 110 70-50 170 90v100z" fill="#000" opacity="0.22" />
      <path d="M0 400V320l130-80 90 60 140-110 120 100 90-60 230 110v60z" fill="#000" opacity="0.32" />
      <path d="M360 190l22 18-14-2-8 12-10-14-14 4z" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function Hero({
  search, setSearch, onAction,
}: { search: string; setSearch: (v: string) => void; onAction: (a: HeroAction) => void }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), 6500);
    return () => clearInterval(t);
  }, [paused, reduced]);

  const go = (n: number) => setIdx((n + BANNERS.length) % BANNERS.length);

  return (
    <section className="border-b border-[#d5d9d2] bg-[#e4e8e1]">
      <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-7">
        {/* search row */}
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); onAction({}); }}
          className="mb-5 flex items-stretch border-2 border-[#1c2622] bg-white focus-within:border-[#b8322a]"
        >
          <label htmlFor="gear-search" className="sr-only">Search gear</label>
          <Search className="my-auto ml-4 h-5 w-5 flex-shrink-0 text-[#5f6b66]" />
          <input
            id="gear-search"
            type="text"
            placeholder="Search down jackets, 4-season tents, size 42 boots…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent px-3 py-3.5 text-[16px] outline-none placeholder:text-[#8b968f]"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="px-3 text-[#5f6b66] hover:text-[#1c2622]">
              <X className="h-4 w-4" />
            </button>
          )}
          <button type="submit" className="bg-[#1c2622] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#b8322a]">
            Search
          </button>
        </form>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {/* banner carousel */}
          <div
            className="relative h-[360px] overflow-hidden md:h-[420px]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured offers"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {BANNERS.map((b, i) => (
              <div
                key={b.id}
                aria-hidden={i !== idx}
                className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                style={{ background: b.tone }}
              >
                {b.image ? (
                  <>
                    <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                  </>
                ) : (
                  <Ridge tone={b.tone} />
                )}
                <div className="relative flex h-full max-w-[560px] flex-col justify-center px-8 pb-10 md:px-12">
                  <h2 className="gear-display text-[clamp(30px,4.6vw,50px)] font-extrabold leading-[1.04] tracking-tight text-white">
                    {b.title}
                  </h2>
                  <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-white/85">{b.text}</p>
                  <button
                    onClick={() => onAction(b.action)}
                    tabIndex={i === idx ? 0 : -1}
                    className="mt-7 inline-flex w-fit items-center gap-2 bg-white px-6 py-3 text-[15px] font-bold text-[#1c2622] transition-colors hover:bg-[#f2c9c5]"
                  >
                    {b.cta} <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* controls */}
            <div className="absolute bottom-4 left-8 flex items-center gap-2 md:left-12">
              {BANNERS.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === idx}
                  className={`h-1.5 transition-all ${i === idx ? 'w-9 bg-white' : 'w-4 bg-white/45 hover:bg-white/70'}`}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              <button onClick={() => go(idx - 1)} aria-label="Previous banner" className="flex h-9 w-9 items-center justify-center bg-white/90 text-[#1c2622] hover:bg-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(idx + 1)} aria-label="Next banner" className="flex h-9 w-9 items-center justify-center bg-white/90 text-[#1c2622] hover:bg-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* side promos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {PROMOS.map((p) => {
              const inner = (
                <>
                  {p.image ? (
                    <>
                      <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </>
                  ) : (
                    <Ridge tone={p.tone} />
                  )}
                  <div className="relative flex h-full flex-col justify-end p-6 text-white">
                    <div className="gear-display text-[24px] font-bold leading-tight">{p.title}</div>
                    <div className="mt-1 text-[14px] text-white/85">{p.text}</div>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold underline underline-offset-4">
                      {p.cta} <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </>
              );
              const cls = 'group relative block h-[190px] overflow-hidden text-left no-underline md:h-[202px]';
              return p.href ? (
                <Link key={p.id} href={p.href} className={cls} style={{ background: p.tone }}>{inner}</Link>
              ) : (
                <button key={p.id} onClick={() => onAction(p.action)} className={cls} style={{ background: p.tone }}>{inner}</button>
              );
            })}
          </div>
        </div>

        {/* perks strip */}
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-white text-[#b8322a]">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="leading-tight">
                <span className="block text-[14.5px] font-bold">{title}</span>
                <span className="text-[13px] text-[#5f6b66]">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function GearPage() {
  const [listingType, setListingType] = useState('all');
  const [condition, setCondition] = useState('all');
  const [size, setSize] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState('All gear');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const categorySlug = categories.find((c) => c.label === category)?.slug;

  const { data, isLoading, isError } = useGear({
    listing_type: listingType !== 'all' ? listingType : undefined,
    condition: condition !== 'all' ? condition : undefined,
    size: size !== 'all' ? size : undefined,
    search: debouncedSearch || undefined,
    is_negotiable: negotiable || undefined,
    category__slug: categorySlug || undefined,
  });

  const items: GearItem[] = data?.results || data || [];
  const total: number = data?.count ?? items.length;

  const activeFilterCount = [
    listingType !== 'all', condition !== 'all', size !== 'all', !!search, negotiable, category !== 'All gear',
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = () => {
    setListingType('all'); setCondition('all'); setSize('all');
    setSearch(''); setNegotiable(false); setCategory('All gear');
  };

  const applyAction = (a: HeroAction) => {
    if (a.category) setCategory(a.category);
    if (a.listing) setListingType(a.listing);
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const filters = (
    <div className="flex flex-col gap-8">
      <FilterGroup title="Buy or rent" options={LISTING_TYPES} value={listingType} onChange={setListingType} />
      <FilterGroup title="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
      <FilterGroup title="Size" options={SIZES} value={size} onChange={setSize} />
      <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-[#1c2622]">
        <input
          type="checkbox"
          checked={negotiable}
          onChange={(e) => setNegotiable(e.target.checked)}
          className="h-4 w-4 accent-[#b8322a]"
        />
        Sellers open to offers only
      </label>
      {hasActiveFilters && (
        <button onClick={resetFilters} className="flex items-center gap-1.5 self-start text-[14px] font-semibold text-[#b8322a] underline underline-offset-4">
          <X className="h-3.5 w-3.5" /> Clear everything
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef0ec] text-[#1c2622]" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      {/* hero */}
      <Hero search={search} setSearch={setSearch} onAction={applyAction} />

      <header className="border-b border-[#d5d9d2] bg-[#eef0ec] pt-4">
        {/* category tabs */}
        <nav aria-label="Gear categories" className="mx-auto max-w-[1200px] overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-7">
            {categories.map((cat) => {
              const active = category === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  aria-pressed={active}
                  className={`-mb-px flex flex-shrink-0 items-center gap-2 border-b-[3px] pb-3 pt-1 text-[15px] transition-colors ${
                    active ? 'border-[#b8322a] font-bold' : 'border-transparent text-[#5f6b66] hover:text-[#1c2622]'
                  }`}
                >
                  {cat.icon && <cat.icon className="h-4 w-4" strokeWidth={1.8} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* body */}
      <main id="results" className="mx-auto grid scroll-mt-4 max-w-[1200px] gap-10 px-6 py-10 pb-24 lg:grid-cols-[220px_1fr]">
        {/* filters */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="mb-5 flex items-center gap-2 border border-[#1c2622] px-4 py-2.5 text-[14px] font-semibold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{filters}</div>
        </aside>

        {/* results */}
        <section aria-live="polite">
          {!isError && (
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-[18px] font-bold">
                {isLoading
                  ? 'Looking through the listings…'
                  : total === 0
                  ? 'No matches'
                  : `${total} ${total === 1 ? 'listing' : 'listings'}${category !== 'All gear' ? ` in ${category.toLowerCase()}` : ''}`}
              </h2>
              {debouncedSearch && !isLoading && (
                <span className="truncate text-[14px] text-[#5f6b66]">for &ldquo;{debouncedSearch}&rdquo;</span>
              )}
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-x-7 gap-y-12">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {isError && (
            <div className="border-l-4 border-[#b8322a] bg-white px-6 py-8">
              <AlertTriangle className="mb-3 h-7 w-7 text-[#b8322a]" />
              <p className="mb-1 text-[17px] font-bold">We couldn&apos;t load the listings</p>
              <p className="text-[15px] text-[#4a5751]">
                Check your connection and reload the page. If it keeps happening, the server may be down.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="border border-dashed border-[#b6beb5] px-6 py-16 text-center">
              <Backpack className="mx-auto mb-4 h-10 w-10 text-[#9aa79f]" strokeWidth={1.3} />
              <h3 className="gear-display mb-2 text-[24px] font-bold">
                {hasActiveFilters ? 'Nothing fits those filters' : 'No one has listed gear yet'}
              </h3>
              <p className="mx-auto mb-6 max-w-[38ch] text-[15px] text-[#4a5751]">
                {hasActiveFilters
                  ? 'Try loosening one or two of them, or search for something broader.'
                  : 'Got a jacket or a pair of boots you no longer use? Yours could be the first listing.'}
              </p>
              {hasActiveFilters ? (
                <button onClick={resetFilters} className="bg-[#1c2622] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#b8322a]">
                  Clear filters
                </button>
              ) : (
                <Link href="/gear/create" className="inline-block bg-[#1c2622] px-6 py-3 text-[15px] font-semibold text-white no-underline hover:bg-[#b8322a]">
                  List your gear
                </Link>
              )}
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-x-7 gap-y-12">
              {items.map((item) => <GearCard key={item.id} item={item} />)}
            </div>
          )}

          {/* sell prompt */}
          {!isError && !isLoading && items.length > 0 && (
            <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t-2 border-[#1c2622] pt-8">
              <div className="max-w-[52ch]">
                <h3 className="gear-display text-[26px] font-bold leading-tight">Got gear gathering dust?</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#4a5751]">
                  Listing takes a few minutes. Add some photos, set a price, and another trekker will find it.
                </p>
              </div>
              <Link href="/gear/create" className="bg-[#b8322a] px-7 py-3.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-[#1c2622]">
                List your gear
              </Link>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        .gear-display { font-family: 'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}