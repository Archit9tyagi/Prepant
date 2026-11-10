import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 'md',
  interactive = false,
  onChange,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = displayRating >= starIndex;
          const isHalf = !isFilled && displayRating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                'p-0.5 focus:outline-none transition-transform',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              )}
            >
              <Star
                className={cn(
                  starSizes[size],
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'fill-slate-200 text-slate-200',
                )}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-bold text-slate-900">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
};
