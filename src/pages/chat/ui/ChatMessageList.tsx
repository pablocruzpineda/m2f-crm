/**
 * @module pages/chat/ui/ChatMessageList
 * @description Scrollable message container with date separators
 */

import { useEffect, useRef, useMemo } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ChatBubble } from './ChatBubble';
import { useContactMessages, useMarkContactMessagesAsRead } from '@/entities/message';
import { useSession } from '@/entities/session';
import { Skeleton } from '@/shared/ui/skeleton';
import type { MessageWithSender } from '@/shared/lib/database/types';

interface ChatMessageListProps {
  contactId: string;
}

export function ChatMessageList({ contactId }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSession();
  const markAsRead = useMarkContactMessagesAsRead();
  const hasMarkedRef = useRef<Set<string>>(new Set()); // Track which contacts we've marked

  const { data: messages = [], isLoading } = useContactMessages(contactId);

  // Count unread messages from contact
  const unreadCount = useMemo(() => {
    return messages.filter(
      (msg) => msg.sender_type === 'contact' && msg.status !== 'read'
    ).length;
  }, [messages]);

  // Mark messages as read when viewing this contact's messages
  useEffect(() => {
    // Only mark as read if:
    // 1. We have a contactId
    // 2. There are unread messages
    // 3. We haven't already tried to mark this contact as read recently
    // 4. The mutation is not currently pending
    if (
      contactId &&
      unreadCount > 0 &&
      !hasMarkedRef.current.has(contactId) &&
      !markAsRead.isPending
    ) {
      hasMarkedRef.current.add(contactId);
      markAsRead.mutate(contactId, {
        onSettled: () => {
          // Remove from set after a delay to allow retry if needed
          setTimeout(() => {
            hasMarkedRef.current.delete(contactId);
          }, 5000);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, unreadCount]); // Only depend on contactId and unread count

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className="max-w-[70%] space-y-2">
              <Skeleton className="h-16 w-64" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start the conversation by sending a message
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {formatDateSeparator(group.date)}
            </div>
          </div>

          {/* Messages for this date */}
          {group.messages.map((message) => {
            const isOwnMessage = message.sender_type === 'user' && message.sender_id === user?.id;

            return (
              <ChatBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            );
          })}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Helper function to group messages by date
function groupMessagesByDate(messages: MessageWithSender[]) {
  const groups: { date: Date; messages: MessageWithSender[] }[] = [];

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const existingGroup = groups.find((g) =>
      isSameDay(g.date, messageDate)
    );

    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        messages: [message],
      });
    }
  });

  return groups;
}

// Helper function to format date separator
function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  // Check if within this year
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMMM d'); // "January 15"
  }

  return format(date, 'MMMM d, yyyy'); // "January 15, 2024"
}
