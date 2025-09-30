import { useQuery } from '@tanstack/react-query';
import { getPipelineStages } from '../api/pipelineStageApi';
import type { PipelineStage } from '@/shared/lib/database/types';

/**
 * Hook to fetch all pipeline stages for a workspace
 */
export function usePipelineStages(workspaceId: string | undefined) {
  return useQuery<PipelineStage[]>({
    queryKey: ['pipeline-stages', workspaceId],
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      return getPipelineStages(workspaceId);
    },
    enabled: !!workspaceId,
  });
}
