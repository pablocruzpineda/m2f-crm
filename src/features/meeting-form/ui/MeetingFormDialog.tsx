/**
 * @module features/meeting-form
 * @description Meeting creation and editing form
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Link as LinkIcon } from 'lucide-react';
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
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Calendar } from '@/shared/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';
import type { MeetingWithDetails, CreateMeetingInput } from '@/entities/meeting';
import { ParticipantSelector } from './ParticipantSelector';

const meetingFormSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    start_time: z.date(),
    time: z.string().min(1, 'Time is required'),
    duration_minutes: z.string().min(1, 'Duration is required'),
    timezone: z.string().optional(),
    location: z.string().optional(),
    meeting_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    participant_user_ids: z.array(z.string()),
    participant_contact_ids: z.array(z.string()),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

interface MeetingFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateMeetingInput) => void;
    meeting?: MeetingWithDetails;
    defaultDate?: Date;
    isLoading?: boolean;
}

// Generate time slots for the hour selector
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const label = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            slots.push({ value: time, label });
        }
    }
    return slots;
};

const timeSlots = generateTimeSlots();

const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
];

export function MeetingFormDialog({
    open,
    onOpenChange,
    onSubmit,
    meeting,
    defaultDate,
    isLoading = false,
}: MeetingFormDialogProps) {
    const isEditing = !!meeting;

    const form = useForm<MeetingFormValues>({
        resolver: zodResolver(meetingFormSchema),
        defaultValues: {
            title: meeting?.title || '',
            description: meeting?.description || '',
            start_time: meeting ? new Date(meeting.start_time) : defaultDate || new Date(),
            time: meeting
                ? format(new Date(meeting.start_time), 'HH:mm')
                : '09:00',
            duration_minutes: meeting
                ? String(Math.round((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000))
                : '60',
            timezone: meeting?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            location: meeting?.location || '',
            meeting_url: meeting?.meeting_url || '',
            participant_user_ids: [],
            participant_contact_ids: [],
        },
    });

    useEffect(() => {
        if (open) {
            if (isEditing && meeting) {
                // Editing mode - populate with meeting data
                form.reset({
                    title: meeting.title || '',
                    description: meeting.description || '',
                    start_time: new Date(meeting.start_time),
                    time: format(new Date(meeting.start_time), 'HH:mm'),
                    duration_minutes: String(Math.round((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000)),
                    timezone: meeting.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    location: meeting.location || '',
                    meeting_url: meeting.meeting_url || '',
                    participant_user_ids: meeting.participants?.filter(p => p.user_id).map(p => p.user_id!) || [],
                    participant_contact_ids: meeting.participants?.filter(p => p.contact_id).map(p => p.contact_id!) || [],
                });
            } else {
                // Create mode - use default values
                form.reset({
                    title: '',
                    description: '',
                    start_time: defaultDate || new Date(),
                    time: '09:00',
                    duration_minutes: '60',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    location: '',
                    meeting_url: '',
                    participant_user_ids: [],
                    participant_contact_ids: [],
                });
            }
        }
    }, [open, isEditing, meeting, defaultDate, form]);

    const handleSubmit = (values: MeetingFormValues) => {
        // Combine date and time
        const [hours, minutes] = values.time.split(':').map(Number);
        const startTime = new Date(values.start_time);
        startTime.setHours(hours!, minutes!, 0, 0);

        // Calculate end time
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + parseInt(values.duration_minutes));

        const submitData: CreateMeetingInput = {
            workspace_id: '', // Will be set by the mutation hook
            title: values.title,
            description: values.description || undefined,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            timezone: values.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            location: values.location || undefined,
            meeting_url: values.meeting_url || undefined,
            participant_user_ids: values.participant_user_ids,
            participant_contact_ids: values.participant_contact_ids,
        };

        onSubmit(submitData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Meeting' : 'Create Meeting'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update meeting details and participants.'
                            : 'Schedule a new meeting with your team or contacts.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Meeting title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Meeting agenda or description"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Picker */}
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            field.onChange(date);
                                                        }
                                                    }}
                                                    disabled={(date: Date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Time Picker */}
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration */}
                            <FormField
                                control={form.control}
                                name="duration_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select duration" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {durationOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Office, address, or room number"
                                                className="pl-9"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Meeting URL */}
                        <FormField
                            control={form.control}
                            name="meeting_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting URL</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="https://zoom.us/j/..."
                                                className="pl-9"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Video conference or online meeting link
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Participants */}
                        <FormField
                            control={form.control}
                            name="participant_user_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Participants</FormLabel>
                                    <FormControl>
                                        <ParticipantSelector
                                            selectedUserIds={field.value || []}
                                            selectedContactIds={form.watch('participant_contact_ids') || []}
                                            onUserIdsChange={field.onChange}
                                            onContactIdsChange={(ids: string[]) =>
                                                form.setValue('participant_contact_ids', ids)
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Add team members and contacts to this meeting
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : isEditing ? 'Update Meeting' : 'Create Meeting'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
