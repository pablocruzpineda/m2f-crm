import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContactTag } from '../api/contactTagApi';
import type { CreateContactTagInput } from '@/shared/lib/database/types';

/**
 * Hook to create a new contact tag
 */
export function useCreateContactTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactTagInput) => createContactTag(input),
    onSuccess: (_, variables) => {
      // Invalidate tags list for the workspace
      queryClient.invalidateQueries({
        queryKey: ['contact-tags', variables.workspace_id],
      });
    },
  });
}
