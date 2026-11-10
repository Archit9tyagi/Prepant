import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface StatCardProps {
  icon?: LucideIcon;
  value: string;
  label: string;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 bg-white rounded-[16px] border border-slate-200 text-center shadow-xs',
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 rounded-full bg-primary-50 p-3 text-primary-600">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
        {value}
      </span>
      <span className="mt-1 text-sm font-semibold text-slate-700">{label}</span>
      {description && <span className="mt-0.5 text-xs text-slate-400">{description}</span>}
    </div>
  );
};
