/**
 * @module features/auth/login/model
 * @description Login logic hook
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase/client.js';
import { mapSupabaseError } from '@/shared/lib/auth/errors.js';
import type { LoginCredentials, AuthError } from '@/shared/lib/auth/types.js';

/**
 * Login hook
 */
export function useLogin() {
  const [error, setError] = useState<AuthError | null>(null);

  const mutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Set a timeout for the auth call
      const authPromise = supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth request timeout')), 10000);
      });

      const result = await Promise.race([authPromise, timeoutPromise]);
      const { data, error: authError } = result;

      if (authError) {
        console.error('Login error:', authError);
        throw authError;
      }

      return data;
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (err: unknown) => {
      const authError = mapSupabaseError(err);
      setError(authError);
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
