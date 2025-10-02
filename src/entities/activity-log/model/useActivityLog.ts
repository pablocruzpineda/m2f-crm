/**
 * Hook to fetch activity log with filters and pagination
 * Phase 5.3 - Step 8
 */

import { useQuery } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/entities/workspace';
import { getActivityLog, type ActivityFilters } from '../api/activityLogApi';

export function useActivityLog(
    filters?: ActivityFilters,
    limit: number = 50,
    offset: number = 0
) {
    const { currentWorkspace } = useCurrentWorkspace();

    return useQuery({
        queryKey: ['activity-log', currentWorkspace?.id, filters, limit, offset],
        queryFn: async () => {
            if (!currentWorkspace?.id) {
                throw new Error('No workspace selected');
            }
            return getActivityLog(currentWorkspace.id, filters, limit, offset);
        },
        enabled: !!currentWorkspace?.id,
        staleTime: 1000 * 30, // 30 seconds (activity is frequently updated)
    });
}
