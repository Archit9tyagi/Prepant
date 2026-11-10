import React from 'react';
import { Button } from '../ui/button.js';
import { cn } from '../../lib/utils.js';

interface LoadMoreProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  className,
}) => {
  if (!hasMore) {
    return (
      <p className={cn('text-center text-xs text-slate-400 py-4', className)}>
        You&apos;ve reached the end of the results.
      </p>
    );
  }

  return (
    <div className={cn('flex justify-center py-6', className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        isLoading={isLoading}
        className="min-w-[140px]"
      >
        Load more
      </Button>
    </div>
  );
};
