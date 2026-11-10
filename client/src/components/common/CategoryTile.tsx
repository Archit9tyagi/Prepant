import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface CategoryTileProps {
  name: string;
  slug: string;
  icon: string;
  subjectCount?: number;
  onClick?: () => void;
  className?: string;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  name,
  icon,
  subjectCount,
  onClick,
  className,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.BookOpen;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center justify-center rounded-[16px] border border-slate-200 bg-white p-5 text-center shadow-xs transition-all hover:border-primary-500 hover:shadow-md hover:translate-y-[-2px] cursor-pointer',
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
        <IconComponent className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">
        {name}
      </h4>
      {subjectCount !== undefined && (
        <span className="mt-1 text-xs text-slate-400">{subjectCount} subjects</span>
      )}
    </button>
  );
};
