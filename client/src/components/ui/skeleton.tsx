import * as React from 'react';
import { cn } from '../../lib/utils.js';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-[10px] bg-slate-200/80', className)} {...props} />
  );
}

export { Skeleton };
