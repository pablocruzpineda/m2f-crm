import { useQuery } from '@tanstack/react-query';
import { getContact } from '../api/contactApi';

/**
 * Hook to fetch a single contact by ID
 */
export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Contact ID is required');
      }
      return getContact(id);
    },
    enabled: !!id,
  });
}
