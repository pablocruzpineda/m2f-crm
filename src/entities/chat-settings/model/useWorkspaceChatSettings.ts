/**
 * Hook for workspace default chat settings
 * Phase 5.3 - Team Collaboration
 */

import { useQuery } from '@tanstack/react-query';
import { getWorkspaceChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';

export function useWorkspaceChatSettings() {
    const { currentWorkspace } = useCurrentWorkspace();

    return useQuery({
        queryKey: ['workspace-chat-settings', currentWorkspace?.id],
        queryFn: () => {
            if (!currentWorkspace?.id) {
                throw new Error('No workspace selected');
            }
            return getWorkspaceChatSettings(currentWorkspace.id);
        },
        enabled: !!currentWorkspace?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
