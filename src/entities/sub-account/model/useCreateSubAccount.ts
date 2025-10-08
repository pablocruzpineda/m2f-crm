/**
 * @module entities/sub-account/model
 * @description Hook to create a sub-account workspace
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSubAccount } from '../api/subAccountApi';
import type { CreateSubAccountInput } from '../api/subAccountApi';

export function useCreateSubAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateSubAccountInput) => createSubAccount(input),
        onSuccess: (_, variables) => {
            // Invalidate sub-accounts list
            queryClient.invalidateQueries({
                queryKey: ['sub-accounts', variables.master_workspace_id],
            });

            // Invalidate workspaces list (user now has access to new workspace)
            queryClient.invalidateQueries({
                queryKey: ['workspaces'],
            });

            toast.success('Sub-account created successfully!');
        },
        onError: (error) => {
            console.error('Error creating sub-account:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create sub-account'
            );
        },
    });
}
