/**
 * @module pages/chat/ui/ChatBubble
 * @description WhatsApp-style message bubble
 */

import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import type { MessageWithSender } from '@/shared/lib/database/types';

interface ChatBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
}

export function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  // Format time as HH:MM
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={cn(
        'flex mb-4',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-foreground border border-border rounded-bl-none'
        )}
      >
        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-xs',
              isOwnMessage
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            )}
          >
            {time}
          </span>

          {/* Status icons for sent messages */}
          {isOwnMessage && (
            <span
              className={cn(
                'flex items-center',
                message.status === 'read'
                  ? 'text-blue-400'
                  : 'text-primary-foreground/70'
              )}
            >
              {message.status === 'read' || message.status === 'delivered' ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
