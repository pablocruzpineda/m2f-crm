/**
 * @module entities/sub-account/model
 * @description Hook to check if workspace is a sub-account
 */

import { useQuery } from '@tanstack/react-query';
import { isSubAccountWorkspace } from '../api/subAccountApi';

export function useIsSubAccount(workspaceId: string | undefined) {
    return useQuery({
        queryKey: ['is-sub-account', workspaceId],
        queryFn: () => isSubAccountWorkspace(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 60000, // 1 minute
    });
}
