/**
 * @module pages/chat/ui/ChatPage
 * @description Main chat page with split layout - contacts list and chat area
 */

import { useState } from 'react';
import { ChatContactList } from './ChatContactList';
import { ChatArea } from './ChatArea';
import { useContactSubscription } from '@/entities/contact';

export function ChatPage() {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(
        null
    );

    // Subscribe to real-time contact updates
    useContactSubscription();

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* Contact List Sidebar */}
            <div
                className={`
          w-full md:w-96 border-r border-border
          ${selectedContactId ? 'hidden md:block' : 'block'}
        `}
            >
                <ChatContactList
                    selectedContactId={selectedContactId}
                    onSelectContact={setSelectedContactId}
                />
            </div>

            {/* Chat Area */}
            <div
                className={`
          flex-1
          ${selectedContactId ? 'block' : 'hidden md:block'}
        `}
            >
                <ChatArea
                    contactId={selectedContactId}
                    onBack={() => setSelectedContactId(null)}
                />
            </div>
        </div>
    );
}
