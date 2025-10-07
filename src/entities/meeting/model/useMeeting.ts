/**
 * @module entities/meeting/model
 * @description Hook to fetch a single meeting with details
 */

import { useQuery } from '@tanstack/react-query';
import { getMeeting } from '../api/meetingApi';

export function useMeeting(id: string | undefined) {
    return useQuery({
        queryKey: ['meeting', id],
        queryFn: () => getMeeting(id!),
        enabled: !!id,
        staleTime: 30000, // 30 seconds
    });
}
