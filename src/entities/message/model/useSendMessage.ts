import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { CreateMessageInput, Message } from '@/shared/lib/database/types';

/**
 * Hook to send a new message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation<Message, Error, Omit<CreateMessageInput, 'workspace_id'>>({
    mutationFn: async (input) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      
      return sendMessage({
        ...input,
        workspace_id: currentWorkspace.id,
      });
    },
    onSuccess: (newMessage) => {
      // Invalidate contact messages to show the new message
      queryClient.invalidateQueries({
        queryKey: ['messages', 'contact', newMessage.contact_id],
      });

      // Invalidate workspace messages (for chat list)
      queryClient.invalidateQueries({
        queryKey: ['messages', 'workspace'],
      });

      // Invalidate last messages
      queryClient.invalidateQueries({
        queryKey: ['messages', 'last'],
      });
    },
  });
}
