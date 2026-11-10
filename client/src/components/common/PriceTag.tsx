import React from 'react';
import { formatPrice } from '../../lib/money.js';
import { cn } from '../../lib/utils.js';

interface PriceTagProps {
  paise: number;
  perHour?: boolean;
  trial?: boolean;
  originalPaise?: number;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  paise,
  perHour = true,
  trial = false,
  originalPaise,
  className,
}) => {
  return (
    <div className={cn('inline-flex items-baseline gap-1.5', className)}>
      {trial && (
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-[6px]">
          Trial
        </span>
      )}
      <span className="text-lg font-extrabold text-slate-900">{formatPrice(paise)}</span>
      {originalPaise && (
        <span className="text-xs text-slate-400 line-through">{formatPrice(originalPaise)}</span>
      )}
      {perHour && <span className="text-xs font-medium text-slate-500">/hr</span>}
    </div>
  );
};
