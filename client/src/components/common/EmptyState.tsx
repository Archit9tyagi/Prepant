import React from 'react';
import { HelpCircle, type LucideIcon } from 'lucide-react';
import { Button } from '../ui/button.js';
import { cn } from '../../lib/utils.js';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-white rounded-[16px] border border-dashed border-slate-300 max-w-md mx-auto my-6',
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-5" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};
