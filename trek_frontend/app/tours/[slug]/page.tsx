import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReviewAnalysisCard from '@/components/reviews/Reviewanalysiscard';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import Reveal from '@/components/reveals/Reveal';
import { Review } from '@/types/review';
import '../../trek/[slug]/detail.css'; // same styles as the trek page
import './heroanim.css'; // banner fade + animation

const API_BASE = process.env.API_URL || 'http://127.0.0.1:8000/api';
const MEDIA = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000';

function mediaUrl(path?: string) {
  if (!path) return '/images/default.jpg';
  if (path.startsWith('http')) {
    return MEDIA + new URL(path).pathname;
  }
  return MEDIA + path;
}

async function getTour(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/tours/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Tour fetch failed:', err);
    return null;
  }
}

async function getTourReviews(tourId: number): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/reviews/?review_type=tour&tour_id=${tourId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    console.error('Review fetch failed:', err);
    return [];
  }
}

function toList(value?: string | string[], separator = ',') {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(separator)
    .map((x) => x.trim())
    .filter(Boolean);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const tour = await getTour(slug);
  if (!tour) notFound();

  const reviews = await getTourReviews(tour.id);


  const money = (n: number) => `NPR ${Math.round(n).toLocaleString('en-US')}`;

  const price = Number(tour.discounted_price || tour.price_per_person || 0);
  const originalPrice = Number(tour.price_per_person || 0);
  const childPrice = Number(tour.child_price || 0);
  const hasDiscount = tour.discount_percent > 0;

  const coverImage = tour.images?.find((i: any) => i.is_cover) || tour.images?.[0];
  const heroUrl = mediaUrl(coverImage?.image);

  const location = [tour.destination, tour.region].filter(Boolean).join(' · ');
  const highlights = toList(tour.highlights, '•');
  const rating = Number(tour.average_rating || 0);


  const badges = [];
  if (tour.guide_included) badges.push('🧭 Guide included');
  if (tour.transport_included) badges.push('🚐 Transport included');
  if (tour.meals_included) badges.push('🍽️ Meals included');
  if (tour.entry_fee_included) badges.push('🎟️ Entry fees included');

  let groupSize = null;
  if (tour.max_group_size) {
    groupSize = tour.min_group_size
      ? `${tour.min_group_size} to ${tour.max_group_size} people`
      : `Up to ${tour.max_group_size}`;
  }

 
  const stats = [
    ['Duration', tour.duration_days ? `${tour.duration_days} days` : null],
    ['Difficulty', tour.difficulty],
    ['Type', tour.tour_type],
    ['Group size', groupSize],
    ['Best season', tour.best_season_label || tour.best_season],
    ['Minimum age', tour.min_age ? `${tour.min_age}+` : null],
    ['Pickup', tour.pickup_point],
    ['Drop-off', tour.dropoff_point],
  ].filter(([, value]) => value) as [string, string][];

  return (
    <main className="trek">

      <header className="hero">
        <div className="hero-img" style={{ backgroundImage: `url("${heroUrl}")` }} />

        <div className="hero-inner">
          <div className="hero-region">
            {tour.region || tour.destination}
            {tour.duration_days ? ` · ${tour.duration_days} days` : ''}
          </div>

          <h1>{tour.title}</h1>

          <div className="chips">
            {tour.category?.name && (
              <span className="chip">
                {tour.category.icon} {tour.category.name}
              </span>
            )}
            {tour.difficulty && (
              <span className="chip" style={{ textTransform: 'capitalize' }}>
                {tour.difficulty}
              </span>
            )}
            {location && <span className="chip">📍 {location}</span>}
            {rating > 0 && <span className="chip">⭐ {rating.toFixed(1)}</span>}
            {tour.total_bookings > 0 && <span className="chip">{tour.total_bookings} booked</span>}
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="col">
          <Reveal className="panel">
            <h2>About this tour</h2>
            <p className="about">{tour.description}</p>

            {highlights.length > 0 && (
              <div className="callout">
                <h3>What you&apos;ll remember</h3>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {badges.length > 0 && (
              <div className="tags" style={{ marginTop: 16 }}>
                {badges.map((b) => (
                  <span key={b} className="tag">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </Reveal>

          {tour.images?.length > 0 && (
            <Reveal className="panel">
              <h2>Gallery</h2>
              <div className="gallery">
                {tour.images.map((img: any) => (
                  <figure key={img.id} className="shot" style={{ margin: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(img.image)} alt={img.caption || tour.title} />
                    {img.caption && <figcaption>{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          {tour.itinerary?.length > 0 && (
            <Reveal className="panel">
              <h2>Day by day</h2>
              <div className="timeline">
                {tour.itinerary.map((day: any) => (
                  <article key={day.id} className="day">
                    <div className="day-head">
                      <span className="day-num">Day {day.day}</span>
                      <h3>{day.title}</h3>
                    </div>

                    <p>{day.description}</p>

                    <div className="tags">
                      {day.accommodation && <span className="tag">🏠 {day.accommodation}</span>}
                      {day.meals && <span className="tag">🍽️ {day.meals}</span>}
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          )}

          {(tour.included || tour.excluded) && (
            <Reveal className="panel">
              <h2>What&apos;s included</h2>
              <div className="two">
                {tour.included && (
                  <div className="yes">
                    <h3>Included</h3>
                    {toList(tour.included).map((item) => (
                      <div key={item} className="li">
                        <i>✓</i>
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {tour.excluded && (
                  <div className="no">
                    <h3>Not included</h3>
                    {toList(tour.excluded).map((item) => (
                      <div key={item} className="li">
                        <i>✗</i>
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {tour.requirements && (
            <Reveal className="panel">
              <h2>Requirements</h2>
              <p className="about">{tour.requirements}</p>
            </Reveal>
          )}

          <Reveal className="panel">
            <h2>Traveller reviews</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <ReviewAnalysisCard reviewType="tour" objectId={tour.id} />

              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8aa0a5' }}>
                  No reviews yet. Been on this tour? Tell others how it went.
                </p>
              )}

              <div>
                <h3 className="serif" style={{ margin: '0 0 12px' }}>
                  Share your experience
                </h3>
                <ReviewForm reviewType="tour" objectId={tour.id} />
              </div>
            </div>
          </Reveal>
        </div>


        <aside>
          <div className="book">
            {hasDiscount && <p className="old-price">{money(originalPrice)}</p>}

            <div className="price">
              {money(price)}
              <small>per person</small>
              {hasDiscount && <span className="save">Save {tour.discount_percent}%</span>}
            </div>

            {childPrice > 0 && (
              <p className="fine" style={{ margin: '0 0 12px' }}>
                Children: {money(childPrice)}
              </p>
            )}

            {stats.length > 0 && (
              <div className="stats">
                {stats.map(([label, value]) => (
                  <div key={label} className="stat">
                    <small>{label}</small>
                    <b style={label === 'Difficulty' || label === 'Type' ? { textTransform: 'capitalize' } : {}}>
                      {value}
                    </b>
                  </div>
                ))}
              </div>
            )}

            <h3 className="serif" style={{ fontSize: 16, margin: '0 0 10px' }}>
              Upcoming departures
            </h3>

            {tour.availability?.length > 0 ? (
              tour.availability.slice(0, 3).map((av: any) => (
                <div key={av.id} className="slot">
                  <span>
                    {formatDate(av.start_date)} to {formatDate(av.end_date)}
                  </span>
                  <span className={av.remaining_slots > 3 ? 'ok' : 'low'}>
                    {av.remaining_slots} spots left
                  </span>
                </div>
              ))
            ) : (
              <p className="fine" style={{ margin: '0 0 12px' }}>
                No fixed dates yet, contact us for departures
              </p>
            )}

            <Link className="btn primary" href={`/bookings/new?type=tour&slug=${tour.slug}`}>
              Book now
            </Link>

            <button type="button" className="btn ghost">
              💬 Ask a question
            </button>

            <p className="fine">Free cancellation up to 30 days before</p>
          </div>
        </aside>
      </div>
    </main>
  );
}