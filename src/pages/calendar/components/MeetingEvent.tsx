/**
 * @module pages/calendar/components
 * @description Custom meeting event component for calendar
 */

import type { EventProps } from 'react-big-calendar';
import type { CalendarEvent } from '../lib/utils';
import { Clock, MapPin, Users } from 'lucide-react';
import { formatTimeRange } from '../lib/utils';

export function MeetingEvent({ event }: EventProps<CalendarEvent>) {
    const meeting = event.resource;

    if (!meeting) {
        return <div className="text-xs font-medium truncate">{event.title}</div>;
    }

    return (
        <div className="p-1 space-y-0.5">
            <div className="font-medium text-xs truncate">{event.title}</div>
            <div className="flex items-center text-xs opacity-90">
                <Clock className="h-3 w-3 mr-1" />
                <span className="truncate">
                    {formatTimeRange(event.start, event.end)}
                </span>
            </div>
            {meeting.location && (
                <div className="flex items-center text-xs opacity-90">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{meeting.location}</span>
                </div>
            )}
            {meeting.participants && meeting.participants.length > 0 && (
                <div className="flex items-center text-xs opacity-90">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{meeting.participants.length} participants</span>
                </div>
            )}
        </div>
    );
}
