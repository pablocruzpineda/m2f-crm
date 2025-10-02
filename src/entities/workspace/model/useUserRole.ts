/**
 * Hook to get current user's role in the workspace
 * Phase 5.3 - Team Collaboration
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase/client'
import { useSession } from '@/entities/session'
import { useCurrentWorkspace } from './useCurrentWorkspace'
import type { Role } from '@/shared/lib/permissions'
import {
    canManageMembers,
    canSeeAllData,
    canChangeTheme,
    canConfigureWorkspaceWhatsApp,
    canDeleteEntity,
    canAssignToOthers,
    canViewActivity,
} from '@/shared/lib/permissions'

export function useUserRole() {
    const { session } = useSession()
    const { currentWorkspace } = useCurrentWorkspace()
    const userId = session?.user?.id

    const { data: role, isLoading } = useQuery({
        queryKey: ['workspace-member-role', currentWorkspace?.id, userId],
        queryFn: async () => {
            if (!currentWorkspace?.id || !userId) return null

            const { data, error } = await supabase
                .from('workspace_members')
                .select('role')
                .eq('workspace_id', currentWorkspace.id)
                .eq('user_id', userId)
                .single()

            if (error) {
                console.error('Error fetching user role:', error)
                return 'member' as Role
            }

            return (data?.role as Role) || 'member'
        },
        enabled: !!currentWorkspace?.id && !!userId,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })

    const currentRole = role || 'member'

    return {
        role: currentRole,
        isLoading,
        isOwner: currentRole === 'owner',
        isAdmin: currentRole === 'admin',
        isMember: currentRole === 'member',
        isViewer: currentRole === 'viewer',

        // Permission checks
        canManageMembers: canManageMembers(currentRole),
        canSeeAllData: canSeeAllData(currentRole),
        canChangeTheme: canChangeTheme(currentRole),
        canConfigureWorkspaceWhatsApp: canConfigureWorkspaceWhatsApp(currentRole),
        canDeleteEntity: canDeleteEntity(currentRole),
        canAssignToOthers: canAssignToOthers(currentRole),
        canViewActivity: canViewActivity(),
    }
}
