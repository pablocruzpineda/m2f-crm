import { useQuery } from '@tanstack/react-query';
import { getDealsByStage } from '../api/dealApi';
import type { DealFilters, DealWithRelations } from '@/shared/lib/database/types';

/**
 * Hook to fetch deals grouped by pipeline stage (for Kanban board)
 */
export function useDealsByStage(
  workspaceId: string | undefined,
  filters?: Omit<DealFilters, 'stage_id'>
) {
  return useQuery<Record<string, DealWithRelations[]>>({
    queryKey: ['deals-by-stage', workspaceId, filters],
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      return getDealsByStage(workspaceId, filters);
    },
    enabled: !!workspaceId,
  });
}
