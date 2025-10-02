/**
 * Hook to assign a contact to a user
 * Phase 5.3 - Team Collaboration
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignContact } from '../api/contactApi'
import { toast } from 'sonner'

export function useAssignContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ contactId, assignToUserId }: { contactId: string; assignToUserId: string }) => {
            return assignContact(contactId, assignToUserId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            queryClient.invalidateQueries({ queryKey: ['contact'] })
            toast.success('Contact assigned successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
