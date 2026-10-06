import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReviewAnalysisCard from '@/components/reviews/Reviewanalysiscard';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import Reveal from '@/components/reveals/Reveal';
import { Review } from '@/types/review';
import './detail.css';

const API_BASE =
  process.env.API_URL || 'http://127.0.0.1:8000/api';

const MEDIA =
  process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000';

async function getTrek(slug: string) {
  try {
    const res = await fetch(
      `${API_BASE}/treks/${slug}/`,
      { cache: 'no-store' }
    );

    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error('Trek fetch failed:', err);
    return null;
  }
}

async function getTrekReviews(
  trekId: number
): Promise<Review[]> {
  try {
    const res = await fetch(
      `${API_BASE}/reviews/?review_type=trek&trek_id=${trekId}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return Array.isArray(data)
      ? data
      : data.results ?? [];
  } catch (err) {
    console.error('Review fetch failed:', err);
    return [];
  }
}

const list = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export default async function TrekDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const trek = await getTrek(slug);

  if (!trek) notFound();

  const reviews = await getTrekReviews(trek.id);

  const price = Number(
    trek.discounted_price || trek.price_per_person
  );

  const original = Number(
    trek.price_per_person
  );

  const hasDiscount =
    trek.discount_percent > 0;

  const imageUrl = trek.images?.[0]?.image
    ? `${MEDIA}${trek.images[0].image}`
    : '/images/default.jpg';

  const stats = [
    [
      'Duration',
      `${trek.duration_days} days`,
    ],
    [
      'Difficulty',
      trek.difficulty,
    ],
    [
      'Max altitude',
      `${trek.max_altitude}m`,
    ],
    [
      'Group size',
      `Up to ${trek.max_group_size}`,
    ],
    [
      'Best season',
      trek.best_season,
    ],
    [
      'Minimum age',
      `${trek.min_age}+`,
    ],
  ];

  return (
    <main className="trek">

      {/* =====================================================
          HERO
      ===================================================== */}

      <header className="hero">

        <div
          className="hero-img"
          style={{
            backgroundImage: `url("${imageUrl}")`,
          }}
        />

        <div className="hero-inner">

          <div className="hero-region">
            {trek.region} · {trek.duration_days} days
          </div>

          <h1>
            {trek.title}
          </h1>

          <div className="chips">

            <span
              className="chip"
              style={{
                textTransform: 'capitalize',
              }}
            >
              {trek.difficulty}
            </span>

            <span className="chip">
              📍 {trek.start_point} to {trek.end_point}
            </span>

            {trek.tims_required && (
              <span className="chip warn">
                📋 TIMS permit needed
              </span>
            )}

          </div>

          <div className="peak">

            <b>
              {trek.max_altitude}m
            </b>

            <span>
              highest point on the trail
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="wrap">

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="col">

          {/* ABOUT */}
          <Reveal className="panel">

            <h2>
              About this trek
            </h2>

            <p className="about">
              {trek.description}
            </p>

            {trek.highlight && (
              <div className="callout">

                <h3>
                  What you'll remember
                </h3>

                <p>
                  {trek.highlight}
                </p>

              </div>
            )}

          </Reveal>


          {/* GALLERY */}
          {trek.images?.length > 0 && (
            <Reveal className="panel">

              <h2>
                Gallery
              </h2>

              <div className="gallery">

                {trek.images.map(
                  (img: any) => (
                    <figure
                      key={img.id}
                      className="shot"
                      style={{
                        margin: 0,
                      }}
                    >

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${MEDIA}${img.image}`}
                        alt={
                          img.caption ||
                          trek.title
                        }
                      />

                      {img.caption && (
                        <figcaption>
                          {img.caption}
                        </figcaption>
                      )}

                    </figure>
                  )
                )}

              </div>

            </Reveal>
          )}


          {/* ITINERARY */}
          {trek.itinerary?.length > 0 && (
            <Reveal className="panel">

              <h2>
                Day by day
              </h2>

              <div className="timeline">

                {trek.itinerary.map(
                  (day: any) => (
                    <article
                      key={day.id}
                      className="day"
                    >

                      <div className="day-head">

                        <span className="day-num">
                          Day {day.day}
                        </span>

                        <h3>
                          {day.title}
                        </h3>

                      </div>

                      <p>
                        {day.description}
                      </p>

                      <div className="tags">

                        {day.altitude_m && (
                          <span className="tag">
                            🏔️ {day.altitude_m}m
                          </span>
                        )}

                        {day.accommodation && (
                          <span className="tag">
                            🏠 {day.accommodation}
                          </span>
                        )}

                        {day.meals && (
                          <span className="tag">
                            🍽️ {day.meals}
                          </span>
                        )}

                      </div>

                    </article>
                  )
                )}

              </div>

            </Reveal>
          )}


          {/* INCLUDED / EXCLUDED */}
          {(trek.included || trek.excluded) && (
            <Reveal className="panel">

              <h2>
                What's included
              </h2>

              <div className="two">

                {trek.included && (
                  <div className="yes">

                    <h3>
                      Included
                    </h3>

                    {list(trek.included).map(
                      (t, i) => (
                        <div
                          key={i}
                          className="li"
                        >
                          <i>✓</i>
                          {t}
                        </div>
                      )
                    )}

                  </div>
                )}

                {trek.excluded && (
                  <div className="no">

                    <h3>
                      Not included
                    </h3>

                    {list(trek.excluded).map(
                      (t, i) => (
                        <div
                          key={i}
                          className="li"
                        >
                          <i>✗</i>
                          {t}
                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </Reveal>
          )}


          {/* PERMITS */}
          {trek.permit_info && (
            <Reveal className="panel">

              <h2>
                Permits and requirements
              </h2>

              <div className="callout permit">

                <p>
                  📋 {trek.permit_info}
                </p>

              </div>

            </Reveal>
          )}


          {/* REVIEWS */}
          <Reveal className="panel">

            <h2>
              Trekker reviews
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >

              <ReviewAnalysisCard
                reviewType="trek"
                objectId={trek.id}
              />

              {reviews.length > 0 ? (

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >

                  {reviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                    />
                  ))}

                </div>

              ) : (

                <p
                  style={{
                    color: '#8aa0a5',
                  }}
                >
                  No reviews yet. Walked this
                  trail? Tell others how it went.
                </p>

              )}

              <div>

                <h3
                  className="serif"
                  style={{
                    margin: '0 0 12px',
                  }}
                >
                  Share your experience
                </h3>

                <ReviewForm
                  reviewType="trek"
                  objectId={trek.id}
                />

              </div>

            </div>

          </Reveal>

        </div>


        {/* =================================================
            RIGHT COLUMN — BOOKING
        ================================================= */}

        <aside>

          <div className="book">

            {/* PRICE */}

            {hasDiscount && (
              <p className="old-price">
                NPR {original.toFixed(0)}
              </p>
            )}

            <div className="price">

              NPR {price.toFixed(0)}

              <small>
                per person
              </small>

              {hasDiscount && (
                <span className="save">
                  Save {trek.discount_percent}%
                </span>
              )}

            </div>


            {/* STATS */}

            <div className="stats">

              {stats.map(
                ([label, value]) => (
                  <div
                    key={label}
                    className="stat"
                  >

                    <small>
                      {label}
                    </small>

                    <b>
                      {value}
                    </b>

                  </div>
                )
              )}

            </div>


            {/* UPCOMING DEPARTURES */}

            {trek.availability?.length > 0 && (
              <>

                <h3
                  className="serif"
                  style={{
                    fontSize: 16,
                    margin: '0 0 10px',
                  }}
                >
                  Upcoming departures
                </h3>

                {trek.availability
                  .slice(0, 3)
                  .map((av: any) => (

                    <div
                      key={av.id}
                      className="slot"
                    >

                      <span>
                        {fmt(av.start_date)}
                        {' '}to{' '}
                        {fmt(av.end_date)}
                      </span>

                      <span
                        className={
                          av.remaining_slots > 3
                            ? 'ok'
                            : 'low'
                        }
                      >
                        {av.remaining_slots}{' '}
                        spots left
                      </span>

                    </div>

                  ))}

              </>
            )}


            {/* BOOK BUTTON */}

            <Link
              className="btn primary"
              href={`/bookings/new?type=trek&slug=${trek.slug}`}
            >
              Book now
            </Link>


            {/* ASK QUESTION */}

            <button
              type="button"
              className="btn ghost"
            >
              💬 Ask a question
            </button>


            {/* CANCELLATION */}

            <p className="fine">
              Free cancellation up to 30 days
              before
            </p>

          </div>

        </aside>

      </div>

    </main>
  );
}