/**
 * @module entities/sub-account/model
 * @description Hook to fetch sub-accounts for a master workspace
 */

import { useQuery } from '@tanstack/react-query';
import { getSubAccounts } from '../api/subAccountApi';

export function useSubAccounts(masterWorkspaceId: string | undefined) {
    return useQuery({
        queryKey: ['sub-accounts', masterWorkspaceId],
        queryFn: () => getSubAccounts(masterWorkspaceId!),
        enabled: !!masterWorkspaceId,
        staleTime: 30000, // 30 seconds
    });
}
