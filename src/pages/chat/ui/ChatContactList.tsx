/**
 * @module pages/chat/ui/ChatContactList
 * @description Sidebar showing list of contacts with last messages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Settings } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ChatContactItem } from './ChatContactItem';
import { useContacts } from '@/entities/contact';
import { useContactsLastMessages } from '@/entities/message';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Skeleton } from '@/shared/ui/skeleton';

interface ChatContactListProps {
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

export function ChatContactList({
  selectedContactId,
  onSelectContact,
}: ChatContactListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentWorkspace } = useCurrentWorkspace();

  const { data: contactsData, isLoading: isLoadingContacts } = useContacts(
    currentWorkspace?.id,
    { search: searchQuery }
  );

  const { data: lastMessages = {} } = useContactsLastMessages();

  const isLoading = isLoadingContacts;

  // Extract contacts array from response
  const contacts = contactsData?.data || [];

  // Sort contacts: unread messages first, then by most recent message, then alphabetically
  const sortedContacts = [...contacts].sort((a, b) => {
    const aMessage = lastMessages[a.id];
    const bMessage = lastMessages[b.id];
    const aHasMessages = !!aMessage;
    const bHasMessages = !!bMessage;

    // Check if messages are unread (from contact and not read)
    const aIsUnread = aMessage?.sender_type === 'contact' && aMessage?.status !== 'read';
    const bIsUnread = bMessage?.sender_type === 'contact' && bMessage?.status !== 'read';

    // Priority 1: Unread messages come first
    if (aIsUnread && !bIsUnread) return -1;
    if (!aIsUnread && bIsUnread) return 1;

    // Priority 2: If both have messages (read or unread), sort by most recent message
    if (aHasMessages && bHasMessages) {
      const aTime = new Date(aMessage.created_at).getTime();
      const bTime = new Date(bMessage.created_at).getTime();
      return bTime - aTime; // Most recent first
    }

    // Priority 3: Contacts with messages come before those without
    if (aHasMessages && !bHasMessages) return -1;
    if (!aHasMessages && bHasMessages) return 1;

    // Priority 4: Both have no messages, sort alphabetically
    return a.first_name.localeCompare(b.first_name);
  });

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold flex-1">Messages</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat/settings')}
            title="Chat Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Loading Skeletons
          <div className="p-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedContacts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {searchQuery
                ? 'No contacts found matching your search'
                : 'Add contacts to start messaging'}
            </p>
          </div>
        ) : (
          // Contact List
          <div className="divide-y divide-border">
            {sortedContacts.map((contact) => (
              <ChatContactItem
                key={contact.id}
                contact={contact}
                lastMessage={lastMessages[contact.id]}
                isSelected={selectedContactId === contact.id}
                onClick={() => onSelectContact(contact.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
