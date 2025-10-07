/**
 * @module entities/meeting/model
 * @description Hook to create a meeting
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createMeeting } from '../api/meetingApi';
import type { CreateMeetingInput } from './types';

export function useCreateMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateMeetingInput) => createMeeting(input),
        onSuccess: (_, variables) => {
            // Invalidate meetings list
            queryClient.invalidateQueries({ queryKey: ['meetings'] });

            // Invalidate calendar queries
            queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });

            // Invalidate contact/deal meetings if linked
            if (variables.contact_id) {
                queryClient.invalidateQueries({
                    queryKey: ['meetings', { contact_id: variables.contact_id }],
                });
            }
            if (variables.deal_id) {
                queryClient.invalidateQueries({
                    queryKey: ['meetings', { deal_id: variables.deal_id }],
                });
            }

            toast.success('Meeting created successfully!');
        },
        onError: (error) => {
            console.error('Error creating meeting:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create meeting'
            );
        },
    });
}
