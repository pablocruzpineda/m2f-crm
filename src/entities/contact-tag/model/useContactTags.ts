import { useQuery } from '@tanstack/react-query';
import { getContactTags } from '../api/contactTagApi';

/**
 * Hook to fetch all tags for a workspace
 */
export function useContactTags(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['contact-tags', workspaceId],
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }
      return getContactTags(workspaceId);
    },
    enabled: !!workspaceId,
  });
}
