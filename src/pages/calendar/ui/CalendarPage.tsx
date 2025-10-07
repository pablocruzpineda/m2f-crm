/**
 * @module pages/calendar
 * @description Main calendar page with month/week/day views
 */

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useMeetings, useCreateMeeting } from '@/entities/meeting';
import { useCurrentWorkspace } from '@/entities/workspace';
import { CalendarViewSwitcher, MeetingEvent } from '../components';
import { transformMeetingsToEvents, type CalendarEvent } from '../lib/utils';
import { MeetingFormDialog, MeetingDetailDialog } from '@/features/meeting-form';
import type { CreateMeetingInput, MeetingWithDetails } from '@/entities/meeting';
import { useUpdateMeeting } from '@/entities/meeting';
import {
    addMultipleParticipants,
    removeMeetingParticipant
} from '@/entities/meeting/api/meetingParticipantsApi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

// Setup the localizer for react-big-calendar
const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export function CalendarPage() {
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<MeetingWithDetails | undefined>();

    // Calculate date range for fetching meetings
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Fetch meetings for current view
    const { data: meetings = [], isLoading } = useMeetings({
        workspace_id: currentWorkspace?.id || '',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
    });

    // Meeting mutations
    const createMeeting = useCreateMeeting();
    const updateMeeting = useUpdateMeeting();

    // Transform meetings to calendar events
    const events = transformMeetingsToEvents(meetings);

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        if (action === 'TODAY') {
            setCurrentDate(new Date());
        } else if (action === 'PREV') {
            setCurrentDate(prev => subMonths(prev, 1));
        } else {
            setCurrentDate(prev => addMonths(prev, 1));
        }
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
        setSelectedDate(start);
        setIsDialogOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedMeetingId(event.id);
        setIsDetailDialogOpen(true);
    };

    const handleCreateMeeting = async (data: CreateMeetingInput) => {
        if (editingMeeting) {
            // Update existing meeting
            // Extract participant fields as they're not part of the meetings table
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { participant_user_ids = [], participant_contact_ids = [], workspace_id, ...updateData } = data;

            try {
                // First, update the meeting details
                await updateMeeting.mutateAsync({
                    id: editingMeeting.id,
                    input: updateData,
                });

                // Then sync participants
                const currentParticipants = editingMeeting.participants || [];

                // Get current user and contact IDs
                const currentUserIds = currentParticipants
                    .filter(p => p.user_id)
                    .map(p => p.user_id!);
                const currentContactIds = currentParticipants
                    .filter(p => p.contact_id)
                    .map(p => p.contact_id!);

                // Find participants to remove
                const usersToRemove = currentParticipants.filter(
                    p => p.user_id && !participant_user_ids.includes(p.user_id)
                );
                const contactsToRemove = currentParticipants.filter(
                    p => p.contact_id && !participant_contact_ids.includes(p.contact_id)
                );

                // Find participants to add
                const userIdsToAdd = participant_user_ids.filter(
                    id => !currentUserIds.includes(id)
                );
                const contactIdsToAdd = participant_contact_ids.filter(
                    id => !currentContactIds.includes(id)
                );

                // Remove participants
                await Promise.all([
                    ...usersToRemove.map(p => removeMeetingParticipant(p.id)),
                    ...contactsToRemove.map(p => removeMeetingParticipant(p.id)),
                ]);

                // Add new participants
                if (userIdsToAdd.length > 0 || contactIdsToAdd.length > 0) {
                    await addMultipleParticipants(
                        editingMeeting.id,
                        userIdsToAdd,
                        contactIdsToAdd
                    );
                }

                // Invalidate queries to refetch updated data
                await queryClient.invalidateQueries({ queryKey: ['meetings'] });
                await queryClient.invalidateQueries({ queryKey: ['meeting', editingMeeting.id] });

                setIsDialogOpen(false);
                setSelectedDate(undefined);
                setEditingMeeting(undefined);
            } catch (error) {
                console.error('Error updating meeting:', error);
                // The mutation will handle error display
            }
        } else {
            // Create new meeting
            createMeeting.mutate(
                {
                    ...data,
                    workspace_id: currentWorkspace!.id,
                },
                {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setSelectedDate(undefined);
                    },
                }
            );
        }
    };

    const handleEditMeeting = (meeting: MeetingWithDetails) => {
        setEditingMeeting(meeting);
        setIsDetailDialogOpen(false); // Close detail dialog
        setIsDialogOpen(true); // Open form dialog
    };

    if (!currentWorkspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No workspace selected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">
                        Manage your meetings and schedule
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedDate(new Date());
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Meeting
                </Button>
            </div>

            {/* Calendar Controls */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleNavigate('PREV')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleNavigate('TODAY')}
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleNavigate('NEXT')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-semibold ml-4">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                    </div>

                    <CalendarViewSwitcher view={view} onViewChange={handleViewChange} />
                </div>
            </Card>

            {/* Calendar */}
            <Card className="flex-1 p-4 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading meetings...</p>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        view={view}
                        onView={handleViewChange}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        popup
                        style={{ height: '100%' }}
                        components={{
                            event: MeetingEvent,
                        }}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: event.color || '#3b82f6',
                                borderRadius: '4px',
                                opacity: 0.8,
                                color: 'white',
                                border: '0px',
                                display: 'block',
                            },
                        })}
                    />
                )}
            </Card>

            {/* Meeting Form Dialog */}
            <MeetingFormDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingMeeting(undefined);
                    }
                }}
                onSubmit={handleCreateMeeting}
                meeting={editingMeeting}
                defaultDate={selectedDate}
                isLoading={createMeeting.isPending || updateMeeting.isPending}
            />

            {/* Meeting Detail Dialog */}
            <MeetingDetailDialog
                meetingId={selectedMeetingId}
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
                onEdit={handleEditMeeting}
            />
        </div>
    );
}
