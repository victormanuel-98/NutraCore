import React from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating, maxRating = 5, onRatingChange, readonly = true, size = 20 }) {
  const [hover, setHover] = React.useState(0);

  return (
    <div className="flex gap-1 items-center">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hover || rating);
        const isHalf = !hover && starValue - 0.5 === rating;

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform duration-200'} focus:outline-none`}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => !readonly && onRatingChange(starValue)}
          >
            <div className="relative">
              <Star
                size={size}
                stroke="var(--pink-accent)"
                fill={isActive ? "var(--pink-accent)" : "transparent"}
                className="transition-colors duration-200"
                strokeWidth={2}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star size={size} stroke="var(--pink-accent)" fill="var(--pink-accent)" strokeWidth={2} />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
