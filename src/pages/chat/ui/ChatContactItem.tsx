/**
 * @module pages/chat/ui/ChatContactItem
 * @description Individual contact item in chat list with last message preview
 */

import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import type { ContactWithTags, MessageWithSender } from '@/shared/lib/database/types';
import { Badge } from '@/shared/ui/badge';

interface ChatContactItemProps {
  contact: ContactWithTags;
  lastMessage?: MessageWithSender;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatContactItem({
  contact,
  lastMessage,
  isSelected,
  onClick,
}: ChatContactItemProps) {
  // Format timestamp
  const timestamp = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
    : null;

  // Check if message is unread (from contact and not read)
  const isUnread =
    lastMessage &&
    lastMessage.sender_type === 'contact' &&
    lastMessage.status !== 'read';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left transition-colors hover:bg-accent/50',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
        isSelected && 'bg-accent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          {isUnread && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                'font-medium truncate',
                isUnread && 'font-semibold'
              )}
            >
              {contact.first_name} {contact.last_name || ''}
            </h3>
            {timestamp && (
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {timestamp}
              </span>
            )}
          </div>

          {/* Last Message Preview */}
          {lastMessage ? (
            <p
              className={cn(
                'text-sm truncate',
                isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {lastMessage.sender_type === 'user' ? 'You: ' : ''}
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No messages yet
            </p>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {contact.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs px-1.5 py-0"
                >
                  {tag.name}
                </Badge>
              ))}
              {contact.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{contact.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
