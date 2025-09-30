import { useQuery } from '@tanstack/react-query';
import { getWorkspaceMessages } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { MessageWithSender, MessageFilters } from '@/shared/lib/database/types';

/**
 * Hook to fetch all workspace messages (for chat list)
 */
export function useWorkspaceMessages(filters?: MessageFilters) {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<MessageWithSender[], Error>({
    queryKey: ['messages', 'workspace', currentWorkspace?.id, filters],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return getWorkspaceMessages(currentWorkspace.id, filters);
    },
    enabled: !!currentWorkspace?.id,
    staleTime: 10000, // 10 seconds
  });
}
