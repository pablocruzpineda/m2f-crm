/**
 * @module entities/meeting/api
 * @description Meeting CRUD operations
 */

import { supabase } from '@/shared/lib/supabase/client';
import type {
    Meeting,
    MeetingWithDetails,
    CreateMeetingInput,
    UpdateMeetingInput,
    MeetingsFilters,
} from '../model/types';

/**
 * Get meetings with optional filters
 */
export async function getMeetings(
    filters: MeetingsFilters
): Promise<MeetingWithDetails[]> {
    let query = supabase
        .from('meetings')
        .select(`
      *,
      creator:profiles!created_by(id, full_name, email),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title)
    `)
        .eq('workspace_id', filters.workspace_id)
        .order('start_time', { ascending: true });

    // Apply filters
    if (filters.start_date) {
        query = query.gte('start_time', filters.start_date);
    }

    if (filters.end_date) {
        query = query.lte('start_time', filters.end_date);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
    }

    if (filters.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
    }

    if (filters.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching meetings:', error);
        throw new Error(`Failed to fetch meetings: ${error.message}`);
    }

    return (data || []) as MeetingWithDetails[];
}

/**
 * Get a single meeting by ID with full details
 */
export async function getMeeting(id: string): Promise<MeetingWithDetails | null> {
    const { data, error } = await supabase
        .from('meetings')
        .select(`
      *,
      creator:profiles!created_by(id, full_name, email),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title),
      participants:meeting_participants(
        id,
        meeting_id,
        user_id,
        contact_id,
        status,
        created_at,
        user:profiles(id, full_name, email),
        contact:contacts(id, first_name, last_name)
      ),
      notes:meeting_notes(
        id,
        content,
        created_by,
        created_at,
        updated_at,
        author:profiles!created_by(id, full_name, email)
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching meeting:', error);
        throw new Error(`Failed to fetch meeting: ${error.message}`);
    }

    return data as unknown as MeetingWithDetails;
}

/**
 * Create a new meeting
 */
export async function createMeeting(
    input: CreateMeetingInput
): Promise<Meeting> {
    const { participant_user_ids, participant_contact_ids, ...meetingData } = input;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
            ...meetingData,
            created_by: user.id,
            status: 'scheduled',
        })
        .select()
        .single();

    if (meetingError) {
        console.error('Error creating meeting:', meetingError);
        throw new Error(`Failed to create meeting: ${meetingError.message}`);
    }

    // Add participants if provided
    if (participant_user_ids && participant_user_ids.length > 0) {
        const userParticipants = participant_user_ids.map(user_id => ({
            meeting_id: meeting.id,
            user_id,
            contact_id: null,
            status: 'pending' as const,
        }));

        const { error: participantsError } = await supabase
            .from('meeting_participants')
            .insert(userParticipants);

        if (participantsError) {
            console.error('Error adding user participants:', participantsError);
        }
    }

    if (participant_contact_ids && participant_contact_ids.length > 0) {
        const contactParticipants = participant_contact_ids.map(contact_id => ({
            meeting_id: meeting.id,
            user_id: null,
            contact_id,
            status: 'pending' as const,
        }));

        const { error: participantsError } = await supabase
            .from('meeting_participants')
            .insert(contactParticipants);

        if (participantsError) {
            console.error('Error adding contact participants:', participantsError);
        }
    }

    // Log activity
    await supabase.from('activity_log').insert({
        workspace_id: meetingData.workspace_id,
        user_id: user.id,
        action: 'created',
        entity_type: 'meeting',
        entity_id: meeting.id,
        details: {
            title: meeting.title,
            start_time: meeting.start_time,
        },
    });

    return meeting as Meeting;
}

/**
 * Update a meeting
 */
export async function updateMeeting(
    id: string,
    input: UpdateMeetingInput
): Promise<Meeting> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('meetings')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating meeting:', error);
        throw new Error(`Failed to update meeting: ${error.message}`);
    }

    // Log activity
    await supabase.from('activity_log').insert({
        workspace_id: data.workspace_id,
        user_id: user.id,
        action: 'updated',
        entity_type: 'meeting',
        entity_id: data.id,
        details: {
            title: data.title,
            changes: Object.keys(input),
        },
    });

    return data as Meeting;
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get meeting details before deletion for activity log
    const { data: meeting } = await supabase
        .from('meetings')
        .select('workspace_id, title')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting meeting:', error);
        throw new Error(`Failed to delete meeting: ${error.message}`);
    }

    // Log activity
    if (meeting) {
        await supabase.from('activity_log').insert({
            workspace_id: meeting.workspace_id,
            user_id: user.id,
            action: 'deleted',
            entity_type: 'meeting',
            entity_id: id,
            details: {
                title: meeting.title,
            },
        });
    }
}

/**
 * Get meetings for a specific date range (for calendar view)
 */
export async function getMeetingsForDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
): Promise<MeetingWithDetails[]> {
    const { data, error } = await supabase
        .from('meetings')
        .select(`
      *,
      creator:profiles!created_by(id, full_name, email),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title)
    `)
        .eq('workspace_id', workspaceId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching meetings for date range:', error);
        throw new Error(`Failed to fetch meetings: ${error.message}`);
    }

    return (data || []) as MeetingWithDetails[];
}

/**
 * Get upcoming meetings (next 7 days)
 */
export async function getUpcomingMeetings(
    workspaceId: string,
    limit: number = 10
): Promise<MeetingWithDetails[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data, error } = await supabase
        .from('meetings')
        .select(`
      *,
      creator:profiles!created_by(id, full_name, email),
      contact:contacts(id, first_name, last_name),
      deal:deals(id, title)
    `)
        .eq('workspace_id', workspaceId)
        .eq('status', 'scheduled')
        .gte('start_time', now.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching upcoming meetings:', error);
        throw new Error(`Failed to fetch upcoming meetings: ${error.message}`);
    }

    return (data || []) as MeetingWithDetails[];
}
