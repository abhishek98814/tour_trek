'use client';
import { useEffect, useMemo, useState } from 'react';
import { useGear } from '@/hooks/useGear';
import { mediaUrl } from '../../lib/media';
import Link from 'next/link';
import {
  Search, Backpack, MapPin, Star, Check, X, AlertTriangle, ArrowRight, Tent, Footprints,
  Shirt, Hand, Flashlight, MountainSnow, SlidersHorizontal, Clock, Handshake,
} from 'lucide-react';

const CONDITIONS = ['all', 'new', 'like_new', 'good', 'fair', 'poor'];
const LISTING_TYPES = ['all', 'sell', 'rent', 'both'];
const SIZES = ['all', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'one_size'];

const conditionLabel: Record<string, string> = {
  new: 'Brand new', like_new: 'Like new', good: 'Good shape', fair: 'Well used', poor: 'Rough but works',
};

const conditionColors: Record<string, string> = {
  new: 'bg-[#dcfce7] text-[#15803d]', like_new: 'bg-[#dbeafe] text-[#1d4ed8]',
  good: 'bg-[#fef9c3] text-[#a16207]', fair: 'bg-[#ffedd5] text-[#c2410c]', poor: 'bg-[#fee2e2] text-[#b91c1c]',
};

const categories = [
  { label: 'All', slug: '', icon: null },
  { label: 'Tents', slug: 'tents', icon: Tent },
  { label: 'Boots', slug: 'boots', icon: Footprints },
  { label: 'Jackets', slug: 'jackets', icon: Shirt },
  { label: 'Backpacks', slug: 'backpacks', icon: Backpack },
  { label: 'Gloves', slug: 'gloves', icon: Hand },
  { label: 'Lights', slug: 'lights', icon: Flashlight },
  { label: 'Climbing', slug: 'climbing', icon: MountainSnow },
];

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
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

const initials = (name?: string) =>
  name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '';
const firstName = (name?: string) => name?.split(' ')[0];
const money = (v: number | string) => `NPR ${Number(v).toLocaleString()}`;

function priceOf(item: GearItem) {
  if (item.sell_price) return { main: money(item.sell_price), sub: item.rent_price_per_day ? `or ${money(item.rent_price_per_day)} a day` : '' };
  if (item.rent_price_per_day) return { main: money(item.rent_price_per_day), sub: 'per day' };
  return { main: 'Ask the seller', sub: '' };
}

function Avatar({ item, size = 'h-5 w-5' }: { item: GearItem; size?: string }) {
  const src = mediaUrl(item.seller_avatar);
  return src ? (
    <img src={src} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} flex items-center justify-center rounded-full bg-[#e7ddd0] text-[9px] font-bold text-[#6b5a45]`}>
      {initials(item.seller_name)}
    </span>
  );
}

function Cover({ item, className = '' }: { item: GearItem; className?: string }) {
  const cover = mediaUrl(item.cover_image || item.images?.[0]?.image);
  return cover ? (
    <img src={cover} alt={item.title} loading="lazy" className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f3d57] to-[#1f8f86] ${className}`}>
      <Backpack className="h-10 w-10 text-white/70" strokeWidth={1.4} />
    </div>
  );
}

function HeroItems({ items, loading }: { items: GearItem[]; loading: boolean }) {
  const tilt = ['md:-rotate-3 md:mt-10', 'md:rotate-1 md:-mt-2', 'md:rotate-3 md:mt-14'];
  if (loading)
    return (
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/10" />)}
      </div>
    );
  if (!items.length)
    return (
      <div className="rounded-2xl border border-dashed border-white/25 p-10 text-center text-white/70">
        <Backpack className="mx-auto mb-3 h-10 w-10" strokeWidth={1.3} />
        Nothing pinned up yet. Your gear could be the first.
      </div>
    );
  return (
    <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 [scrollbar-width:none]">
      {items.map((item, i) => {
        const p = priceOf(item);
        return (
          <Link
            key={item.id}
            href={`/gear/${item.slug}`}
            className={`group relative w-[210px] flex-shrink-0 snap-center rounded-2xl bg-[#fffaf2] p-2.5 pb-3.5 text-[#1c2a33] no-underline shadow-[0_24px_50px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0 md:w-auto ${tilt[i % 3]}`}
          >
            <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#dd8a3c] shadow-md ring-2 ring-[#fffaf2]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <Cover item={item} className="transition-transform duration-500 group-hover:scale-105" />
              {item.is_featured && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#dd8a3c] px-2 py-0.5 text-[11px] font-bold text-white">
                  <Star className="h-3 w-3 fill-current" /> Staff pick
                </span>
              )}
            </div>
            <div className="px-1.5 pt-3">
              <div className="line-clamp-1 text-[14px] font-bold">{item.title}</div>
              <div className="mt-0.5 text-[15px] font-extrabold text-[#0f3d57]">{p.main}</div>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#6b5a45]">
                <Avatar item={item} />
                <span className="truncate">{firstName(item.seller_name) ?? 'A trekker'}{item.location ? ` in ${item.location}` : ''}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GearCard({ item, index }: { item: GearItem; index: number }) {
  const cond = conditionColors[item.condition ?? ''] ?? conditionColors.good;
  const posted = timeAgo(item.created_at);
  const p = priceOf(item);
  const forWhat = item.listing_type === 'both' ? 'Sale or rent' : item.listing_type === 'rent' ? 'For rent' : 'For sale';

  return (
    <Link
      href={`/gear/${item.slug}`}
      className="gear-reveal group flex flex-col overflow-hidden rounded-2xl border border-[#eadfce] bg-white no-underline transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(23,36,47,0.12)]"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="relative h-[210px] overflow-hidden">
        <Cover item={item} className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17242f]/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cond}`}>
            {conditionLabel[item.condition ?? ''] ?? item.condition?.replace('_', ' ')}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#0f3d57]">{forWhat}</span>
        </div>
        {item.is_featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#dd8a3c] px-2.5 py-1 text-[11px] font-bold text-white">
            <Star className="h-3 w-3 fill-current" /> Staff pick
          </span>
        )}
        {item.location && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white">
            <MapPin className="h-3.5 w-3.5" /> {item.location}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[#1f8f86]">{item.brand}</span>
          {posted && (
            <span className="flex items-center gap-1 text-[#9a8d7c]"><Clock className="h-3 w-3" /> {posted}</span>
          )}
        </div>
        <h3 className="mb-2 line-clamp-1 text-[16px] font-bold text-[#17242f]">{item.title}</h3>

        <div className="mb-3 flex flex-wrap gap-2 text-[12px] text-[#5b6b76]">
          {item.size && item.size !== 'na' && <span className="rounded-md bg-[#f5efe6] px-2 py-1">Size {item.size.replace('_', ' ')}</span>}
          {Number(item.weight_kg) > 0 && <span className="rounded-md bg-[#f5efe6] px-2 py-1">{Number(item.weight_kg)} kg</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#f1e9dc] pt-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-[#17242f]">{p.main}</span>
              {item.sell_price && item.is_negotiable && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[#15803d]"><Handshake className="h-3 w-3" /> Open to offers</span>
              )}
            </div>
            {p.sub && <div className="text-xs text-[#6b7b86]">{p.sub}</div>}
            {item.seller_name && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#6b7b86]">
                <Avatar item={item} /> <span className="truncate">Listed by {firstName(item.seller_name)}</span>
              </div>
            )}
          </div>
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#0f3d57] px-4 py-2 text-xs font-bold text-white transition-colors group-hover:bg-[#b96a24]">
            Take a look <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function GearCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#eadfce] bg-white">
      <div className="h-[210px] bg-[#f1e9dc]" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 rounded bg-[#f1e9dc]" />
        <div className="h-4 w-3/4 rounded bg-[#f1e9dc]" />
        <div className="h-8 rounded bg-[#f1e9dc]" />
      </div>
    </div>
  );
}

export default function GearPage() {
  const [listingType, setListingType] = useState('all');
  const [condition, setCondition] = useState('all');
  const [size, setSize] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState('All');
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

  const heroItems = useMemo(() => {
    const withPhoto = items.filter((i) => i.cover_image || i.images?.length);
    const picks = withPhoto.filter((i) => i.is_featured);
    const rest = withPhoto.filter((i) => !i.is_featured);
    return [...picks, ...rest].slice(0, 3);
  }, [items]);

  const activeFilterCount = [
    listingType !== 'all', condition !== 'all', size !== 'all', !!search, negotiable, category !== 'All',
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = () => {
    setListingType('all'); setCondition('all'); setSize('all');
    setSearch(''); setNegotiable(false); setCategory('All');
  };

  const selectClass =
    'cursor-pointer rounded-lg border border-[#e3d8c8] bg-white px-3 py-2.5 text-[13px] font-medium text-[#374151] outline-none transition-colors focus:border-[#dd8a3c] focus-visible:ring-2 focus-visible:ring-[#dd8a3c]/40';

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f3d57] via-[#0a2e45] to-[#061e30] px-6 pb-16 pt-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 10% 15%, rgba(221,138,60,0.16) 0%, transparent 45%), radial-gradient(ellipse at 95% 85%, rgba(31,143,134,0.2) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.15fr]">
          <div>
            <h1 className="mb-4 max-w-[520px] text-[clamp(30px,5vw,50px)] font-extrabold leading-[1.1] tracking-tight text-white">
              Someone&apos;s last trek is your next one&apos;s gear
            </h1>
            <p className="m-0 max-w-[440px] text-[16px] leading-relaxed text-white/70">
              Boots that already know the trail to Thorong La. Jackets that kept someone warm at Base Camp. Buy
              them, rent them for the season, or pass on your own.
            </p>

            <div className="mt-7 flex max-w-[500px] items-center gap-2 rounded-2xl bg-white p-2 shadow-[0_20px_50px_rgba(6,30,48,0.35)] focus-within:ring-2 focus-within:ring-[#dd8a3c]">
              <Search className="ml-2 h-[18px] w-[18px] flex-shrink-0 text-[#9a8d7c]" />
              <input
                type="text"
                placeholder="What do you need for the trail? Tent, boots, jacket…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none bg-transparent py-2 text-[14px] text-[#17242f] outline-none placeholder:text-[#9a8d7c]"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Clear search"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[#9a8d7c] hover:bg-[#f5efe6]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <p className="mt-4 text-[14px] text-white/55">
              {isLoading ? 'Finding gear for you…' : total === 0 ? 'No listings match yet.' : `${total} item${total !== 1 ? 's' : ''} waiting for a new trail`}
            </p>
          </div>

          <HeroItems items={heroItems} loading={isLoading} />
        </div>
      </div>

      <div className="sticky top-[72px] z-[100] border-b border-[#eadfce] bg-[#faf6ef]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2.5 overflow-x-auto px-6 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-[13px] font-semibold transition-colors md:hidden ${
              showFilters ? 'border-[#0f3d57] bg-[#0f3d57] text-white' : 'border-[#e3d8c8] bg-white text-[#64748b]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#dd8a3c] text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden'} flex-shrink-0 flex-wrap items-center gap-2.5 md:flex`}>
            <select aria-label="Listing type" value={listingType} onChange={(e) => setListingType(e.target.value)} className={selectClass}>
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'Buy or rent' : t === 'both' ? 'Sale or rent' : t === 'sell' ? 'For sale' : 'For rent'}
                </option>
              ))}
            </select>
            <select aria-label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'Any condition' : conditionLabel[c]}</option>
              ))}
            </select>
            <select aria-label="Size" value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'Any size' : s === 'one_size' ? 'One size' : s.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={() => setNegotiable(!negotiable)}
              aria-pressed={negotiable}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                negotiable ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d]' : 'border-[#e3d8c8] bg-white text-[#64748b] hover:border-[#dd8a3c]/50'
              }`}
            >
              {negotiable && <Check className="h-3.5 w-3.5" />} Open to offers
            </button>
            {hasActiveFilters && (
              <button onClick={resetFilters}
                className="flex items-center gap-1 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fee2e2]">
                <X className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>

          {!isLoading && (
            <span className="ml-auto flex-shrink-0 whitespace-nowrap text-[13px] text-[#8a7d6b]">
              {total} item{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10 pb-20">
        {!isError && (
          <div className="mb-7 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = category === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setCategory(cat.label)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                    active ? 'bg-[#0f3d57] text-white' : 'border border-[#e3d8c8] bg-white text-[#5b6b76] hover:border-[#dd8a3c]/60 hover:text-[#17242f]'
                  }`}
                >
                  {cat.icon && <cat.icon className="h-3.5 w-3.5" />} {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {Array.from({ length: 6 }).map((_, i) => <GearCardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] py-14 text-center">
            <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-[#b91c1c]" />
            <p className="mb-1 font-semibold text-[#b91c1c]">We couldn&apos;t load the listings</p>
            <p className="text-[13px] text-[#64748b]">Check your connection and reload the page. If it keeps happening, the server may be down.</p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d6c8b2] bg-white py-20 text-center">
            <Backpack className="mx-auto mb-4 h-12 w-12 text-[#d6c8b2]" strokeWidth={1.3} />
            <h3 className="mb-2 text-xl font-bold text-[#17242f]">Nothing here yet</h3>
            <p className="mx-auto mb-6 max-w-[360px] text-[#64748b]">
              {hasActiveFilters
                ? 'No gear matches those filters. Try removing one or two.'
                : 'No one has listed gear here. Yours could be the first.'}
            </p>
            {hasActiveFilters ? (
              <button onClick={resetFilters}
                className="rounded-lg border border-[#e3d8c8] bg-white px-6 py-2.5 text-sm font-semibold text-[#374151] hover:border-[#dd8a3c]/60">
                Clear filters
              </button>
            ) : (
              <Link href="/gear/create"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3d57] px-6 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90">
                {/* List your gear <ArrowRight className="h-4 w-4" /> */}
              </Link>
            )}
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {items.map((item, i) => <GearCard key={item.id} item={item} index={i} />)}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#0f3d57] px-7 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
              <Backpack className="h-5 w-5 text-[#f0aa5f]" />
            </div>
            <div>
              <div className="text-[17px] font-bold text-white">Gear gathering dust in a closet?</div>
              <div className="text-[14px] text-white/70">Listing takes a few minutes, and another trekker is probably searching for it right now.</div>
            </div>
          </div>
      

          {/* <Link href="/gear/create"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#dd8a3c] px-6 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-[#c97a2e]">
            List your gear <ArrowRight className="h-4 w-4" />
          </Link> */}

          <Link href="/gear/create"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#dd8a3c] px-6 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-[#c97a2e]">
            List your gear <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .gear-reveal { opacity: 0; animation: gearIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes gearIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gear-reveal { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}