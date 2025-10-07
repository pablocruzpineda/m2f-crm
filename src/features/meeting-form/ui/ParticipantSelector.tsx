/**
 * @module features/meeting-form
 * @description Participant selector for meetings
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, User, Users, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useTeamMembers } from '@/entities/team';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';

interface ParticipantSelectorProps {
    selectedUserIds: string[];
    selectedContactIds: string[];
    onUserIdsChange: (ids: string[]) => void;
    onContactIdsChange: (ids: string[]) => void;
}

export function ParticipantSelector({
    selectedUserIds,
    selectedContactIds,
    onUserIdsChange,
    onContactIdsChange,
}: ParticipantSelectorProps) {
    const { currentWorkspace } = useCurrentWorkspace();
    const [open, setOpen] = useState(false);

    // Fetch team members
    const { data: teamMembers = [], isLoading: isLoadingMembers } = useTeamMembers();

    // Fetch contacts
    const { data: contactsData, isLoading: isLoadingContacts } = useContacts(currentWorkspace?.id);

    const contacts = contactsData?.data || [];
    const isLoading = isLoadingMembers || isLoadingContacts;

    const selectedUsers = teamMembers.filter((member) =>
        selectedUserIds.includes(member.id)
    );

    const selectedContacts = contacts.filter((contact) =>
        selectedContactIds.includes(contact.id)
    );

    const toggleUser = (userId: string) => {

        if (selectedUserIds.includes(userId)) {
            onUserIdsChange(selectedUserIds.filter((id) => id !== userId));
        } else {
            onUserIdsChange([...selectedUserIds, userId]);
        }
    };

    const toggleContact = (contactId: string) => {
        if (selectedContactIds.includes(contactId)) {
            onContactIdsChange(selectedContactIds.filter((id) => id !== contactId));
        } else {
            onContactIdsChange([...selectedContactIds, contactId]);
        }
    };

    const removeUser = (userId: string) => {
        onUserIdsChange(selectedUserIds.filter((id) => id !== userId));
    };

    const removeContact = (contactId: string) => {
        onContactIdsChange(selectedContactIds.filter((id) => id !== contactId));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selectedUsers.length + selectedContacts.length > 0
                                ? `${selectedUsers.length + selectedContacts.length} selected`
                                : 'Add participants'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0"
                    align="start"
                    sideOffset={4}
                >
                    {isLoading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : (
                        <div
                            className="h-[300px] overflow-y-auto overflow-x-hidden touch-auto"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                            tabIndex={0}
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {/* Team Members */}
                            {teamMembers.length > 0 && (
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                        Team Members
                                    </div>
                                    {teamMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => toggleUser(member.id)}
                                            role="option"
                                            aria-selected={selectedUserIds.includes(member.id)}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4 shrink-0',
                                                    selectedUserIds.includes(member.id)
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                            <User className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-medium">
                                                    {member.full_name || member.email}
                                                </span>
                                                {member.full_name && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {member.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Contacts */}
                            {contacts.length > 0 && (
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                        Contacts
                                    </div>
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => toggleContact(contact.id)}
                                            role="option"
                                            aria-selected={selectedContactIds.includes(contact.id)}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4 shrink-0',
                                                    selectedContactIds.includes(contact.id)
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                            <Users className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-medium">
                                                    {contact.first_name} {contact.last_name}
                                                </span>
                                                {contact.email && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {contact.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            {/* Selected Participants */}
            {(selectedUsers.length > 0 || selectedContacts.length > 0) && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                    {selectedUsers.map((member) => (
                        <Badge key={member.id} variant="secondary" className="gap-1">
                            <User className="h-3 w-3" />
                            {member.full_name || member.email}
                            <button
                                type="button"
                                onClick={() => removeUser(member.id)}
                                className="ml-1 rounded-full hover:bg-muted"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {selectedContacts.map((contact) => (
                        <Badge key={contact.id} variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {contact.first_name} {contact.last_name}
                            <button
                                type="button"
                                onClick={() => removeContact(contact.id)}
                                className="ml-1 rounded-full hover:bg-muted"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
