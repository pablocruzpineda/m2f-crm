# Phase 5.2: Chat Integration - Implementation Plan

**Phase**: 5.2/20  
**Started**: September 30, 2025  
**Status**: Planning  
**Estimated Duration**: 2-3 days  
**Complexity**: Medium-High

---

## 🎯 Overview

Build a real-time chat system integrated with contacts, enabling WhatsApp-style messaging within the CRM. This will allow users to:
- Send and receive messages from contacts
- View chat history organized by contact
- Receive real-time message updates
- Configure external messaging integrations (webhooks/APIs)

---

## 📋 Requirements Breakdown

### 1. **Database Schema** (Foundation)

#### Tables to Create:

**`messages` table:**
```sql
- id (uuid, primary key)
- workspace_id (uuid, foreign key → workspaces.id)
- contact_id (uuid, foreign key → contacts.id)
- sender_type (enum: 'user' | 'contact')
- sender_id (uuid, references users.id or contact.id)
- content (text)
- message_type (enum: 'text' | 'image' | 'file' | 'audio')
- status (enum: 'sent' | 'delivered' | 'read' | 'failed')
- media_url (text, nullable)
- external_id (text, nullable) - for WhatsApp/external service IDs
- metadata (jsonb, nullable) - for additional data
- created_at (timestamp)
- updated_at (timestamp)
- read_at (timestamp, nullable)
```

**`chat_settings` table:**
```sql
- id (uuid, primary key)
- workspace_id (uuid, foreign key → workspaces.id)
- provider (enum: 'whatsapp' | 'telegram' | 'custom')
- webhook_url (text, nullable)
- api_endpoint (text, nullable)
- api_key (text, encrypted, nullable)
- api_secret (text, encrypted, nullable)
- is_active (boolean, default false)
- config (jsonb) - provider-specific configuration
- created_at (timestamp)
- updated_at (timestamp)
```

**Indexes:**
- `messages_workspace_id_idx` on workspace_id
- `messages_contact_id_idx` on contact_id
- `messages_created_at_idx` on created_at (for pagination)
- `messages_workspace_contact_idx` on (workspace_id, contact_id, created_at DESC)
- `chat_settings_workspace_id_idx` on workspace_id

**RLS Policies:**
- Users can only access messages in their workspace
- Users can only manage chat settings for their workspace

---

### 2. **UI Components** (25-30% of effort)

#### Main Chat Page Layout:
```
┌─────────────────────────────────────────────────────┐
│  Header                                              │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│   Contact    │         Chat Area                    │
│     List     │    ┌──────────────────────┐          │
│   (Sidebar)  │    │  Contact Name        │          │
│              │    │  (Header)            │          │
│  • Contact 1 │    ├──────────────────────┤          │
│  • Contact 2 │    │                      │          │
│  • Contact 3 │    │  Message Bubbles     │          │
│              │    │  (Chat History)      │          │
│              │    │                      │          │
│              │    │                      │          │
│              │    ├──────────────────────┤          │
│              │    │  Message Input       │          │
│              │    │  [Type...] [Send]    │          │
│              │    └──────────────────────┘          │
└──────────────┴──────────────────────────────────────┘
```

#### Components to Build:

**Page Level:**
1. **`ChatPage.tsx`** - Main chat page container
   - Split layout: contacts sidebar + chat area
   - Responsive: stacks on mobile
   - Contact selection state management

**Contact List (Left Sidebar):**
2. **`ChatContactList.tsx`** - List of contacts with recent messages
   - Search/filter contacts
   - Display last message preview
   - Unread message count badge
   - Timestamp of last message
   - Active contact highlighting
   
3. **`ChatContactItem.tsx`** - Individual contact list item
   - Contact avatar/initials
   - Contact name
   - Last message preview (truncated)
   - Unread count badge
   - Timestamp

**Chat Area (Right Side):**
4. **`ChatArea.tsx`** - Main chat display area
   - Chat header (contact info)
   - Message list (scrollable)
   - Message input
   - Empty state when no contact selected

5. **`ChatHeader.tsx`** - Contact info header
   - Contact name
   - Contact status (online/offline - future)
   - Action buttons (call, info, settings)

6. **`ChatMessageList.tsx`** - Scrollable message container
   - Auto-scroll to bottom on new messages
   - Infinite scroll for loading old messages
   - Date separators
   - Loading states

7. **`ChatBubble.tsx`** - Individual message bubble
   - WhatsApp-style styling
   - Different styles for sent vs received
   - Timestamp
   - Read/delivery status icons
   - Support for text (Phase 5.2) + media (future)

8. **`ChatInput.tsx`** - Message composition area
   - Text input with auto-resize
   - Send button
   - Character count (optional)
   - Emoji picker (future)
   - File attachment button (future)

**Settings:**
9. **`ChatSettingsPage.tsx`** - Integration configuration
   - Provider selection (WhatsApp/Telegram/Custom)
   - Webhook URL configuration
   - API endpoint configuration
   - API credentials (encrypted)
   - Test connection button
   - Save/reset functionality

---

### 3. **API Layer** (20% of effort)

#### Supabase Functions:

**`src/entities/message/api/messageApi.ts`:**
```typescript
// Queries
- getContactMessages(workspaceId, contactId, { limit, offset })
- getWorkspaceMessages(workspaceId, { limit, offset })
- getUnreadCount(workspaceId, contactId?)
- searchMessages(workspaceId, query)

// Mutations
- sendMessage(workspaceId, contactId, content, messageType)
- markAsRead(messageId)
- markConversationAsRead(workspaceId, contactId)
- deleteMessage(messageId)
- updateMessageStatus(messageId, status)
```

**`src/entities/chat-settings/api/chatSettingsApi.ts`:**
```typescript
- getWorkspaceChatSettings(workspaceId)
- updateChatSettings(workspaceId, settings)
- testConnection(workspaceId)
```

#### React Query Hooks:

**`src/entities/message/model/`:**
- `useContactMessages.ts` - Get messages for a contact
- `useSendMessage.ts` - Send a new message
- `useMarkAsRead.ts` - Mark messages as read
- `useMessageSubscription.ts` - Real-time message updates

---

### 4. **Real-time Functionality** (20% of effort)

#### Supabase Realtime Setup:

**Enable Realtime on `messages` table:**
```typescript
// Subscribe to new messages for workspace
const channel = supabase
  .channel(`workspace:${workspaceId}:messages`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `workspace_id=eq.${workspaceId}`
    },
    (payload) => {
      // Add new message to UI
      // Update unread counts
      // Show notification
    }
  )
  .subscribe()
```

**Features:**
- Auto-update chat when new message arrives
- Update contact list with latest message
- Desktop notifications (optional)
- Typing indicators (future enhancement)
- Online/offline status (future enhancement)

---

### 5. **External Integration Setup** (15% of effort)

#### Webhook Receiver:
- **Supabase Edge Function** to receive incoming messages
- Parse webhook payload (WhatsApp format)
- Create message record in database
- Send real-time update to connected clients

#### Message Sender:
- **API client** to send outgoing messages
- Support for different providers (WhatsApp, Telegram)
- Error handling and retry logic
- Status tracking (sent, delivered, read)

#### Configuration UI:
- Webhook URL display (copy button)
- API endpoint input
- API key/secret (encrypted storage)
- Provider selection dropdown
- Test connection button
- Enable/disable toggle

---

### 6. **Features & Enhancements**

#### Phase 5.2 Scope (MVP):
✅ Text messaging only
✅ Real-time updates
✅ Message history with pagination
✅ Read/unread status
✅ Basic webhook configuration
✅ WhatsApp-style UI

#### Future Enhancements (Post-5.2):
⏳ Media messages (images, files, audio)
⏳ Emoji picker
⏳ Message reactions
⏳ Typing indicators
⏳ Online/offline status
⏳ Message search
⏳ Message templates
⏳ Bulk messaging
⏳ Chat export
⏳ Message scheduling

---

## 📁 File Structure

```
src/
├── entities/
│   ├── message/
│   │   ├── api/
│   │   │   └── messageApi.ts (Supabase queries)
│   │   ├── model/
│   │   │   ├── useContactMessages.ts
│   │   │   ├── useSendMessage.ts
│   │   │   ├── useMarkAsRead.ts
│   │   │   └── useMessageSubscription.ts
│   │   └── index.ts
│   │
│   └── chat-settings/
│       ├── api/
│       │   └── chatSettingsApi.ts
│       ├── model/
│       │   ├── useChatSettings.ts
│       │   └── useUpdateChatSettings.ts
│       └── index.ts
│
├── pages/
│   └── chat/
│       ├── ui/
│       │   ├── ChatPage.tsx (main page)
│       │   ├── ChatContactList.tsx
│       │   ├── ChatContactItem.tsx
│       │   ├── ChatArea.tsx
│       │   ├── ChatHeader.tsx
│       │   ├── ChatMessageList.tsx
│       │   ├── ChatBubble.tsx
│       │   ├── ChatInput.tsx
│       │   ├── ChatEmpty.tsx (empty state)
│       │   └── ChatSettingsPage.tsx (settings)
│       └── index.ts
│
├── features/
│   └── chat/
│       ├── ui/
│       │   ├── ChatComposer.tsx (message input + attachments)
│       │   └── ChatNotification.tsx (toast notification)
│       └── index.ts
│
└── shared/
    └── lib/
        └── chat/
            ├── chatUtils.ts (formatting, date separators)
            └── webhookParser.ts (parse external messages)

supabase/
├── migrations/
│   ├── 015_create_messages_table.sql
│   ├── 016_create_chat_settings_table.sql
│   └── 017_enable_realtime_messages.sql
│
└── functions/
    └── chat-webhook/
        ├── index.ts (receive external messages)
        └── deno.json
```

---

## 🔄 Implementation Steps (Recommended Order)

### **Step 1: Database Setup** (30 min)
1. Create migration for `messages` table
2. Create migration for `chat_settings` table
3. Add RLS policies
4. Add indexes
5. Enable Realtime on `messages` table
6. Apply migrations to remote database
7. Regenerate TypeScript types

### **Step 2: API Layer** (1 hour)
1. Create `messageApi.ts` with all CRUD operations
2. Create React Query hooks for messages
3. Create `chatSettingsApi.ts`
4. Create React Query hooks for settings
5. Test API functions with Supabase client

### **Step 3: Basic UI Structure** (2 hours)
1. Create `ChatPage.tsx` with split layout
2. Create `ChatContactList.tsx` (display contacts)
3. Create `ChatContactItem.tsx` (contact card)
4. Create `ChatArea.tsx` (empty state + selected contact)
5. Create `ChatEmpty.tsx` (no contact selected)
6. Add route to App.tsx
7. Add navigation link in sidebar

### **Step 4: Chat Message Display** (2 hours)
1. Create `ChatHeader.tsx` (contact info header)
2. Create `ChatMessageList.tsx` (scrollable container)
3. Create `ChatBubble.tsx` (WhatsApp-style bubbles)
4. Fetch and display messages for selected contact
5. Add date separators
6. Add auto-scroll to bottom
7. Style sent vs received messages

### **Step 5: Message Sending** (1.5 hours)
1. Create `ChatInput.tsx` (text input + send button)
2. Implement send message mutation
3. Optimistic UI updates
4. Error handling
5. Clear input on send
6. Disable send when empty

### **Step 6: Real-time Updates** (1.5 hours)
1. Create `useMessageSubscription.ts` hook
2. Subscribe to new messages for workspace
3. Update UI when new message arrives
4. Update contact list with latest message
5. Play notification sound (optional)
6. Handle reconnection logic

### **Step 7: Read/Unread Status** (1 hour)
1. Mark messages as read when viewing conversation
2. Display unread count badges in contact list
3. Update read_at timestamp
4. Show read receipts in chat bubbles (checkmarks)

### **Step 8: Settings Page** (2 hours)
1. Create `ChatSettingsPage.tsx`
2. Display webhook URL (for external service to call)
3. API endpoint configuration form
4. API credentials input (encrypted)
5. Provider selection dropdown
6. Save/update settings
7. Test connection button

### **Step 9: Pagination & Performance** (1 hour)
1. Implement infinite scroll for old messages
2. Load more on scroll to top
3. Optimize re-renders
4. Add loading skeletons
5. Virtual scrolling (if needed)

### **Step 10: Polish & Testing** (1 hour)
1. Responsive design (mobile layout)
2. Error states and retry logic
3. Loading states
4. Empty states
5. Keyboard shortcuts (Enter to send)
6. Character limit indicator
7. Final testing and bug fixes

---

## 🎨 Design Specifications

### **WhatsApp-Style Chat Bubbles:**

**Sent Messages (User):**
- Background: `bg-primary` (theme color)
- Text: `text-primary-foreground`
- Align: Right
- Border radius: Rounded left, sharp bottom-right corner
- Max width: 70% of container

**Received Messages (Contact):**
- Background: `bg-card`
- Text: `text-foreground`
- Align: Left
- Border radius: Rounded right, sharp bottom-left corner
- Max width: 70% of container

**Timestamps:**
- Small text below bubble
- Color: `text-muted-foreground`
- Format: "10:30 AM" or "Yesterday at 2:15 PM"

**Status Icons (for sent messages):**
- Sent: Single checkmark
- Delivered: Double checkmark
- Read: Double checkmark (blue/primary color)

---

## 🔐 Security Considerations

1. **RLS Policies**: Ensure users can only access messages in their workspace
2. **API Keys**: Encrypt sensitive credentials in database
3. **Webhook Validation**: Verify webhook signatures from external services
4. **Rate Limiting**: Prevent message spam (add later)
5. **Input Sanitization**: Prevent XSS attacks in message content
6. **Content Moderation**: Filter inappropriate content (future)

---

## 🧪 Testing Checklist

- [ ] Send message successfully saves to database
- [ ] Received message appears in real-time
- [ ] Read status updates correctly
- [ ] Pagination loads older messages
- [ ] Contact list updates with latest message
- [ ] Unread counts are accurate
- [ ] Responsive layout works on mobile
- [ ] Dark mode styling looks good
- [ ] Settings save and load correctly
- [ ] Error states display properly

---

## 📊 Success Metrics

- ✅ Users can send and receive messages
- ✅ Messages appear instantly (< 1 second latency)
- ✅ Message history loads within 500ms
- ✅ UI is responsive and smooth (60fps)
- ✅ Settings persist correctly
- ✅ No data leaks between workspaces

---

## 🚀 Deployment Notes

1. **Enable Realtime in Supabase**:
   - Go to Database → Replication
   - Enable replication on `messages` table
   - Set up publications

2. **Deploy Webhook Edge Function**:
   - Deploy to Supabase Edge Functions
   - Configure environment variables
   - Test webhook endpoint

3. **Update Environment Variables**:
   - Add webhook secret
   - Add API keys (if needed)

---

## 📝 Documentation to Create

- [ ] Chat API documentation
- [ ] Webhook integration guide
- [ ] Provider setup instructions (WhatsApp, Telegram)
- [ ] User guide for chat features
- [ ] Troubleshooting guide

---

**Estimated Total Time**: 14-16 hours  
**Lines of Code**: ~2,500-3,000 lines  
**Files Created**: ~25 files  
**Database Tables**: 2 tables, 8 RLS policies, 5 indexes

---

**Next Steps**: Review plan → Create database migrations → Start implementation

