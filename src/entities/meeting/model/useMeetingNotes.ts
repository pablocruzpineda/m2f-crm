/**
 * @module entities/meeting/model
 * @description Hook to fetch meeting notes
 */

import { useQuery } from '@tanstack/react-query';
import { getMeetingNotes } from '../api/meetingNotesApi';

export function useMeetingNotes(meetingId: string | undefined) {
    return useQuery({
        queryKey: ['meeting-notes', meetingId],
        queryFn: () => getMeetingNotes(meetingId!),
        enabled: !!meetingId,
        staleTime: 30000, // 30 seconds
    });
}
