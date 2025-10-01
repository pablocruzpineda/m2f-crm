-- ============================================
-- Step 7: Read/Unread Status Testing SQL
-- ============================================
-- Run these queries in Supabase SQL Editor to test read/unread functionality

-- SETUP: Get your IDs first
-- ============================================

-- 1. Get your workspace ID
SELECT id, name FROM workspaces ORDER BY created_at DESC LIMIT 5;

-- 2. Get a contact ID to test with
SELECT 
  id, 
  first_name, 
  last_name, 
  email,
  phone
FROM contacts 
WHERE workspace_id = 'YOUR_WORKSPACE_ID'
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Get your user ID
SELECT id, email FROM auth.users LIMIT 5;

-- ============================================
-- TEST 1: Create Single Unread Message
-- ============================================

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
  'YOUR_WORKSPACE_ID',  -- Replace with your workspace ID
  'YOUR_CONTACT_ID',     -- Replace with a contact ID
  'contact',             -- Message FROM contact
  'YOUR_CONTACT_ID',     -- Same as contact_id for contact messages
  'Hey! This is an unread message. Please read me!',
  'text',
  'delivered',           -- Not 'read' yet
  NOW()
) RETURNING *;

-- ✅ Expected Result:
-- - Contact should show blue dot in contact list
-- - When you open the chat, message should appear
-- - After 1-2 seconds, blue dot should disappear


-- ============================================
-- TEST 2: Create Multiple Unread Messages
-- ============================================

INSERT INTO messages (
  workspace_id,
  contact_id,
  sender_type,
  sender_id,
  content,
  message_type,
  status,
  created_at
)
SELECT 
  'YOUR_WORKSPACE_ID',
  'YOUR_CONTACT_ID',
  'contact',
  'YOUR_CONTACT_ID',
  'Unread message number ' || generate_series,
  'text',
  'delivered',
  NOW() - (generate_series || ' seconds')::INTERVAL
FROM generate_series(1, 5)
RETURNING *;

-- ✅ Expected Result:
-- - Contact has blue dot
-- - All 5 messages visible when opening chat
-- - All marked as read after viewing


-- ============================================
-- TEST 3: Simulate Message Status Changes
-- ============================================

-- First, send a message from UI, then get its ID:
SELECT 
  id,
  content,
  status,
  created_at
FROM messages
WHERE workspace_id = 'YOUR_WORKSPACE_ID'
  AND sender_type = 'user'
ORDER BY created_at DESC
LIMIT 5;

-- Simulate message delivered
UPDATE messages 
SET 
  status = 'delivered',
  updated_at = NOW()
WHERE id = 'YOUR_MESSAGE_ID';

-- ✅ Expected: Double gray checkmarks appear

-- Wait a few seconds, then simulate message read
UPDATE messages 
SET 
  status = 'read',
  read_at = NOW(),
  updated_at = NOW()
WHERE id = 'YOUR_MESSAGE_ID';

-- ✅ Expected: Double checkmarks turn blue


-- ============================================
-- TEST 4: Check Unread Count
-- ============================================

-- Count unread messages for a contact
SELECT 
  c.first_name,
  c.last_name,
  COUNT(*) as unread_count
FROM messages m
JOIN contacts c ON c.id = m.contact_id
WHERE m.workspace_id = 'YOUR_WORKSPACE_ID'
  AND m.contact_id = 'YOUR_CONTACT_ID'
  AND m.sender_type = 'contact'
  AND m.status != 'read'
GROUP BY c.id, c.first_name, c.last_name;

-- ✅ Should match what you see in the UI


-- ============================================
-- TEST 5: Verify Mark as Read Worked
-- ============================================

-- Check if messages were marked as read
SELECT 
  id,
  content,
  sender_type,
  status,
  read_at,
  created_at
FROM messages
WHERE workspace_id = 'YOUR_WORKSPACE_ID'
  AND contact_id = 'YOUR_CONTACT_ID'
ORDER BY created_at DESC
LIMIT 10;

-- ✅ All contact messages should have status = 'read' and read_at timestamp


-- ============================================
-- TEST 6: Create Conversation Thread
-- ============================================

-- Create a realistic conversation with mixed read/unread
DO $$
DECLARE
  workspace_id UUID := 'YOUR_WORKSPACE_ID';
  contact_id UUID := 'YOUR_CONTACT_ID';
  user_id UUID := 'YOUR_USER_ID';
BEGIN
  -- Contact sends first message (unread)
  INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status, created_at)
  VALUES (workspace_id, contact_id, 'contact', contact_id, 'Hi! How are you?', 'text', 'delivered', NOW() - INTERVAL '5 minutes');
  
  -- User replies (read by contact)
  INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status, created_at)
  VALUES (workspace_id, contact_id, 'user', user_id, 'I''m good, thanks! How about you?', 'text', 'read', NOW() - INTERVAL '4 minutes');
  
  -- Contact replies (unread)
  INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status, created_at)
  VALUES (workspace_id, contact_id, 'contact', contact_id, 'Doing great! Just wanted to check in.', 'text', 'delivered', NOW() - INTERVAL '3 minutes');
  
  -- Contact sends another (unread)
  INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status, created_at)
  VALUES (workspace_id, contact_id, 'contact', contact_id, 'Are we still on for tomorrow?', 'text', 'delivered', NOW() - INTERVAL '2 minutes');
END $$;

-- ✅ Expected:
-- - Contact shows blue dot (2 unread messages)
-- - When you open chat, all 4 messages appear
-- - After viewing, both contact messages marked as read


-- ============================================
-- CLEANUP: Remove Test Messages
-- ============================================

-- Delete test messages for a contact
DELETE FROM messages
WHERE workspace_id = 'YOUR_WORKSPACE_ID'
  AND contact_id = 'YOUR_CONTACT_ID'
  AND content LIKE '%Unread message%';

-- Or delete all messages for a contact (careful!)
-- DELETE FROM messages
-- WHERE workspace_id = 'YOUR_WORKSPACE_ID'
--   AND contact_id = 'YOUR_CONTACT_ID';


-- ============================================
-- DEBUGGING QUERIES
-- ============================================

-- Check RLS policies on messages table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages';

-- Check if Realtime is enabled
SELECT 
  schemaname,
  tablename,
  replica_identity
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- View recent message activity
SELECT 
  m.id,
  m.content,
  m.sender_type,
  m.status,
  m.read_at,
  m.created_at,
  m.updated_at,
  c.first_name || ' ' || COALESCE(c.last_name, '') as contact_name
FROM messages m
JOIN contacts c ON c.id = m.contact_id
WHERE m.workspace_id = 'YOUR_WORKSPACE_ID'
ORDER BY m.created_at DESC
LIMIT 20;

-- Check for orphaned messages
SELECT COUNT(*) as orphaned_count
FROM messages m
LEFT JOIN contacts c ON c.id = m.contact_id
WHERE m.workspace_id = 'YOUR_WORKSPACE_ID'
  AND c.id IS NULL;
