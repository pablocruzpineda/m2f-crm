/**
 * @module entities/meeting/model
 * @description Real-time subscription for meeting changes
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Meeting } from './types';

export function useMeetingSubscription(workspaceId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!workspaceId) return;

        const channel = supabase
            .channel(`meetings:${workspaceId}`)
            .on<Meeting>(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'meetings',
                    filter: `workspace_id=eq.${workspaceId}`,
                },
                (payload: RealtimePostgresChangesPayload<Meeting>) => {
                    console.log('Meeting change received:', payload);

                    // Invalidate relevant queries
                    queryClient.invalidateQueries({ queryKey: ['meetings'] });
                    queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });

                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        if (payload.new?.id) {
                            queryClient.invalidateQueries({
                                queryKey: ['meeting', payload.new.id],
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [workspaceId, queryClient]);
}
