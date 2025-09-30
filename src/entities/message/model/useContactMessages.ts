import { useQuery } from '@tanstack/react-query';
import { getContactMessages } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { MessageWithSender, MessageFilters } from '@/shared/lib/database/types';

/**
 * Hook to fetch messages for a specific contact
 */
export function useContactMessages(
  contactId: string,
  filters?: MessageFilters
) {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<MessageWithSender[], Error>({
    queryKey: ['messages', 'contact', contactId, currentWorkspace?.id, filters],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return getContactMessages(currentWorkspace.id, contactId, filters);
    },
    enabled: !!currentWorkspace?.id && !!contactId,
    staleTime: 10000, // 10 seconds - messages should be relatively fresh
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}
