/**
 * @module entities/meeting/model
 * @description Hook to update a meeting note
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateMeetingNote } from '../api/meetingNotesApi';
import type { UpdateNoteInput } from './types';

export function useUpdateNote(meetingId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, input }: { noteId: string; input: UpdateNoteInput }) =>
            updateMeetingNote(noteId, input),
        onSuccess: () => {
            // Invalidate notes list
            queryClient.invalidateQueries({
                queryKey: ['meeting-notes', meetingId],
            });

            // Invalidate meeting details
            queryClient.invalidateQueries({
                queryKey: ['meeting', meetingId],
            });

            toast.success('Note updated successfully!');
        },
        onError: (error) => {
            console.error('Error updating note:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update note'
            );
        },
    });
}
