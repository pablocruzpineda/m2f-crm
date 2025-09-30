import { useQuery } from '@tanstack/react-query';
import { searchMessages } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { MessageWithSender } from '@/shared/lib/database/types';

/**
 * Hook to search messages across all contacts
 */
export function useSearchMessages(searchTerm: string) {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<MessageWithSender[], Error>({
    queryKey: ['messages', 'search', currentWorkspace?.id, searchTerm],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return searchMessages(currentWorkspace.id, searchTerm);
    },
    enabled: !!currentWorkspace?.id && searchTerm.length > 0,
    staleTime: 30000, // 30 seconds
  });
}
