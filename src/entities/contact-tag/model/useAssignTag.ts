import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignTagToContact } from '../api/contactTagApi';

/**
 * Hook to assign a tag to a contact
 */
export function useAssignTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, tagId }: { contactId: string; tagId: string }) =>
      assignTagToContact(contactId, tagId),
    onSuccess: (_, variables) => {
      // Invalidate the specific contact to refresh its tags
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
