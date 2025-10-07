/**
 * @module entities/meeting/api
 * @description Meeting notes operations
 */

import { supabase } from '@/shared/lib/supabase/client';
import type {
    MeetingNote,
    CreateNoteInput,
    UpdateNoteInput,
} from '../model/types';

/**
 * Get notes for a meeting
 */
export async function getMeetingNotes(meetingId: string): Promise<MeetingNote[]> {
    const { data, error } = await supabase
        .from('meeting_notes')
        .select(`
      *,
      author:profiles!created_by(id, full_name, email)
    `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching meeting notes:', error);
        throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return (data || []) as unknown as MeetingNote[];
}

/**
 * Create a new note for a meeting
 */
export async function createMeetingNote(
    input: CreateNoteInput
): Promise<MeetingNote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('meeting_notes')
        .insert({
            meeting_id: input.meeting_id,
            content: input.content,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating meeting note:', error);
        throw new Error(`Failed to create note: ${error.message}`);
    }

    // Log activity
    const { data: meeting } = await supabase
        .from('meetings')
        .select('workspace_id, title')
        .eq('id', input.meeting_id)
        .single();

    if (meeting) {
        await supabase.from('activity_log').insert({
            workspace_id: meeting.workspace_id,
            user_id: user.id,
            action: 'created',
            entity_type: 'meeting_note',
            entity_id: data.id,
            details: {
                meeting_title: meeting.title,
                note_preview: input.content.substring(0, 100),
            },
        });
    }

    return data as MeetingNote;
}

/**
 * Update a meeting note
 */
export async function updateMeetingNote(
    noteId: string,
    input: UpdateNoteInput
): Promise<MeetingNote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('meeting_notes')
        .update({ content: input.content })
        .eq('id', noteId)
        .select()
        .single();

    if (error) {
        console.error('Error updating meeting note:', error);
        throw new Error(`Failed to update note: ${error.message}`);
    }

    return data;
}

/**
 * Delete a meeting note
 */
export async function deleteMeetingNote(noteId: string): Promise<void> {
    const { error } = await supabase
        .from('meeting_notes')
        .delete()
        .eq('id', noteId);

    if (error) {
        console.error('Error deleting meeting note:', error);
        throw new Error(`Failed to delete note: ${error.message}`);
    }
}
