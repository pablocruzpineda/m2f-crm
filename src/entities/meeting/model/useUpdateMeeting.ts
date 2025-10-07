/**
 * @module entities/meeting/model
 * @description Hook to update a meeting
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateMeeting } from '../api/meetingApi';
import type { UpdateMeetingInput } from './types';

interface UpdateMeetingVariables {
    id: string;
    input: UpdateMeetingInput;
}

export function useUpdateMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: UpdateMeetingVariables) =>
            updateMeeting(id, input),
        onSuccess: (data) => {
            // Invalidate meetings list
            queryClient.invalidateQueries({ queryKey: ['meetings'] });

            // Invalidate specific meeting
            queryClient.invalidateQueries({ queryKey: ['meeting', data.id] });

            // Invalidate calendar queries
            queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });

            toast.success('Meeting updated successfully!');
        },
        onError: (error) => {
            console.error('Error updating meeting:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update meeting'
            );
        },
    });
}
