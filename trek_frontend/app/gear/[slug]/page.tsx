import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Check } from 'lucide-react';
import GearGallery from '@/components/gear/GearGallery';
import MakeOfferButton from '@/components/gear/MakeOfferButton';

const API_BASE = process.env.API_URL || 'http://127.0.0.1:8000/api';

async function getGear(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/gear/${slug}/`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error('Gear fetch failed:', err);
    return null;
  }
}

const money = (n: number | string) => `NPR ${Math.round(Number(n)).toLocaleString('en-US')}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const pretty = (s?: string) => (s ? s.replace(/_/g, ' ') : '');

export default async function GearDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const gear = await getGear(slug);
  if (!gear) notFound();

  const canRent = (gear.listing_type === 'rent' || gear.listing_type === 'both') && !!gear.rent_price_per_day;
  const canBuy = (gear.listing_type === 'sell' || gear.listing_type === 'both') && !!gear.sell_price;
  const rating = Number(gear.average_rating || 0);

  const details = [
    ['Brand', gear.brand],
    ['Model', gear.model_name],
    ['Condition', pretty(gear.condition)],
    ['Size', gear.size && gear.size !== 'na' ? pretty(gear.size) : null],
    ['Weight', Number(gear.weight_kg) > 0 ? `${Number(gear.weight_kg)} kg` : null],
    ['Colour', gear.color],
    ['Year bought', gear.year_purchased],
  ].filter(([, v]) => v) as [string, string | number][];

  const windows = (gear.rental_availability || []).filter((w: any) => w.is_available);

  return (
    <main className="min-h-screen bg-[#f8f9fb] pb-20">
      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <Link
          href="/gear"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748b] no-underline hover:text-[#17242f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to gear
        </Link>

        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <GearGallery images={gear.images} title={gear.title} />

            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold text-[#17242f]">About this gear</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#475569]">{gear.description}</p>
            </section>

            {details.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-bold text-[#17242f]">Details</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {details.map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#e8ecf0] bg-white px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">{label}</div>
                      <div className="mt-0.5 text-sm font-semibold capitalize text-[#17242f]">{value}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold text-[#17242f]">Reviews</h2>
              {gear.reviews?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {gear.reviews.map((r: any) => (
                    <div key={r.id} className="rounded-xl border border-[#e8ecf0] bg-white p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#17242f]">{r.reviewer_name}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#ca8a04]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {r.rating}
                        </span>
                      </div>
                      {r.comment && <p className="m-0 text-sm text-[#475569]">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#94a3b8]">No reviews yet.</p>
              )}
            </section>
          </div>

          <aside>
            <div className="sticky top-24 rounded-[20px] border border-[#e8ecf0] bg-white p-6 shadow-[0_20px_50px_rgba(23,36,47,0.07)]">
              {gear.brand && (
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#1f8f86]">{gear.brand}</div>
              )}
              <h1 className="mb-2 text-2xl font-extrabold leading-tight text-[#17242f]">{gear.title}</h1>

              <div className="mb-5 flex flex-wrap items-center gap-3 text-[13px] text-[#64748b]">
                {gear.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {gear.location}
                  </span>
                )}
                {rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#ca8a04] text-[#ca8a04]" />
                    {rating.toFixed(1)}
                  </span>
                )}
                {gear.seller_name && <span>Listed by {gear.seller_name}</span>}
              </div>

              {canBuy && (
                <div className="mb-2">
                  <div className="text-3xl font-extrabold text-[#17242f]">{money(gear.sell_price)}</div>
                  {gear.is_negotiable && (
                    <span className="text-xs font-semibold text-[#16a34a]">Price is negotiable</span>
                  )}
                </div>
              )}

              {canRent && (
                <div className="mb-2">
                  <div className={canBuy ? 'text-sm text-[#64748b]' : 'text-3xl font-extrabold text-[#17242f]'}>
                    {canBuy ? 'or rent for ' : ''}
                    <b className={canBuy ? 'text-[#17242f]' : ''}>{money(gear.rent_price_per_day)}</b>
                    <span className="text-sm font-semibold text-[#64748b]"> / day</span>
                  </div>
                  {Number(gear.deposit_amount) > 0 && (
                    <div className="mt-1 text-xs text-[#64748b]">
                      Refundable deposit: {money(gear.deposit_amount)}
                    </div>
                  )}
                </div>
              )}

              {canRent && windows.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-bold text-[#17242f]">Available for rent</h3>
                  <div className="flex flex-col gap-1.5">
                    {windows.slice(0, 4).map((w: any) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-2 rounded-lg bg-[#f0fdf4] px-3 py-2 text-[13px] text-[#166534]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {formatDate(w.start_date)} to {formatDate(w.end_date)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                {canBuy && gear.is_available && (
                  <MakeOfferButton
                    slug={gear.slug}
                    title={gear.title}
                    askingPrice={Number(gear.sell_price)}
                    isNegotiable={!!gear.is_negotiable}
                  />
                )}

                {canRent && gear.is_available && (
                  <Link
                    href={`/booking/new?type=gear_rent&slug=${gear.slug}`}
                    className="rounded-xl bg-gradient-to-br from-[#e6994a] to-[#b96a24] px-6 py-3 text-center text-sm font-bold text-white no-underline transition-transform hover:-translate-y-0.5"
                  >
                    Rent this gear
                  </Link>
                )}

                {!gear.is_available && (
                  <div className="rounded-xl bg-[#f1f5f9] px-6 py-3 text-center text-sm font-semibold text-[#64748b]">
                    Not available right now
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-[#94a3b8]">{gear.views_count} views</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}