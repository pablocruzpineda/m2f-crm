/**
 * @module entities/meeting/api
 * @description Meeting par  if (error) {
    // Handle duplicate participant error
    if (error.code === '23505') {
      throw new Error('This participant is already added to the meeting');
    }
    console.error('Error adding meeting participant:', error);
    throw new Error(`Failed to add participant: ${error.message}`);
  }

  return data as MeetingParticipant;operations
 */

import { supabase } from '@/shared/lib/supabase/client';
import type {
    MeetingParticipant,
    AddParticipantInput,
    UpdateParticipantStatusInput,
} from '../model/types';

/**
 * Get participants for a meeting
 */
export async function getMeetingParticipants(
    meetingId: string
): Promise<MeetingParticipant[]> {
    const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
      *,
      user:profiles(id, full_name, email),
      contact:contacts(id, first_name, last_name, email, phone)
    `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching meeting participants:', error);
        throw new Error(`Failed to fetch participants: ${error.message}`);
    }

    return (data || []) as unknown as MeetingParticipant[];
}

/**
 * Add a participant to a meeting
 */
export async function addMeetingParticipant(
    input: AddParticipantInput
): Promise<MeetingParticipant> {
    // Validate that either user_id or contact_id is provided, not both
    if (
        (input.user_id && input.contact_id) ||
        (!input.user_id && !input.contact_id)
    ) {
        throw new Error(
            'Must provide either user_id or contact_id, but not both or none'
        );
    }

    const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
            meeting_id: input.meeting_id,
            user_id: input.user_id || null,
            contact_id: input.contact_id || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        // Handle duplicate participant error
        if (error.code === '23505') {
            throw new Error('Participant is already added to this meeting');
        }
        console.error('Error adding meeting participant:', error);
        throw new Error(`Failed to add participant: ${error.message}`);
    }

    return data as MeetingParticipant;
}

/**
 * Update participant RSVP status
 */
export async function updateParticipantStatus(
    input: UpdateParticipantStatusInput
): Promise<MeetingParticipant> {
    const { data, error } = await supabase
        .from('meeting_participants')
        .update({ status: input.status })
        .eq('id', input.participant_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating participant status:', error);
        throw new Error(`Failed to update participant status: ${error.message}`);
    }

    return data as MeetingParticipant;
}

/**
 * Remove a participant from a meeting
 */
export async function removeMeetingParticipant(
    participantId: string
): Promise<void> {
    const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);

    if (error) {
        console.error('Error removing meeting participant:', error);
        throw new Error(`Failed to remove participant: ${error.message}`);
    }
}

/**
 * Add multiple participants at once (batch)
 */
export async function addMultipleParticipants(
    meetingId: string,
    userIds: string[] = [],
    contactIds: string[] = []
): Promise<MeetingParticipant[]> {
    const participants: Array<{
        meeting_id: string;
        user_id: string | null;
        contact_id: string | null;
        status: 'pending';
    }> = [];

    userIds.forEach((userId) => {
        participants.push({
            meeting_id: meetingId,
            user_id: userId,
            contact_id: null,
            status: 'pending',
        });
    });

    contactIds.forEach((contactId) => {
        participants.push({
            meeting_id: meetingId,
            user_id: null,
            contact_id: contactId,
            status: 'pending',
        });
    });

    if (participants.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('meeting_participants')
        .insert(participants)
        .select();

    if (error) {
        console.error('Error adding multiple participants:', error);
        throw new Error(`Failed to add participants: ${error.message}`);
    }

    return (data || []) as MeetingParticipant[];
}
