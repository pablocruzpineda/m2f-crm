/**
 * @module pages/chat/ui/ChatInput
 * @description Message input component with send functionality
 */

import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { useSendMessage } from '@/entities/message';
import { useSession } from '@/entities/session';
import { cn } from '@/shared/lib/utils/cn';

interface ChatInputProps {
  contactId: string;
}

export function ChatInput({ contactId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useSession();
  const sendMessage = useSendMessage();

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    try {
      await sendMessage.mutateAsync({
        contact_id: contactId,
        sender_type: 'user',
        sender_id: user.id,
        content: message.trim(),
        message_type: 'text',
        status: 'sent',
      });

      // Clear input on success
      setMessage('');
      
      // Reset textarea height and refocus
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Use setTimeout to ensure focus happens after React updates
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const isDisabled = !message.trim() || sendMessage.isPending;

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex gap-2 items-end">
        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
          className={cn(
            'min-h-[44px] max-h-[200px] resize-none',
            'focus-visible:ring-1 focus-visible:ring-ring'
          )}
          rows={1}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isDisabled}
          size="icon"
          className="flex-shrink-0 h-11 w-11"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>

      {/* Error message */}
      {sendMessage.isError && (
        <p className="text-xs text-destructive mt-2">
          Failed to send message. Please try again.
        </p>
      )}
    </div>
  );
}
