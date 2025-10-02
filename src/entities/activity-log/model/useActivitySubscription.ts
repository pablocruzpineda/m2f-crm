/**
 * Hook to subscribe to real-time activity log updates
 * Phase 5.3 - Step 8
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/entities/workspace';
import { subscribeToActivityLog } from '../api/activityLogApi';

export function useActivitySubscription() {
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();

    const handleNewActivity = useCallback(
        () => {
            // Invalidate all activity-log queries to refetch
            queryClient.invalidateQueries({ queryKey: ['activity-log'] });
        },
        [queryClient]
    );

    useEffect(() => {
        if (!currentWorkspace?.id) return;

        const subscription = subscribeToActivityLog(
            currentWorkspace.id,
            handleNewActivity
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [currentWorkspace?.id, handleNewActivity]);
}
