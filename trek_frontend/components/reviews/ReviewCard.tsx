'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BadgeCheck, ThumbsUp } from 'lucide-react';
import StarRating from './StarRating';
import { markReviewHelpful } from '@/lib/review';
import { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

const subRatingLabels: { key: keyof Review; label: string }[] = [
  { key: 'value_rating', label: 'Value' },
  { key: 'service_rating', label: 'Service' },
  { key: 'safety_rating', label: 'Safety' },
  { key: 'scenery_rating', label: 'Scenery' },
];

export default function ReviewCard({ review }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [marked, setMarked] = useState(!!review.is_helpful_by_me);
  const [submitting, setSubmitting] = useState(false);

  const handleHelpful = async () => {
    if (marked || submitting) return;
    setSubmitting(true);
    try {
      await markReviewHelpful(review.id);
      setHelpfulCount((c) => c + 1);
      setMarked(true);
    } catch {
      // silently ignore — not critical if this fails
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
            {review?.user?.avatar ? (
              <Image
                src={review?.user?.avatar}
                alt={review?.user?.username}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              review?.user?.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-navy-900 text-sm">{review?.user?.username}</span>
              {review.is_verified && (
                <BadgeCheck size={15} className="text-teal-600" aria-label="Verified traveler" />
              )}
            </div>
            {review.travel_date && (
              <span className="text-xs text-gray-400">
                Traveled {new Date(review.travel_date).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      <div>
        <h4 className="font-semibold text-navy-900 mb-1">{review.title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      </div>

      {(review.value_rating || review.service_rating || review.safety_rating || review.scenery_rating) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500 pt-1">
          {subRatingLabels.map(({ key, label }) =>
            review[key] ? (
              <span key={key}>
                {label}: <span className="text-navy-800 font-medium">{review[key] as number}/5</span>
              </span>
            ) : null
          )}
        </div>
      )}

      {review?.images?.length > 0 && (
        <div className="flex gap-2 pt-1">
          {review?.images.map((img) => (
            <div key={img?.id} className="relative h-16 w-16 rounded-lg overflow-hidden">
              <Image src={img?.image} alt="Review photo" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <button
          onClick={handleHelpful}
          disabled={marked || submitting}
          className={`flex items-center gap-1.5 text-xs ${
            marked ? 'text-teal-600' : 'text-gray-400 hover:text-teal-600'
          } transition-colors disabled:cursor-default`}
        >
          <ThumbsUp size={13} className={marked ? 'fill-teal-600' : ''} />
          Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>
        {review?.is_featured && (
          <span className="text-[10px] font-medium tracking-wide uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>
    </div>
  );
}