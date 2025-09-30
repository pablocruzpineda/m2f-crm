import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unassignTagFromContact } from '../api/contactTagApi';

/**
 * Hook to remove a tag from a contact
 */
export function useUnassignTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: string; tagId: string }) =>
      unassignTagFromContact(contactId, tagId),
    onSuccess: (_, variables) => {
      // Invalidate the specific contact to refresh its tags
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
