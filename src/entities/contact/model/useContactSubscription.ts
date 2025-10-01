import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { useCurrentWorkspace } from '@/entities/workspace'
import type { Database } from '@/shared/lib/database/types'

type ContactInsert = Database['public']['Tables']['contacts']['Insert']
type ContactUpdate = Database['public']['Tables']['contacts']['Update']

/**
 * Hook to subscribe to real-time contact changes
 * Automatically invalidates contact queries when contacts are created, updated, or deleted
 */
export function useContactSubscription() {
    const queryClient = useQueryClient()
    const { currentWorkspace } = useCurrentWorkspace()

    useEffect(() => {
        if (!currentWorkspace?.id) return

        console.log('[ContactSubscription] Setting up subscription for workspace:', currentWorkspace.id)

        const channel = supabase
            .channel(`contacts:${currentWorkspace.id}`)
            .on<ContactInsert | ContactUpdate>(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'contacts',
                    filter: `workspace_id=eq.${currentWorkspace.id}`,
                },
                (payload) => {
                    console.log('[ContactSubscription] Contact change detected:', payload.eventType, payload)

                    // Invalidate contact queries to refetch the list
                    queryClient.invalidateQueries({ queryKey: ['contacts', currentWorkspace.id] })

                    // Also invalidate messages queries since new contacts might have messages
                    if (payload.eventType === 'INSERT' && payload.new) {
                        const contactId = (payload.new as ContactInsert).id
                        queryClient.invalidateQueries({ queryKey: ['messages', contactId] })
                    }
                }
            )
            .subscribe((status) => {
                console.log('[ContactSubscription] Subscription status:', status)
            })

        return () => {
            console.log('[ContactSubscription] Cleaning up subscription')
            channel.unsubscribe()
        }
    }, [currentWorkspace?.id, queryClient])
}
