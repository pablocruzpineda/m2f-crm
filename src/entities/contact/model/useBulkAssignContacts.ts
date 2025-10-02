/**
 * Hook to bulk assign contacts to a user
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkAssignContacts } from '../api/contactApi'
import { toast } from 'sonner'

export function useBulkAssignContacts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ contactIds, assignToUserId }: { contactIds: string[]; assignToUserId: string }) => {
            return bulkAssignContacts(contactIds, assignToUserId)
        },
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            toast.success(`${count} contact${count > 1 ? 's' : ''} assigned successfully`)
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
