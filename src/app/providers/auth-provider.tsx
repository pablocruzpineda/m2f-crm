/**
 * @module app/providers/auth-provider
 * @description Auth provider for managing authentication state
 */

import { useEffect, type ReactNode } from 'react';
import { supabase } from '@/shared/lib/supabase/client.js';
import { useSessionStore } from '@/entities/session';
import { getUserProfile } from '@/entities/user';
import type { AuthUser } from '@/shared/lib/auth/types.js';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Listens to Supabase auth state changes and updates session store
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setSession = useSessionStore((state) => state.setSession);
  const setLoading = useSessionStore((state) => state.setLoading);

  useEffect(() => {
    let mounted = true;
    let isLoadingProfile = false;
    let hasInitialized = false;

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (!mounted) return;

        if (session?.user) {
          if (isLoadingProfile) {
            return;
          }
          
          isLoadingProfile = true;
          
          try {
            const profile = await getUserProfile(session.user.id);
            
            if (!mounted) return;

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              profile,
            };
            setSession(session, authUser);
          } catch (error) {
            console.error('Error loading profile on init:', error);
            
            if (!mounted) return;

            // Set session without profile to unblock UI
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              profile: null,
            };
            setSession(session, authUser);
          } finally {
            isLoadingProfile = false;
          }
        } else {
          setSession(null, null);
        }
        
        hasInitialized = true;
      } catch (error) {
        console.error('Fatal error in initSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Skip INITIAL_SESSION - always handled by initSession
      if (event === 'INITIAL_SESSION') {
        return;
      }

      // Skip SIGNED_IN during initialization (page refresh), but allow it after user login
      if (event === 'SIGNED_IN' && !hasInitialized) {
        return;
      }

      if (session?.user) {
        if (isLoadingProfile) {
          return;
        }
        
        isLoadingProfile = true;
        
        try {
          const profile = await getUserProfile(session.user.id);
          
          if (!mounted) return;

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile,
          };
          setSession(session, authUser);
        } catch (error) {
          console.error('Error loading profile on auth change:', error);
          
          if (!mounted) return;

          // Set session without profile to unblock UI
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile: null,
          };
          setSession(session, authUser);
        } finally {
          isLoadingProfile = false;
        }
      } else {
        setSession(null, null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);

  return <>{children}</>;
}
