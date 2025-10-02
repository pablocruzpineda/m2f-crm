-- Quick Activity Feed Test
-- Copy and paste this entire script into Supabase SQL Editor
-- It will automatically use your current user and workspace

DO $$
DECLARE
  v_workspace_id UUID;
  v_user_id UUID;
  v_contact_id UUID := gen_random_uuid();
  v_deal_id UUID := gen_random_uuid();
BEGIN
  -- Get the first workspace for the current user
  SELECT w.id INTO v_workspace_id
  FROM workspaces w
  JOIN workspace_members wm ON w.id = wm.workspace_id
  WHERE wm.user_id = auth.uid()
  LIMIT 1;

  -- Get current user ID
  v_user_id := auth.uid();

  -- Check if we found a workspace
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'No workspace found for current user';
  END IF;

  RAISE NOTICE 'Creating activities for workspace: % and user: %', v_workspace_id, v_user_id;

  -- Clear existing test activities (optional)
  -- DELETE FROM activity_log WHERE workspace_id = v_workspace_id;

  -- Create 15 diverse test activities
  
  -- 1. Contact created
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'created', 'contact', v_contact_id, 
    '{"description": "Created new contact: Sarah Johnson from Acme Corp"}'::jsonb,
    NOW() - INTERVAL '2 hours');

  -- 2. Contact updated
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'updated', 'contact', v_contact_id,
    '{"description": "Updated phone number and email address"}'::jsonb,
    NOW() - INTERVAL '1 hour 45 minutes');

  -- 3. Contact status changed
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'status_changed', 'contact', v_contact_id,
    '{"description": "Changed status from ''lead'' to ''customer''"}'::jsonb,
    NOW() - INTERVAL '1 hour 30 minutes');

  -- 4. Deal created
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'created', 'deal', v_deal_id,
    '{"description": "Created new deal: Enterprise Software License - $50,000"}'::jsonb,
    NOW() - INTERVAL '1 hour 15 minutes');

  -- 5. Deal updated
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'updated', 'deal', v_deal_id,
    '{"description": "Increased deal value from $50,000 to $75,000"}'::jsonb,
    NOW() - INTERVAL '1 hour');

  -- 6. Deal status changed
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'status_changed', 'deal', v_deal_id,
    '{"description": "Moved deal from ''Proposal'' to ''Negotiation'' stage"}'::jsonb,
    NOW() - INTERVAL '45 minutes');

  -- 7. Contact assigned
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'assigned', 'contact', v_contact_id,
    '{"description": "Assigned contact to sales.team@example.com"}'::jsonb,
    NOW() - INTERVAL '30 minutes');

  -- 8. Team member added
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'member_added', 'member', gen_random_uuid(),
    '{"description": "Added john.smith@example.com as Admin"}'::jsonb,
    NOW() - INTERVAL '25 minutes');

  -- 9. Role changed
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'role_changed', 'member', gen_random_uuid(),
    '{"description": "Changed role from Member to Admin"}'::jsonb,
    NOW() - INTERVAL '20 minutes');

  -- 10. Settings updated
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'updated', 'settings', NULL,
    '{"description": "Updated WhatsApp API configuration"}'::jsonb,
    NOW() - INTERVAL '15 minutes');

  -- 11. Another contact created
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'created', 'contact', gen_random_uuid(),
    '{"description": "Created new contact: Michael Chen from TechStart Inc"}'::jsonb,
    NOW() - INTERVAL '10 minutes');

  -- 12. Note added
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'note_added', 'contact', v_contact_id,
    '{"description": "Added important note about customer requirements and timeline"}'::jsonb,
    NOW() - INTERVAL '8 minutes');

  -- 13. Deal deleted
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'deleted', 'deal', gen_random_uuid(),
    '{"description": "Removed outdated deal: Old Partnership Proposal"}'::jsonb,
    NOW() - INTERVAL '5 minutes');

  -- 14. Contact deleted
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'deleted', 'contact', gen_random_uuid(),
    '{"description": "Removed duplicate contact entry"}'::jsonb,
    NOW() - INTERVAL '3 minutes');

  -- 15. Recent activity
  INSERT INTO activity_log (workspace_id, user_id, action, entity_type, entity_id, details, created_at)
  VALUES (v_workspace_id, v_user_id, 'created', 'deal', gen_random_uuid(),
    '{"description": "Created new deal: Cloud Services Contract - $100,000"}'::jsonb,
    NOW() - INTERVAL '1 minute');

  RAISE NOTICE '✅ Successfully created 15 test activities!';
  RAISE NOTICE '📊 Navigate to /activity in your app to see them';
  RAISE NOTICE '🔄 Activities span from 2 hours ago to 1 minute ago';
END $$;

-- Display the activities we just created
SELECT 
  action,
  entity_type,
  details->>'description' as description,
  to_char(created_at, 'HH24:MI:SS') as time,
  age(NOW(), created_at) as time_ago
FROM activity_log
ORDER BY created_at DESC
LIMIT 20;
