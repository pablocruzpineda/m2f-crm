import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteContact } from '../api/contactApi';

/**
 * Hook to delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      // Invalidate all contacts queries
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
