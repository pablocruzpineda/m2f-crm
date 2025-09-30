import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact } from '../api/contactApi';
import type { UpdateContactInput } from '@/shared/lib/database/types';

/**
 * Hook to update an existing contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContactInput }) =>
      updateContact(id, input),
    onSuccess: (data) => {
      // Invalidate the specific contact
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
      // Invalidate the contacts list for the workspace
      queryClient.invalidateQueries({ queryKey: ['contacts', data.workspace_id] });
    },
  });
}
