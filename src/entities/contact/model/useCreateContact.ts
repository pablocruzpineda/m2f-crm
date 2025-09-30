import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContact } from '../api/contactApi';
import type { CreateContactInput } from '@/shared/lib/database/types';

/**
 * Hook to create a new contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: (_, variables) => {
      // Invalidate contacts list for the workspace
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.workspace_id] });
    },
  });
}
