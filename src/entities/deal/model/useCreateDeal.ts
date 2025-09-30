import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeal } from '../api/dealApi';
import type { CreateDealInput } from '@/shared/lib/database/types';

/**
 * Hook to create a new deal
 */
export function useCreateDeal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDealInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      return createDeal(workspaceId, input);
    },
    onSuccess: () => {
      // Invalidate deals queries
      queryClient.invalidateQueries({ queryKey: ['deals', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['deals-by-stage', workspaceId] });
    },
  });
}
