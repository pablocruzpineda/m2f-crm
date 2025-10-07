/**
 * @module entities/meeting/model
 * @description Hook to fetch meeting participants
 */

import { useQuery } from '@tanstack/react-query';
import { getMeetingParticipants } from '../api/meetingParticipantsApi';

export function useMeetingParticipants(meetingId: string | undefined) {
    return useQuery({
        queryKey: ['meeting-participants', meetingId],
        queryFn: () => getMeetingParticipants(meetingId!),
        enabled: !!meetingId,
        staleTime: 30000, // 30 seconds
    });
}
