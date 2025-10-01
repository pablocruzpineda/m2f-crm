-- ============================================================================
-- Test Data for Chat UI (Phase 5.2 Step 4)
-- ============================================================================
-- This script inserts test messages to verify the chat interface
-- Run this in your Supabase SQL Editor

-- First, let's get some IDs we need (modify these with your actual IDs)
-- You can get these by running: SELECT id, first_name FROM contacts LIMIT 3;
-- And: SELECT id FROM profiles LIMIT 1;

DO $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid;
  v_contact_id uuid;
BEGIN
  -- Get the first workspace
  SELECT id INTO v_workspace_id FROM workspaces LIMIT 1;
  
  -- Get the first user (profile)
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- Get the first contact
  SELECT id INTO v_contact_id FROM contacts LIMIT 1;
  
  -- Check if we have the required data
  IF v_workspace_id IS NULL OR v_user_id IS NULL OR v_contact_id IS NULL THEN
    RAISE EXCEPTION 'Missing required data. Please ensure you have at least one workspace, profile, and contact.';
  END IF;
  
  -- Insert test messages (conversation between user and contact)
  INSERT INTO messages (workspace_id, contact_id, sender_type, sender_id, content, message_type, status, created_at) VALUES
  
  -- Day 1: Yesterday
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'Hi! I saw your product online and I''m interested in learning more.', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
  (v_workspace_id, v_contact_id, 'user', v_user_id, 'Hello! Thanks for reaching out. I''d be happy to help! What specific features are you interested in?', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '1 hour 55 minutes'),
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'I''m mainly looking at the CRM features. Does it support pipeline management?', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '1 hour 50 minutes'),
  (v_workspace_id, v_contact_id, 'user', v_user_id, 'Yes! We have full pipeline management with customizable stages, drag-and-drop functionality, and detailed analytics.', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '1 hour 45 minutes'),
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'That sounds perfect! What about pricing?', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '1 hour 40 minutes'),
  (v_workspace_id, v_contact_id, 'user', v_user_id, 'We have flexible plans starting at $29/month. I can send you our full pricing sheet. What''s your email?', 'text', 'read', NOW() - INTERVAL '1 day' - INTERVAL '1 hour 35 minutes'),
  
  -- Day 2: Today (earlier)
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'It''s john@example.com. Thanks!', 'text', 'read', NOW() - INTERVAL '3 hours'),
  (v_workspace_id, v_contact_id, 'user', v_user_id, 'Perfect! I''ve just sent it over. You should receive it in the next few minutes.', 'text', 'read', NOW() - INTERVAL '2 hours 55 minutes'),
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'Got it! I''ll review and get back to you soon.', 'text', 'read', NOW() - INTERVAL '2 hours 50 minutes'),
  
  -- Day 2: Today (recent - unread)
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'Hi again! I''ve reviewed the pricing. Can we schedule a demo?', 'text', 'delivered', NOW() - INTERVAL '15 minutes'),
  (v_workspace_id, v_contact_id, 'contact', v_contact_id, 'I''m available tomorrow afternoon if that works for you.', 'text', 'delivered', NOW() - INTERVAL '14 minutes');
  
  RAISE NOTICE 'Successfully inserted % test messages for contact %', 11, v_contact_id;
  RAISE NOTICE 'Workspace ID: %', v_workspace_id;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Contact ID: %', v_contact_id;
  
END $$;

-- Verify the messages were inserted
SELECT 
  m.created_at,
  m.sender_type,
  m.content,
  m.status,
  c.first_name || ' ' || COALESCE(c.last_name, '') as contact_name
FROM messages m
JOIN contacts c ON m.contact_id = c.id
ORDER BY m.created_at DESC
LIMIT 15;
