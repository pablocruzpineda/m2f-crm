-- Test Script: Populate Activity Log with Sample Data
-- Purpose: Create sample activities to test the Activity Feed
-- Run this in Supabase SQL Editor

-- Note: Replace these UUIDs with actual values from your database
-- To get your workspace_id: SELECT id, name FROM workspaces;
-- To get your user_id: SELECT id, email FROM profiles;

-- Sample activities for testing
-- IMPORTANT: Replace 'YOUR_WORKSPACE_ID' and 'YOUR_USER_ID' with actual UUIDs

DO $$
DECLARE
  v_workspace_id UUID := 'YOUR_WORKSPACE_ID'; -- Replace with your workspace ID
  v_user_id UUID := 'YOUR_USER_ID';           -- Replace with your user ID
  v_contact_id UUID := gen_random_uuid();
  v_deal_id UUID := gen_random_uuid();
BEGIN
  -- Activity 1: Created a contact
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'created',
    'contact',
    v_contact_id,
    jsonb_build_object(
      'name', 'John Doe',
      'email', 'john@example.com'
    )
  );

  -- Activity 2: Updated contact status
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'status_changed',
    'contact',
    v_contact_id,
    jsonb_build_object(
      'from_status', 'lead',
      'to_status', 'customer',
      'description', 'Changed status from lead to customer'
    )
  );

  -- Activity 3: Created a deal
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'created',
    'deal',
    v_deal_id,
    jsonb_build_object(
      'title', 'Enterprise Contract',
      'value', 50000
    )
  );

  -- Activity 4: Updated deal
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'updated',
    'deal',
    v_deal_id,
    jsonb_build_object(
      'description', 'Moved deal from Proposal to Negotiation stage'
    )
  );

  -- Activity 5: Added team member
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'member_added',
    'member',
    gen_random_uuid(),
    jsonb_build_object(
      'email', 'newmember@example.com',
      'role', 'admin',
      'description', 'Added newmember@example.com as Admin'
    )
  );

  -- Activity 6: Changed member role
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'role_changed',
    'member',
    gen_random_uuid(),
    jsonb_build_object(
      'from_role', 'member',
      'to_role', 'admin',
      'description', 'Changed role from Member to Admin'
    )
  );

  -- Activity 7: Assigned contact
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'assigned',
    'contact',
    v_contact_id,
    jsonb_build_object(
      'assigned_to_email', 'teammate@example.com',
      'description', 'Assigned contact to teammate@example.com'
    )
  );

  -- Activity 8: Updated settings
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'updated',
    'settings',
    NULL,
    jsonb_build_object(
      'setting_type', 'chat',
      'description', 'Updated WhatsApp API settings'
    )
  );

  -- Activity 9: Deleted contact
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'deleted',
    'contact',
    gen_random_uuid(),
    jsonb_build_object(
      'name', 'Old Contact',
      'description', 'Removed outdated contact'
    )
  );

  -- Activity 10: Added note
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details)
  VALUES (
    v_workspace_id,
    v_user_id,
    'note_added',
    'contact',
    v_contact_id,
    jsonb_build_object(
      'description', 'Added important note about customer requirements'
    )
  );

  RAISE NOTICE 'Successfully created 10 sample activities!';
END $$;

-- Verify the activities were created
SELECT 
  id,
  action,
  entity_type,
  details->>'description' as description,
  created_at
FROM activity_log
ORDER BY created_at DESC
LIMIT 20;
