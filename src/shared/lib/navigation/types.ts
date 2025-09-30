/**
 * @module shared/lib/navigation
 * @description Navigation types and interfaces
 */

import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
}

export interface NavigationGroup {
  title?: string;
  items: NavigationItem[];
}
