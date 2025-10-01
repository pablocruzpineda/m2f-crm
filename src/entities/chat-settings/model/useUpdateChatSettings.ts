import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { ChatSettings, UpdateChatSettingsInput } from '@/shared/lib/database/types';

/**
 * Hook to update chat settings
 */
export function useUpdateChatSettings() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation<ChatSettings, Error, Omit<UpdateChatSettingsInput, 'workspace_id'>>({
    mutationFn: async (updates: Omit<UpdateChatSettingsInput, 'workspace_id'>) => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return upsertChatSettings(currentWorkspace.id, updates);
    },
    onSuccess: () => {
      // Invalidate chat settings to refetch
      queryClient.invalidateQueries({
        queryKey: ['chat-settings', currentWorkspace?.id],
      });
    },
  });
}
