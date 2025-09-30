import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';

/**
 * Hook to get unread message count for a contact
 */
export function useUnreadCount(contactId: string) {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<number, Error>({
    queryKey: ['messages', 'unread', contactId, currentWorkspace?.id],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return getUnreadCount(currentWorkspace.id, contactId);
    },
    enabled: !!currentWorkspace?.id && !!contactId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
