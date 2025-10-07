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
    FileText,
    Plus,
    Save,
    X,
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
import {
    useMeeting,
    useDeleteMeeting,
    useMeetingNotes,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
} from '@/entities/meeting';
import type { MeetingWithDetails, MeetingNote } from '@/entities/meeting';
import { useTeamMembers } from '@/entities/team';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';
import { RichTextEditor, RichTextDisplay } from '@/shared/ui/editor';

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
    const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editNoteContent, setEditNoteContent] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const { currentWorkspace } = useCurrentWorkspace();

    // Fetch current user
    useState(() => {
        import('@/shared/lib/supabase/client').then(({ supabase }) => {
            supabase.auth.getUser().then(({ data }) => {
                setCurrentUserId(data.user?.id || null);
            });
        });
    });

    // Fetch meeting details
    const { data: meeting, isLoading } = useMeeting(meetingId || '');
    const deleteMeeting = useDeleteMeeting();

    // Fetch team members and contacts for displaying participant names
    const { data: teamMembers = [] } = useTeamMembers();
    const { data: contactsData } = useContacts(currentWorkspace?.id);
    const contacts = contactsData?.data || [];

    // Fetch notes
    const { data: notes = [] } = useMeetingNotes(meetingId || undefined);
    const createNote = useCreateNote();
    const updateNote = useUpdateNote(meetingId || '');
    const deleteNote = useDeleteNote(meetingId || '');

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

    const handleAddNote = () => {
        if (!meetingId || !newNoteContent.trim()) return;

        createNote.mutate(
            { meeting_id: meetingId, content: newNoteContent },
            {
                onSuccess: () => {
                    setNewNoteContent('');
                    setIsAddingNote(false);
                },
            }
        );
    };

    const handleUpdateNote = (noteId: string) => {
        if (!editNoteContent.trim()) return;

        updateNote.mutate(
            { noteId, input: { content: editNoteContent } },
            {
                onSuccess: () => {
                    setEditingNoteId(null);
                    setEditNoteContent('');
                },
            }
        );
    };

    const handleDeleteNote = (noteId: string) => {
        setNoteToDelete(noteId);
        setShowDeleteNoteDialog(true);
    };

    const confirmDeleteNote = () => {
        if (noteToDelete) {
            deleteNote.mutate(noteToDelete, {
                onSuccess: () => {
                    setShowDeleteNoteDialog(false);
                    setNoteToDelete(null);
                },
            });
        }
    };

    const startEditingNote = (note: MeetingNote) => {
        setEditingNoteId(note.id);
        setEditNoteContent(note.content);
    };

    const cancelEditingNote = () => {
        setEditingNoteId(null);
        setEditNoteContent('');
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

                            <Separator />

                            {/* Meeting Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">
                                            Meeting Notes ({notes.length})
                                        </h3>
                                    </div>
                                    {!isAddingNote && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddingNote(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Note
                                        </Button>
                                    )}
                                </div>

                                {/* Add Note Form */}
                                {isAddingNote && (
                                    <Card className="p-4 mb-4">
                                        <div className="space-y-3">
                                            <RichTextEditor
                                                content={newNoteContent}
                                                onChange={setNewNoteContent}
                                                placeholder="Write your meeting notes here..."
                                                className="min-h-[200px]"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsAddingNote(false);
                                                        setNewNoteContent('');
                                                    }}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleAddNote}
                                                    disabled={!newNoteContent.trim() || createNote.isPending}
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    {createNote.isPending ? 'Saving...' : 'Save Note'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Notes List */}
                                <div className="space-y-3">
                                    {notes.length === 0 && !isAddingNote ? (
                                        <Card className="p-8 text-center">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-sm text-muted-foreground mb-2">
                                                No notes yet
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Add notes to document key points from this meeting
                                            </p>
                                        </Card>
                                    ) : (
                                        notes.map((note) => (
                                            <Card key={note.id} className="p-4">
                                                {editingNoteId === note.id ? (
                                                    // Edit Mode
                                                    <div className="space-y-3">
                                                        <RichTextEditor
                                                            content={editNoteContent}
                                                            onChange={setEditNoteContent}
                                                            placeholder="Edit your note..."
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={cancelEditingNote}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateNote(note.id)}
                                                                disabled={!editNoteContent.trim() || updateNote.isPending}
                                                            >
                                                                <Save className="h-4 w-4 mr-1" />
                                                                {updateNote.isPending ? 'Saving...' : 'Save'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // View Mode
                                                    <>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium">
                                                                    {note.author?.full_name || note.author?.email || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(new Date(note.created_at), 'PPp')}
                                                                </span>
                                                                {currentUserId === note.created_by && (
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => startEditingNote(note)}
                                                                            className="h-7 w-7 p-0"
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteNote(note.id)}
                                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <RichTextDisplay content={note.content} />
                                                    </>
                                                )}
                                            </Card>
                                        ))
                                    )}
                                </div>
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

            {/* Delete Meeting Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this meeting and all associated notes. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Meeting
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Note Confirmation Dialog */}
            <AlertDialog open={showDeleteNoteDialog} onOpenChange={setShowDeleteNoteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this note. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setNoteToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteNote}
                            disabled={deleteNote.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteNote.isPending ? 'Deleting...' : 'Delete Note'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
