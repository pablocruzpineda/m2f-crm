/**
 * @module entities/meeting/model
 * @description Hook to delete a meeting
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteMeeting } from '../api/meetingApi';

export function useDeleteMeeting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMeeting(id),
        onSuccess: () => {
            // Invalidate meetings list
            queryClient.invalidateQueries({ queryKey: ['meetings'] });

            // Invalidate calendar queries
            queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });

            toast.success('Meeting deleted successfully!');
        },
        onError: (error) => {
            console.error('Error deleting meeting:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete meeting'
            );
        },
    });
}
