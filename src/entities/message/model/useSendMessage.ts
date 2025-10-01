import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../api/messageApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { CreateMessageInput, Message, MessageWithSender } from '@/shared/lib/database/types';

interface OptimisticContext {
  previousMessages?: MessageWithSender[];
  contactId: string;
}

/**
 * Hook to send a new message with optimistic updates
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation<Message, Error, Omit<CreateMessageInput, 'workspace_id'>, OptimisticContext>({
    mutationFn: async (input) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      
      return sendMessage({
        ...input,
        workspace_id: currentWorkspace.id,
      });
    },
    // Optimistic update: show message immediately before server responds
    onMutate: async (newMessageInput) => {
      if (!currentWorkspace?.id) {
        return { contactId: newMessageInput.contact_id };
      }

      const contactId = newMessageInput.contact_id;
      const queryKey = ['messages', 'contact', contactId, currentWorkspace.id, undefined];

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<MessageWithSender[]>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<MessageWithSender[]>(queryKey, (old = []) => {
        const optimisticMessage: Partial<MessageWithSender> = {
          id: `temp-${Date.now()}`, // Temporary ID
          workspace_id: currentWorkspace.id,
          contact_id: contactId,
          sender_type: newMessageInput.sender_type,
          sender_id: newMessageInput.sender_id,
          content: newMessageInput.content,
          message_type: newMessageInput.message_type || 'text',
          media_url: newMessageInput.media_url || null,
          status: 'sent',
          read_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [...old, optimisticMessage as MessageWithSender];
      });

      // Return context with the snapshot
      return { previousMessages, contactId };
    },
    // If mutation fails, rollback to previous value
    onError: (_err, _newMessageInput, context) => {
      if (context?.previousMessages && context?.contactId && currentWorkspace?.id) {
        queryClient.setQueryData(
          ['messages', 'contact', context.contactId, currentWorkspace.id, undefined],
          context.previousMessages
        );
      }
    },
    // Always refetch after error or success to ensure we have the server state
    onSettled: (_newMessage, _error, variables) => {
      if (!currentWorkspace?.id) return;

      // Invalidate contact messages to replace optimistic update with real data
      queryClient.invalidateQueries({
        queryKey: ['messages', 'contact', variables.contact_id],
      });

      // Invalidate last messages (for contact list preview)
      queryClient.invalidateQueries({
        queryKey: ['messages', 'last'],
      });
    },
  });
}
