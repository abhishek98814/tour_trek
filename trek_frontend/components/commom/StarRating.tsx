import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 18,
  showValue = true,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => (
          <Star
            key={index}
            size={size}
            className={
              index < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}