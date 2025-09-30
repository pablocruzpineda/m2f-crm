import { useQuery } from '@tanstack/react-query';
import { getDeal } from '../api/dealApi';
import type { DealWithRelations } from '@/shared/lib/database/types';

/**
 * Hook to fetch a single deal by ID
 */
export function useDeal(dealId: string | undefined) {
  return useQuery<DealWithRelations | null>({
    queryKey: ['deal', dealId],
    queryFn: () => {
      if (!dealId) throw new Error('Deal ID is required');
      return getDeal(dealId);
    },
    enabled: !!dealId,
  });
}
