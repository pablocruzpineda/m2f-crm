/**
 * @module entities/meeting/model
 * @description Hook to add a participant to a meeting
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addMeetingParticipant } from '../api/meetingParticipantsApi';
import type { AddParticipantInput } from './types';

export function useAddParticipant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: AddParticipantInput) => addMeetingParticipant(input),
        onSuccess: (_, variables) => {
            // Invalidate participants list
            queryClient.invalidateQueries({
                queryKey: ['meeting-participants', variables.meeting_id],
            });

            // Invalidate meeting details
            queryClient.invalidateQueries({
                queryKey: ['meeting', variables.meeting_id],
            });

            toast.success('Participant added successfully!');
        },
        onError: (error) => {
            console.error('Error adding participant:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to add participant'
            );
        },
    });
}
