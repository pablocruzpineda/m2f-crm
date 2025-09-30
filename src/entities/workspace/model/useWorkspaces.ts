/**
 * @module entities/workspace/model
 * @description Workspace hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getUserWorkspaces } from '../api/workspaceApi.js';
import type { Workspace } from '@/shared/lib/auth/types.js';

/**
 * Hook to get user's workspaces
 */
export function useWorkspaces(userId: string | undefined) {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces', userId],
    queryFn: () => (userId ? getUserWorkspaces(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
