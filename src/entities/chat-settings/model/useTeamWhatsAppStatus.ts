/**
 * Hook for team WhatsApp status
 * Phase 5.3 - Team Collaboration
 * Shows which team members have configured personal settings
 */

import { useQuery } from '@tanstack/react-query';
import { getTeamWhatsAppStatus } from '../api/chatSettingsApi';
import { useCurrentWorkspace } from '@/entities/workspace';

export function useTeamWhatsAppStatus() {
    const { currentWorkspace } = useCurrentWorkspace();

    return useQuery({
        queryKey: ['team-whatsapp-status', currentWorkspace?.id],
        queryFn: () => {
            if (!currentWorkspace?.id) {
                throw new Error('No workspace selected');
            }
            return getTeamWhatsAppStatus(currentWorkspace.id);
        },
        enabled: !!currentWorkspace?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
