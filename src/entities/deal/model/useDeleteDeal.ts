import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDeal } from '../api/dealApi';

/**
 * Hook to delete a deal
 */
export function useDeleteDeal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) => deleteDeal(dealId),
    onSuccess: () => {
      // Invalidate all deals queries
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-by-stage', workspaceId] });
    },
  });
}
