/**
 * @module shared/ui/skeleton
 * @description Loading skeleton component
 */

import { cn } from '@/shared/lib/utils/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
