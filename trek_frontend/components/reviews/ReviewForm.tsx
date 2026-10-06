'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { createReview, uploadReviewImage } from '@/lib/review';
import { Review } from '@/types/review';

interface ReviewFormProps {
  reviewType: 'trek' | 'tour' | 'gear' | 'guide';
  objectId: number;
  bookingReference?: string;
  onSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  reviewType,
  objectId,
  bookingReference,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [sceneryRating, setSceneryRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5)); // cap at 5 images
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select an overall rating.');
      return;
    }
    if (!title.trim() || !comment.trim()) {
      setError('Please fill in a title and comment.');
      return;
    }

    setSubmitting(true);
    try {
      // Upload images first, collect their ids
      const imageIds: number[] = [];
      for (const file of files) {
        const uploaded = await uploadReviewImage(file);
        imageIds.push(uploaded.id);
      }

      const review = await createReview({
        review_type: reviewType,
        object_id: objectId,
        booking_reference: bookingReference,
        title: title.trim(),
        comment: comment.trim(),
        rating,
        value_rating: valueRating || undefined,
        service_rating: serviceRating || undefined,
        safety_rating: safetyRating || undefined,
        scenery_rating: sceneryRating || undefined,
        travel_date: travelDate || undefined,
        image_ids: imageIds.length > 0 ? imageIds : undefined,
      });

      onSuccess?.(review);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Something went wrong submitting your review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-100 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">Overall rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Value</label>
          <StarRating value={valueRating} onChange={setValueRating} size="sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Service</label>
          <StarRating value={serviceRating} onChange={setServiceRating} size="sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Safety</label>
          <StarRating value={safetyRating} onChange={setSafetyRating} size="sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Scenery</label>
          <StarRating value={sceneryRating} onChange={setSceneryRating} size="sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5" htmlFor="review-title">
          Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Sum up your experience"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5" htmlFor="review-comment">
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="Tell other travelers about your experience"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5" htmlFor="travel-date">
          Travel date <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="travel-date"
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Photos <span className="text-gray-400 font-normal">(optional, up to 5)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={files.length >= 5}
          className="text-sm text-gray-500"
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, i) => (
              <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}