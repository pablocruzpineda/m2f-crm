/**
 * @module entities/meeting/model
 * @description Hook to remove a participant from a meeting
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { removeMeetingParticipant } from '../api/meetingParticipantsApi';

interface RemoveParticipantVariables {
    participantId: string;
    meetingId: string;
}

export function useRemoveParticipant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ participantId }: RemoveParticipantVariables) =>
            removeMeetingParticipant(participantId),
        onSuccess: (_, variables) => {
            // Invalidate participants list
            queryClient.invalidateQueries({
                queryKey: ['meeting-participants', variables.meetingId],
            });

            // Invalidate meeting details
            queryClient.invalidateQueries({
                queryKey: ['meeting', variables.meetingId],
            });

            toast.success('Participant removed successfully!');
        },
        onError: (error) => {
            console.error('Error removing participant:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to remove participant'
            );
        },
    });
}
