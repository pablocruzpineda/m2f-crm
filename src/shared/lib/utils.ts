/**
 * @module shared/lib/utils
 * @description Utility functions for shared use across the application
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 * Used by Shadcn UI components for className composition
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
