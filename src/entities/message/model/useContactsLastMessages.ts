import { useQuery } from '@tanstack/react-query';
import { getContactsLastMessages } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { MessageWithSender } from '@/shared/lib/database/types';

/**
 * Hook to get last message for each contact (for chat list preview)
 */
export function useContactsLastMessages() {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<Record<string, MessageWithSender>, Error>({
    queryKey: ['messages', 'last', currentWorkspace?.id],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return getContactsLastMessages(currentWorkspace.id);
    },
    enabled: !!currentWorkspace?.id,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for new messages
  });
}
