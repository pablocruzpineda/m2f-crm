/**
 * Hook to update team member role
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMemberRole, type UpdateMemberRoleParams } from '../api/teamApi'
import { useCurrentWorkspace } from '@/entities/workspace'
import { toast } from 'sonner'

export function useUpdateMemberRole() {
    const queryClient = useQueryClient()
    const { currentWorkspace } = useCurrentWorkspace()

    return useMutation({
        mutationFn: async (params: Omit<UpdateMemberRoleParams, 'workspaceId'>) => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected')
            return updateMemberRole({ ...params, workspaceId: currentWorkspace.id })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', currentWorkspace?.id] })
            queryClient.invalidateQueries({ queryKey: ['workspace-member-role'] })
            toast.success('Member role updated successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
