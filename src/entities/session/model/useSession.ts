/**
 * @module entities/session/model
 * @description Session management with Zustand
 */

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, AuthState } from '@/shared/lib/auth/types.js';

interface SessionStore extends AuthState {
  setSession: (session: Session | null, user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
}

/**
 * Session store
 */
export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session, user) =>
    set({
      session,
      user,
      isAuthenticated: !!session && !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearSession: () =>
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

/**
 * Hook to access session state
 */
export function useSession() {
  const session = useSessionStore((state) => state.session);
  const user = useSessionStore((state) => state.user);
  const isLoading = useSessionStore((state) => state.isLoading);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
  };
}
