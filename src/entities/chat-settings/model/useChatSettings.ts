import { useQuery } from '@tanstack/react-query';
import { getChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { ChatSettings } from '@/shared/lib/database/types';

/**
 * Hook to get chat settings for current workspace
 */
export function useChatSettings() {
  const { currentWorkspace } = useCurrentWorkspace();

  return useQuery<ChatSettings | null, Error>({
    queryKey: ['chat-settings', currentWorkspace?.id],
    queryFn: () => {
      if (!currentWorkspace?.id) throw new Error('No workspace selected');
      return getChatSettings(currentWorkspace.id);
    },
    enabled: !!currentWorkspace?.id,
    staleTime: 30000, // 30 seconds
  });
}
