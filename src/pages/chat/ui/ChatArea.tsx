/**
 * @module pages/chat/ui/ChatArea
 * @description Main chat display area with messages and input
 */

import { ChatEmpty } from './ChatEmpty';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useMessageSubscription } from '@/entities/message/model/useMessageSubscription';

interface ChatAreaProps {
  contactId: string | null;
  onBack: () => void;
}

export function ChatArea({ contactId, onBack }: ChatAreaProps) {
  // Subscribe to real-time message updates
  useMessageSubscription(contactId || undefined);

  // If no contact is selected, show empty state
  if (!contactId) {
    return <ChatEmpty />;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - Contact Info */}
      <ChatHeader contactId={contactId} onBack={onBack} />

      {/* Message List */}
      <ChatMessageList contactId={contactId} />

      {/* Message Input */}
      <ChatInput contactId={contactId} />
    </div>
  );
}
