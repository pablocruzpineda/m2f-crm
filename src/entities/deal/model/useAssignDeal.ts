import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignDeal } from '../api/dealApi';

export function useAssignDeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            dealId,
            assignToUserId,
        }: {
            dealId: string;
            assignToUserId: string;
        }) => {
            return assignDeal(dealId, assignToUserId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['deal'] });
            toast.success('Deal assigned successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to assign deal');
        },
    });
}
