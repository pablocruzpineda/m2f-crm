# Step 7: Read/Unread Status Testing Guide

## 🎯 What Was Implemented

### Features:
1. **Automatic Mark as Read**: When you open a contact's chat, all their unread messages are automatically marked as read
2. **Unread Indicators**: Contact list shows blue dot for contacts with unread messages
3. **Read Receipts**: Your sent messages show:
   - Single check (✓) for sent
   - Double check (✓✓) for delivered
   - Blue double check (✓✓) for read
4. **Real-time Updates**: Read status updates in real-time across the interface

### Components Updated:
- `ChatMessageList.tsx`: Added automatic mark-as-read when viewing messages
- `ChatContactItem.tsx`: Already had unread indicators (blue dot)
- `ChatBubble.tsx`: Already had read status icons
- `useMessageSubscription.ts`: Invalidates queries on message updates

---

## 🧪 Testing Scenarios

### Test 1: Automatic Mark as Read

**Objective**: Verify messages are automatically marked as read when viewing a conversation.

**Steps**:
1. Open the app and go to Chat page
2. You should see your contact list
3. Note which contacts have a **blue dot** (indicating unread messages)
4. Click on a contact with a blue dot
5. The chat should open and show the messages
6. **Expected**: The blue dot should disappear from the contact list
7. Go back to contact list - blue dot should stay gone

**SQL to Create Unread Messages**:
```sql
-- Replace with your actual IDs
INSERT INTO messages (
  workspace_id,
  contact_id,
  sender_type,
  sender_id,
  content,
  message_type,
  status,
  created_at
) VALUES (
  'your-workspace-id',
  'your-contact-id',
  'contact',  -- Message FROM contact
  'your-contact-id',
  'Hey! This is an unread message from the contact',
  'text',
  'delivered',  -- Not 'read' yet
  NOW()
);
```

---

### Test 2: Read Status Indicators

**Objective**: Verify read receipts show correctly on your sent messages.

**Steps**:
1. Open a contact's chat
2. Send a message from the UI
3. **Expected**: Your message should show a single checkmark (✓)
4. Use SQL to simulate the message being delivered:
   ```sql
   UPDATE messages 
   SET status = 'delivered'
   WHERE id = 'your-message-id';
   ```
5. **Expected**: Your message should now show double checkmark (✓✓) in gray
6. Use SQL to simulate the message being read:
   ```sql
   UPDATE messages 
   SET status = 'read', read_at = NOW()
   WHERE id = 'your-message-id';
   ```
7. **Expected**: Your message should now show double checkmark (✓✓) in **blue**

---

### Test 3: Multiple Unread Messages

**Objective**: Verify all unread messages from a contact are marked as read at once.

**Steps**:
1. Use SQL to create multiple unread messages:
   ```sql
   INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status)
   SELECT 
     'your-workspace-id',
     'your-contact-id',
     'contact',
     'your-contact-id',
     'Unread message ' || generate_series,
     'text',
     'delivered'
   FROM generate_series(1, 5);
   ```
2. Go to contact list
3. **Expected**: Contact should have a blue dot
4. Click on the contact
5. **Expected**: All 5 messages should be visible
6. Wait 1-2 seconds
7. Go back to contact list
8. **Expected**: Blue dot should be gone

---

### Test 4: Real-time Unread Updates

**Objective**: Verify unread indicators update in real-time when new messages arrive.

**Steps**:
1. Open the contact list (don't open any specific chat)
2. In another browser tab, insert a new unread message using SQL:
   ```sql
   INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status)
   VALUES (
     'your-workspace-id',
     'your-contact-id',
     'contact',
     'your-contact-id',
     'New message arriving in real-time!',
     'text',
     'delivered'
   );
   ```
3. Go back to the app
4. **Expected**: The contact should now have a blue dot (may take 1-2 seconds)
5. The contact should move to the top of the list
6. The last message preview should show the new message

---

### Test 5: Contact Messages vs User Messages

**Objective**: Verify only contact messages are marked as unread (not your own).

**Steps**:
1. Send a message from the UI to a contact
2. Check the contact list
3. **Expected**: No blue dot appears for that contact
4. Your own messages should never create unread indicators
5. Insert a message from the contact:
   ```sql
   INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status)
   VALUES (
     'your-workspace-id',
     'your-contact-id',
     'contact',
     'your-contact-id',
     'Reply from contact',
     'text',
     'delivered'
   );
   ```
6. **Expected**: Blue dot should appear

---

## 🎨 Visual Indicators

### Contact List:
- **Blue dot** on avatar: Contact has unread messages
- **Bold text**: Contact name and last message are bold when unread
- **Normal text**: Regular font weight when all messages are read

### Chat Bubbles (Your Messages):
- **Single check (✓)**: Message sent but not delivered
- **Double check (✓✓) gray**: Message delivered
- **Double check (✓✓) blue**: Message read by contact

### Chat Bubbles (Contact Messages):
- No status icons (only shown on your messages)
- Timestamp only

---

## 🔍 Debugging Tips

### Check Browser Console:
- When you view a chat, you should see: "📝 Message updated" logs
- Real-time subscription status: "💬 Real-time subscription status: SUBSCRIBED"

### Verify Database:
```sql
-- Check unread count for a contact
SELECT COUNT(*) 
FROM messages 
WHERE contact_id = 'your-contact-id' 
  AND sender_type = 'contact' 
  AND status != 'read';

-- Check recent messages and their status
SELECT 
  id,
  content,
  sender_type,
  status,
  read_at,
  created_at
FROM messages
WHERE contact_id = 'your-contact-id'
ORDER BY created_at DESC
LIMIT 10;
```

### Common Issues:

1. **Blue dot not disappearing**:
   - Check console for errors
   - Verify RLS policies allow UPDATE on messages
   - Check if `useMarkContactMessagesAsRead` is being called

2. **Read status not updating in real-time**:
   - Verify Supabase Realtime is enabled
   - Check browser console for subscription status
   - Ensure you're subscribed to the correct workspace

3. **Wrong messages showing as unread**:
   - Verify `sender_type` is 'contact' for incoming messages
   - Check that user's own messages have `sender_type='user'`

---

## ✅ Success Criteria

- [x] Unread messages automatically marked as read when viewing chat
- [x] Blue dot appears/disappears correctly on contact list
- [x] Read receipts show correct status (✓ / ✓✓ / blue ✓✓)
- [x] Real-time updates work for message status changes
- [x] Only contact messages create unread indicators
- [x] User's own messages never show as unread
- [x] Unread count is accurate

---

## 📝 Next Steps

After verifying Step 7 works correctly, proceed to:
- **Step 8**: Settings Page (Mind2Flow configuration)
- **Step 9**: Webhook Handler (receive messages from Mind2Flow)
- **Step 10**: Final polish and testing
