/**
 * @module entities/dashboard/model
 * @description Dashboard statistics hook
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboardApi';

/**
 * Hook to fetch dashboard statistics for a workspace
 */
export function useDashboardStats(workspaceId: string | undefined) {
    return useQuery({
        queryKey: ['dashboard-stats', workspaceId],
        queryFn: () => getDashboardStats(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 30000, // 30 seconds - refetch periodically
    });
}
