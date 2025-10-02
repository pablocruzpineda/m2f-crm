/**
 * Hook to fetch team members
 * Phase 5.3 - Team Collaboration
 */

import { useQuery } from '@tanstack/react-query'
import { getTeamMembers } from '../api/teamApi'
import { useCurrentWorkspace } from '@/entities/workspace'

export function useTeamMembers() {
    const { currentWorkspace } = useCurrentWorkspace()

    return useQuery({
        queryKey: ['team-members', currentWorkspace?.id],
        queryFn: () => {
            if (!currentWorkspace?.id) throw new Error('No workspace selected')
            return getTeamMembers(currentWorkspace.id)
        },
        enabled: !!currentWorkspace?.id,
    })
}
