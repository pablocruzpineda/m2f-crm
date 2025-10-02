/**
 * Hook to add a team member
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addTeamMember, type AddTeamMemberParams } from '../api/teamApi'
import { useCurrentWorkspace } from '@/entities/workspace'
import { toast } from 'sonner'

export function useAddTeamMember() {
    const queryClient = useQueryClient()
    const { currentWorkspace } = useCurrentWorkspace()

    return useMutation({
        mutationFn: async (params: Omit<AddTeamMemberParams, 'workspaceId'>) => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected')
            return addTeamMember({ ...params, workspaceId: currentWorkspace.id })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', currentWorkspace?.id] })
            toast.success('Team member added successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
