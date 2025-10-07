/**
 * @module entities/meeting/model
 * @description Hook to delete a meeting note
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteMeetingNote } from '../api/meetingNotesApi';

export function useDeleteNote(meetingId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteId: string) => deleteMeetingNote(noteId),
        onSuccess: () => {
            // Invalidate notes list
            queryClient.invalidateQueries({
                queryKey: ['meeting-notes', meetingId],
            });

            // Invalidate meeting details
            queryClient.invalidateQueries({
                queryKey: ['meeting', meetingId],
            });

            toast.success('Note deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting note:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete note'
            );
        },
    });
}
