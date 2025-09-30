import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDeal } from '../api/dealApi';
import type { UpdateDealInput } from '@/shared/lib/database/types';

/**
 * Hook to update a deal
 */
export function useUpdateDeal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDealInput }) =>
      updateDeal(id, input),
    onSuccess: (_data, variables) => {
      // Invalidate specific deal and lists
      queryClient.invalidateQueries({ queryKey: ['deal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['deals', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['deals-by-stage', workspaceId] });
    },
  });
}
