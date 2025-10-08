/**
 * @module entities/sub-account/model
 * @description Hook to get master workspace for current user
 */

import { useQuery } from '@tanstack/react-query';
import { getMasterWorkspace } from '../api/subAccountApi';

export function useMasterWorkspace() {
    return useQuery({
        queryKey: ['master-workspace'],
        queryFn: () => getMasterWorkspace(),
        staleTime: 60000, // 1 minute
    });
}
