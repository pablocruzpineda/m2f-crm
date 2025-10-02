/**
 * Hook for personal chat settings
 * Phase 5.3 - Team Collaboration
 */

import { useQuery } from '@tanstack/react-query';
import { getPersonalChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';

export function usePersonalChatSettings() {
    const { currentWorkspace } = useCurrentWorkspace();
    const { session } = useSession();
    const userId = session?.user?.id;

    return useQuery({
        queryKey: ['personal-chat-settings', currentWorkspace?.id, userId],
        queryFn: () => {
            if (!currentWorkspace?.id || !userId) {
                throw new Error('No workspace or user');
            }
            return getPersonalChatSettings(currentWorkspace.id, userId);
        },
        enabled: !!currentWorkspace?.id && !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
