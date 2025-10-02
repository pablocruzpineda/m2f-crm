/**
 * Hook to remove a team member
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeTeamMember } from '../api/teamApi'
import { useCurrentWorkspace } from '@/entities/workspace'
import { toast } from 'sonner'

export function useRemoveTeamMember() {
    const queryClient = useQueryClient()
    const { currentWorkspace } = useCurrentWorkspace()

    return useMutation({
        mutationFn: async (userId: string) => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected')
            return removeTeamMember({ workspaceId: currentWorkspace.id, userId })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', currentWorkspace?.id] })
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            queryClient.invalidateQueries({ queryKey: ['deals'] })
            toast.success('Team member removed and their data reassigned')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
