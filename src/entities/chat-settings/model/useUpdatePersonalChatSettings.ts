/**
 * Hook for updating personal chat settings
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertPersonalChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import { toast } from 'sonner';
import type { UpdateChatSettingsInput } from '@/shared/lib/database/types';

export function useUpdatePersonalChatSettings() {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();
    const { session } = useSession();
    const userId = session?.user?.id;

    return useMutation({
        mutationFn: async (
            updates: Omit<UpdateChatSettingsInput, 'workspace_id' | 'user_id'>
        ) => {
            if (!currentWorkspace?.id || !userId) {
                throw new Error('No workspace or user');
            }
            return upsertPersonalChatSettings(currentWorkspace.id, userId, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['personal-chat-settings', currentWorkspace?.id, userId],
            });
            toast.success('Personal WhatsApp settings saved successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save personal settings');
        },
    });
}
