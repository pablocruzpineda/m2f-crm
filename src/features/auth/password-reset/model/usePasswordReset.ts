/**
 * @module features/auth/password-reset/model
 * @description Password reset logic hook
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase/client.js';
import { mapSupabaseError } from '@/shared/lib/auth/errors.js';
import type { PasswordResetRequest, PasswordReset, AuthError } from '@/shared/lib/auth/types.js';

/**
 * Request password reset hook
 */
export function usePasswordResetRequest() {
  const [error, setError] = useState<AuthError | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ email }: PasswordResetRequest) => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }
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
    requestReset: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Update password hook
 */
export function usePasswordUpdate() {
  const [error, setError] = useState<AuthError | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ password }: PasswordReset) => {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }
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
    updatePassword: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error,
    clearError: () => setError(null),
  };
}
