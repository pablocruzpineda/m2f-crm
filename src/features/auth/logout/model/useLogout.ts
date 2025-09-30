/**
 * @module features/auth/logout/model
 * @description Logout logic hook
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase/client.js';
import { useSessionStore } from '@/entities/session';
import { useWorkspaceStore } from '@/entities/workspace';
import { clearStorage } from '@/shared/lib/storage';

/**
 * Logout hook
 */
export function useLogout() {
  const clearSession = useSessionStore((state) => state.clearSession);
  const clearCurrentWorkspace = useWorkspaceStore((state) => state.clearCurrentWorkspace);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all local state
      clearSession();
      clearCurrentWorkspace();
      clearStorage();
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
