import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Root application provider
 * Combines all context providers
 */
export function AppProvider({ children }: AppProviderProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
