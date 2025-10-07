/**
 * @module pages/calendar/lib
 * @description Calendar utility functions
 */

import type { MeetingWithDetails } from '@/entities/meeting';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: MeetingWithDetails;
    color?: string;
}

/**
 * Transform meetings to calendar events
 */
export function transformMeetingsToEvents(
    meetings: MeetingWithDetails[]
): CalendarEvent[] {
    return meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.start_time),
        end: new Date(meeting.end_time),
        allDay: false,
        resource: meeting,
        color: getMeetingColor(meeting.status),
    }));
}

/**
 * Get color based on meeting status
 */
function getMeetingColor(status: string): string {
    switch (status) {
        case 'scheduled':
            return '#3b82f6'; // blue
        case 'completed':
            return '#10b981'; // green
        case 'cancelled':
            return '#ef4444'; // red
        default:
            return '#6b7280'; // gray
    }
}

/**
 * Format meeting time range
 */
export function formatTimeRange(start: Date, end: Date): string {
    const startTime = start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return `${startTime} - ${endTime}`;
}
