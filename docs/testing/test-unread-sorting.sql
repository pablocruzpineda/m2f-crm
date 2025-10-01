-- ============================================
-- Test: Unread Messages Appear at Top of Contact List
-- ============================================
-- This script helps you verify that contacts with unread messages
-- appear at the top of the contact list, regardless of message time

-- SETUP: Get your workspace ID
-- ============================================
SELECT id, name FROM workspaces ORDER BY created_at DESC LIMIT 5;
-- Copy your workspace_id: _________________


-- Get your contacts to test with
SELECT 
  id, 
  first_name, 
  last_name,
  email
FROM contacts 
WHERE workspace_id = 'YOUR_WORKSPACE_ID'
ORDER BY created_at DESC 
LIMIT 10;


-- ============================================
-- TEST SCENARIO: Create Messages with Different States
-- ============================================

-- Step 1: Create an OLD READ message for Contact A (should be at bottom)
DO $$
DECLARE
  v_workspace_id uuid := 'YOUR_WORKSPACE_ID';
  v_contact_a_id uuid := 'CONTACT_A_ID';  -- Replace with first contact ID
BEGIN
  INSERT INTO messages (
    workspace_id, contact_id, sender_type, sender_id,
    content, message_type, status, read_at, created_at
  ) VALUES (
    v_workspace_id, v_contact_a_id, 'contact', v_contact_a_id,
    'Old read message from Contact A',
    'text', 'read', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
  );
END $$;


-- Step 2: Create a RECENT READ message for Contact B (should be middle)
DO $$
DECLARE
  v_workspace_id uuid := 'YOUR_WORKSPACE_ID';
  v_contact_b_id uuid := 'CONTACT_B_ID';  -- Replace with second contact ID
BEGIN
  INSERT INTO messages (
    workspace_id, contact_id, sender_type, sender_id,
    content, message_type, status, read_at, created_at
  ) VALUES (
    v_workspace_id, v_contact_b_id, 'contact', v_contact_b_id,
    'Recent read message from Contact B',
    'text', 'read', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'
  );
END $$;


-- Step 3: Create an OLD UNREAD message for Contact C (should be at TOP!)
DO $$
DECLARE
  v_workspace_id uuid := 'YOUR_WORKSPACE_ID';
  v_contact_c_id uuid := 'CONTACT_C_ID';  -- Replace with third contact ID
BEGIN
  INSERT INTO messages (
    workspace_id, contact_id, sender_type, sender_id,
    content, message_type, status, created_at
  ) VALUES (
    v_workspace_id, v_contact_c_id, 'contact', v_contact_c_id,
    '⭐ OLD UNREAD - I should be at the TOP even though I am old!',
    'text', 'delivered', NOW() - INTERVAL '1 day'
  );
END $$;


-- Step 4: Create a RECENT UNREAD message for Contact D (should be at TOP!)
DO $$
DECLARE
  v_workspace_id uuid := 'YOUR_WORKSPACE_ID';
  v_contact_d_id uuid := 'CONTACT_D_ID';  -- Replace with fourth contact ID
BEGIN
  INSERT INTO messages (
    workspace_id, contact_id, sender_type, sender_id,
    content, message_type, status, created_at
  ) VALUES (
    v_workspace_id, v_contact_d_id, 'contact', v_contact_d_id,
    '⭐ NEW UNREAD - I should also be at the TOP!',
    'text', 'delivered', NOW()
  );
END $$;


-- ============================================
-- EXPECTED SORTING ORDER IN YOUR UI:
-- ============================================
-- 1. Contact D - ⭐ NEW UNREAD (most recent unread) - BLUE DOT
-- 2. Contact C - ⭐ OLD UNREAD (older unread) - BLUE DOT
-- 3. Contact B - Recent read (most recent read message)
-- 4. Contact A - Old read (older read message)
-- 5. All other contacts (alphabetically)


-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to see what the sorting should look like:

SELECT 
  c.first_name || ' ' || COALESCE(c.last_name, '') as contact_name,
  m.content as last_message,
  m.sender_type,
  m.status,
  m.created_at,
  CASE 
    WHEN m.sender_type = 'contact' AND m.status != 'read' THEN '🔵 UNREAD - Should be at TOP'
    WHEN m.status = 'read' THEN '✓ Read - Should be below unread'
    ELSE 'Other'
  END as expected_position
FROM contacts c
LEFT JOIN LATERAL (
  SELECT * FROM messages
  WHERE contact_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) m ON true
WHERE c.workspace_id = 'YOUR_WORKSPACE_ID'
ORDER BY 
  -- Unread messages first
  (m.sender_type = 'contact' AND m.status != 'read') DESC,
  -- Then by most recent message
  m.created_at DESC NULLS LAST,
  -- Then alphabetically
  c.first_name;


-- ============================================
-- QUICK TEST: Create Multiple Unread Messages
-- ============================================

DO $$
DECLARE
  v_workspace_id uuid := 'YOUR_WORKSPACE_ID';
  v_contact_id uuid;
  contact_record RECORD;
  counter integer := 0;
BEGIN
  -- Get up to 3 contacts
  FOR contact_record IN (
    SELECT id, first_name 
    FROM contacts 
    WHERE workspace_id = v_workspace_id
    LIMIT 3
  )
  LOOP
    counter := counter + 1;
    
    -- Create unread message for each contact
    INSERT INTO messages (
      workspace_id, contact_id, sender_type, sender_id,
      content, message_type, status, created_at
    ) VALUES (
      v_workspace_id, contact_record.id, 'contact', contact_record.id,
      '🔵 Unread message #' || counter || ' from ' || contact_record.first_name,
      'text', 'delivered', 
      NOW() - (counter || ' hours')::INTERVAL
    );
  END LOOP;
  
  RAISE NOTICE '✅ Created % unread messages for testing', counter;
END $$;


-- ============================================
-- CLEANUP: Remove Test Messages
-- ============================================

-- Remove messages that start with specific test markers
DELETE FROM messages
WHERE content LIKE '⭐%' OR content LIKE '🔵 Unread message%';

-- Or remove all test messages
-- DELETE FROM messages WHERE workspace_id = 'YOUR_WORKSPACE_ID';
