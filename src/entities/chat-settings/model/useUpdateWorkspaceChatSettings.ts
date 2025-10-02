/**
 * Hook for updating workspace chat settings
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertWorkspaceChatSettings } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toast } from 'sonner';
import type { UpdateChatSettingsInput } from '@/shared/lib/database/types';

export function useUpdateWorkspaceChatSettings() {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    return useMutation({
        mutationFn: async (
            updates: Omit<UpdateChatSettingsInput, 'workspace_id' | 'user_id'>
        ) => {
            if (!currentWorkspace?.id) {
                throw new Error('No workspace selected');
            }
            return upsertWorkspaceChatSettings(currentWorkspace.id, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['workspace-chat-settings', currentWorkspace?.id],
            });
            toast.success('Workspace WhatsApp settings saved successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save workspace settings');
        },
    });
}
