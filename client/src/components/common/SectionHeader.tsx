import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  align = 'left',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8',
        align === 'center' && 'md:flex-col md:items-center text-center',
        className,
      )}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm md:text-base text-slate-600">{subtitle}</p>}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 cursor-pointer self-start md:self-auto group"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};
