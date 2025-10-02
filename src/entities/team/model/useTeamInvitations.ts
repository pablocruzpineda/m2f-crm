/**
 * React Hooks for Team Invitation Management
 * Provides clean interface for invitation CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import {
    sendTeamInvitation,
    resendInvitation,
    cancelInvitation,
    getTeamInvitations,
    type SendInvitationParams,
} from '../api/invitationApi';
import type { TeamInvitation } from '@/shared/lib/database/types';

/**
 * Hook to fetch team invitations for current workspace
 */
export function useTeamInvitations() {
    const { currentWorkspace } = useCurrentWorkspace();

    return useQuery({
        queryKey: ['team-invitations', currentWorkspace?.id],
        queryFn: () => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected');
            return getTeamInvitations(currentWorkspace.id);
        },
        enabled: !!currentWorkspace?.id,
    });
}

/**
 * Hook to send a new team invitation
 */
export function useSendInvitation() {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();
    const { user } = useSession();

    return useMutation({
        mutationFn: async (params: Omit<SendInvitationParams, 'workspace_id' | 'invitedBy'>) => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected');
            if (!user?.id) throw new Error('Not authenticated');

            return sendTeamInvitation({
                ...params,
                workspace_id: currentWorkspace.id,
                invitedBy: user.id,
            });
        },
        onSuccess: () => {
            // Invalidate invitations list
            queryClient.invalidateQueries({ queryKey: ['team-invitations', currentWorkspace?.id] });
            // Also invalidate team members in case they need to see pending count
            queryClient.invalidateQueries({ queryKey: ['team-members', currentWorkspace?.id] });
        },
    });
}

/**
 * Hook to resend an invitation
 */
export function useResendInvitation() {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    return useMutation({
        mutationFn: (invitationId: string) => resendInvitation(invitationId),
        onSuccess: () => {
            // Invalidate invitations list to show updated timestamp
            queryClient.invalidateQueries({ queryKey: ['team-invitations', currentWorkspace?.id] });
        },
    });
}

/**
 * Hook to cancel an invitation
 */
export function useCancelInvitation() {
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    return useMutation({
        mutationFn: (invitationId: string) => cancelInvitation(invitationId),
        onSuccess: () => {
            // Invalidate invitations list
            queryClient.invalidateQueries({ queryKey: ['team-invitations', currentWorkspace?.id] });
        },
    });
}

/**
 * Hook to get invitation statistics
 */
export function useInvitationStats() {
    const { data: invitations = [] } = useTeamInvitations();

    const stats = {
        total: invitations.length,
        pending: invitations.filter((inv) => inv.status === 'pending').length,
        accepted: invitations.filter((inv) => inv.status === 'accepted').length,
        expired: invitations.filter((inv) => inv.status === 'expired').length,
        cancelled: invitations.filter((inv) => inv.status === 'cancelled').length,
    };

    return stats;
}

/**
 * Hook to check if an email has a pending invitation
 */
export function useHasPendingInvitation(email: string) {
    const { data: invitations = [] } = useTeamInvitations();

    return invitations.some(
        (inv) => inv.email === email && inv.status === 'pending'
    );
}

/**
 * Hook to get pending invitations only
 */
export function usePendingInvitations() {
    const { data: invitations = [] } = useTeamInvitations();

    return invitations.filter((inv) => inv.status === 'pending');
}

/**
 * Hook to check if invitation is expired
 */
export function useIsInvitationExpired(invitation: TeamInvitation): boolean {
    return new Date(invitation.expires_at) < new Date();
}

/**
 * Hook to get time until expiry
 */
export function useTimeUntilExpiry(invitation: TeamInvitation): string {
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
}
