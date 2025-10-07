/**
 * @module features/meeting-form
 * @description Meeting detail view dialog with edit and delete actions
 */

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MapPin,
    Link as LinkIcon,
    Users,
    User,
    Edit,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { useMeeting, useDeleteMeeting } from '@/entities/meeting';
import type { MeetingWithDetails } from '@/entities/meeting';
import { useTeamMembers } from '@/entities/team';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';

interface MeetingDetailDialogProps {
    meetingId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (meeting: MeetingWithDetails) => void;
}

export function MeetingDetailDialog({
    meetingId,
    open,
    onOpenChange,
    onEdit,
}: MeetingDetailDialogProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { currentWorkspace } = useCurrentWorkspace();

    // Fetch meeting details
    const { data: meeting, isLoading } = useMeeting(meetingId || '');
    const deleteMeeting = useDeleteMeeting();

    // Fetch team members and contacts for displaying participant names
    const { data: teamMembers = [] } = useTeamMembers();
    const { data: contactsData } = useContacts(currentWorkspace?.id);
    const contacts = contactsData?.data || [];

    // Helper function to get participant name
    const getParticipantName = (participant: { user_id?: string | null; contact_id?: string | null }) => {
        if (participant.user_id) {
            const member = teamMembers.find(m => m.id === participant.user_id);
            return member ? (member.full_name || member.email) : 'Team Member';
        }
        if (participant.contact_id) {
            const contact = contacts.find(c => c.id === participant.contact_id);
            return contact ? `${contact.first_name} ${contact.last_name}` : 'Contact';
        }
        return 'Unknown';
    };

    const handleDelete = () => {
        if (!meetingId) return;

        deleteMeeting.mutate(meetingId, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                onOpenChange(false);
            },
        });
    };

    const handleEdit = () => {
        if (meeting && onEdit) {
            onEdit(meeting);
            onOpenChange(false);
        }
    };

    if (!open || !meetingId) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{meeting?.title || 'Meeting Details'}</DialogTitle>
                        <DialogDescription>
                            View meeting information and participants
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : meeting ? (
                        <div className="space-y-6">
                            {/* Description */}
                            {meeting.description && (
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {meeting.description}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            {/* Date & Time Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Date</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(meeting.start_time), 'PPP')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Time</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(meeting.start_time), 'p')} -{' '}
                                                {format(new Date(meeting.end_time), 'p')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Location */}
                            {meeting.location && (
                                <Card className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">
                                                {meeting.location}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Meeting URL */}
                            {meeting.meeting_url && (
                                <Card className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium mb-1">Meeting Link</p>
                                            <a
                                                href={meeting.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                Join Meeting
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Participants */}
                            {(meeting.participants && meeting.participants.length > 0) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">
                                            Participants ({meeting.participants.length})
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {meeting.participants.map((participant) => (
                                            <Badge key={participant.id} variant="secondary" className="gap-1">
                                                {participant.user_id ? (
                                                    <>
                                                        <User className="h-3 w-3" />
                                                        <span>{getParticipantName(participant)}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Users className="h-3 w-3" />
                                                        <span>{getParticipantName(participant)}</span>
                                                    </>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">Status</h3>
                                <Badge
                                    variant={
                                        meeting.status === 'completed'
                                            ? 'default'
                                            : meeting.status === 'cancelled'
                                                ? 'destructive'
                                                : 'secondary'
                                    }
                                >
                                    {meeting.status}
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-8">
                            <p className="text-muted-foreground">Meeting not found</p>
                        </div>
                    )}

                    <DialogFooter className="flex items-center justify-between">
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={deleteMeeting.isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <Button onClick={handleEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this meeting. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
