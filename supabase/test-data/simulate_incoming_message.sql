-- ============================================================================
-- Quick Test: Insert a message from contact to simulate receiving
-- ============================================================================
-- Run this in Supabase SQL Editor after sending at least one message

-- This will insert a reply from the contact you're chatting with
-- Replace the contact_id with the one you're testing with

DO $$
DECLARE
  v_workspace_id uuid;
  v_contact_id uuid;
BEGIN
  -- Get your workspace and the contact you're chatting with
  -- You can find these by looking at an existing message you sent
  SELECT workspace_id, contact_id 
  INTO v_workspace_id, v_contact_id
  FROM messages 
  WHERE sender_type = 'user'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Insert a reply from the contact
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
    v_workspace_id,
    v_contact_id,
    'contact',  -- From contact
    v_contact_id,
    'Thanks for your message! This is an automatic test reply. 😊',
    'text',
    'delivered',  -- Not read yet (will show as unread)
    NOW()
  );
  
  RAISE NOTICE 'Test message inserted! Refresh your chat to see it.';
  
END $$;
