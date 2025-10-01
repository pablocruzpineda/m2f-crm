/**
 * @module pages/chat/ui/ChatEmpty
 * @description Empty state when no contact is selected
 */

import { MessageSquarePlus } from 'lucide-react';

export function ChatEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background">
      <div className="mb-6 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageSquarePlus className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
      <p className="text-muted-foreground max-w-md">
        Choose a contact from the list to start viewing your conversation
        history and send messages.
      </p>
    </div>
  );
}
