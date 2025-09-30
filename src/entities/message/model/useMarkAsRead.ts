import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markMessageAsRead, markContactMessagesAsRead } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { Message } from '@/shared/lib/database/types';

/**
 * Hook to mark a single message as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, string>({
    mutationFn: markMessageAsRead,
    onSuccess: (updatedMessage) => {
      // Invalidate contact messages
      queryClient.invalidateQueries({
        queryKey: ['messages', 'contact', updatedMessage.contact_id],
      });

      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: ['messages', 'unread'],
      });
    },
  });
}

/**
 * Hook to mark all messages from a contact as read
 */
export function useMarkContactMessagesAsRead() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation<void, Error, string>({
    mutationFn: async (contactId: string) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return markContactMessagesAsRead(currentWorkspace.id, contactId);
    },
    onSuccess: (_, contactId) => {
      // Invalidate contact messages
      queryClient.invalidateQueries({
        queryKey: ['messages', 'contact', contactId],
      });

      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: ['messages', 'unread'],
      });

      // Invalidate workspace messages
      queryClient.invalidateQueries({
        queryKey: ['messages', 'workspace'],
      });
    },
  });
}
