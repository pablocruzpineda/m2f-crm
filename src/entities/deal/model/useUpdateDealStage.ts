import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDealStage } from '../api/dealApi';

/**
 * Hook to update deal stage (for drag-and-drop)
 */
export function useUpdateDealStage(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      stageId,
      position,
    }: {
      dealId: string;
      stageId: string;
      position: number;
    }) => updateDealStage(dealId, stageId, position),
    onSuccess: () => {
      // Invalidate deals-by-stage to refresh the Kanban board
      queryClient.invalidateQueries({ queryKey: ['deals-by-stage', workspaceId] });
    },
  });
}
