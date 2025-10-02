import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bulkAssignDeals } from '../api/dealApi';

export function useBulkAssignDeals() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            dealIds,
            assignToUserId,
        }: {
            dealIds: string[];
            assignToUserId: string;
        }) => {
            return bulkAssignDeals(dealIds, assignToUserId);
        },
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            toast.success(
                `${count} deal${count > 1 ? 's' : ''} assigned successfully`
            );
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to assign deals');
        },
    });
}
