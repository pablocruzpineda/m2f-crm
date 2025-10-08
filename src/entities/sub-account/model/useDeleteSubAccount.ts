/**
 * @module entities/sub-account/model
 * @description Hook to delete a sub-account workspace
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteSubAccount } from '../api/subAccountApi';

export function useDeleteSubAccount(masterWorkspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (subAccountId: string) => deleteSubAccount(subAccountId),
        onSuccess: () => {
            // Invalidate sub-accounts list
            queryClient.invalidateQueries({
                queryKey: ['sub-accounts', masterWorkspaceId],
            });

            // Invalidate workspaces list
            queryClient.invalidateQueries({
                queryKey: ['workspaces'],
            });

            toast.success('Sub-account deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting sub-account:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete sub-account'
            );
        },
    });
}
