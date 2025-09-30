import { useQuery } from '@tanstack/react-query';
import { getContacts } from '../api/contactApi';
import type { ContactFilters } from '@/shared/lib/database/types';

/**
 * Hook to fetch contacts for a workspace with optional filters
 */
export function useContacts(workspaceId: string | undefined, filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', workspaceId, filters],
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }
      return getContacts(workspaceId, filters);
    },
    enabled: !!workspaceId,
  });
}
