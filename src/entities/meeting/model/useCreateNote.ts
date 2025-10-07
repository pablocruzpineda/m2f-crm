/**
 * @module entities/meeting/model
 * @description Hook to create a meeting note
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createMeetingNote } from '../api/meetingNotesApi';
import type { CreateNoteInput } from './types';

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateNoteInput) => createMeetingNote(input),
        onSuccess: (_, variables) => {
            // Invalidate notes list
            queryClient.invalidateQueries({
                queryKey: ['meeting-notes', variables.meeting_id],
            });

            // Invalidate meeting details (includes notes)
            queryClient.invalidateQueries({
                queryKey: ['meeting', variables.meeting_id],
            });

            toast.success('Note added successfully!');
        },
        onError: (error) => {
            console.error('Error creating note:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to add note'
            );
        },
    });
}
