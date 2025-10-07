/**
 * @module entities/meeting/model
 * @description TypeScript types for meetings
 */

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface Meeting {
    id: string;
    workspace_id: string;
    title: string;
    description: string | null;
    start_time: string; // ISO 8601 timestamp
    end_time: string; // ISO 8601 timestamp
    timezone: string;
    location: string | null;
    meeting_url: string | null;
    status: MeetingStatus;
    created_by: string;
    contact_id: string | null;
    deal_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface MeetingParticipant {
    id: string;
    meeting_id: string;
    user_id: string | null;
    contact_id: string | null;
    status: ParticipantStatus;
    created_at: string;
}

export interface MeetingNote {
    id: string;
    meeting_id: string;
    content: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    author?: {
        id: string;
        full_name: string | null;
        email: string;
    } | null;
}

// Extended types with relations
export interface MeetingWithDetails extends Meeting {
    participants?: MeetingParticipant[];
    notes?: MeetingNote[];
    creator?: {
        id: string;
        full_name: string | null;
        email: string;
    } | null;
    contact?: {
        id: string;
        first_name: string;
        last_name: string | null;
    } | null;
    deal?: {
        id: string;
        title: string;
    } | null;
}

// Form types
export interface CreateMeetingInput {
    workspace_id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    timezone: string;
    location?: string;
    meeting_url?: string;
    contact_id?: string;
    deal_id?: string;
    participant_user_ids?: string[];
    participant_contact_ids?: string[];
}

export interface UpdateMeetingInput {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    timezone?: string;
    location?: string;
    meeting_url?: string;
    status?: MeetingStatus;
    contact_id?: string;
    deal_id?: string;
}

export interface MeetingsFilters {
    workspace_id: string;
    start_date?: string; // ISO date
    end_date?: string; // ISO date
    status?: MeetingStatus;
    created_by?: string;
    contact_id?: string;
    deal_id?: string;
}

export interface AddParticipantInput {
    meeting_id: string;
    user_id?: string;
    contact_id?: string;
}

export interface UpdateParticipantStatusInput {
    participant_id: string;
    status: ParticipantStatus;
}

export interface CreateNoteInput {
    meeting_id: string;
    content: string;
}

export interface UpdateNoteInput {
    content: string;
}
