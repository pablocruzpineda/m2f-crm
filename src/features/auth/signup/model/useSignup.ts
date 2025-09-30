/**
 * @module features/auth/signup/model
 * @description Signup logic hook
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase/client.js';
import { createWorkspace } from '@/entities/workspace';
import { mapSupabaseError } from '@/shared/lib/auth/errors.js';
import type { SignupData, AuthError } from '@/shared/lib/auth/types.js';

/**
 * Signup hook with workspace creation
 */
export function useSignup() {
  const [error, setError] = useState<AuthError | null>(null);

  const mutation = useMutation({
    mutationFn: async (signupData: SignupData) => {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
          },
        },
      });

      if (authError) {
        console.error('Signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // 2. Manual profile creation (trigger is disabled)
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authData.user.id,
          email: authData.user.email || '',
          full_name: signupData.fullName,
        },
        {
          onConflict: 'id',
        }
      );

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // 3. Create workspace for the new user
      const workspace = await createWorkspace(
        signupData.workspaceName,
        authData.user.id
      );

      return {
        user: authData.user,
        workspace,
      };
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
    signup: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
