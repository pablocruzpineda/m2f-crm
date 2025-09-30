/**
 * @module shared/ui/layouts
 * @description Standard page container with consistent padding
 */

import { cn } from '@/shared/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
