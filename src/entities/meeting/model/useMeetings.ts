/**
 * @module entities/meeting/model
 * @description Hook to fetch meetings list with filters
 */

import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '../api/meetingApi';
import type { MeetingsFilters } from './types';

export function useMeetings(filters: MeetingsFilters) {
    return useQuery({
        queryKey: ['meetings', filters],
        queryFn: () => getMeetings(filters),
        enabled: !!filters.workspace_id,
        staleTime: 30000, // 30 seconds
    });
}
