'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 16,
  md: 22,
  lg: 28,
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  label,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const px = sizeMap[size];
  const displayValue = hovered ?? value;

  return (
    <div className="inline-flex items-center gap-2">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div
        className="inline-flex gap-0.5"
        onMouseLeave={() => setHovered(null)}
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={label ?? 'rating'}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={px}
              className={
                star <= displayValue
                  ? 'fill-teal-500 text-teal-500'
                  : 'fill-transparent text-gray-300'
              }
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
    </div>
  );
}