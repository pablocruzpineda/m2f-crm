-- =====================================================
-- Update Messages and Activity Log RLS for Team Members
-- Migration: 038_restrict_messages_and_activity_for_members
-- Description: Members see only messages for their assigned contacts, only admins see activity log
-- =====================================================

-- ========================================
-- PART 1: FIX MESSAGES TABLE
-- ========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "messages_workspace_isolation" ON messages;

-- Policy 1: Owners and admins see ALL messages
CREATE POLICY "Owners and admins see all messages"
  ON messages FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy 2: Members see only messages for their assigned contacts
CREATE POLICY "Members see assigned contact messages"
  ON messages FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'member'
    )
    AND contact_id IN (
      SELECT id FROM contacts 
      WHERE assigned_to = auth.uid()
    )
  );

-- Policy 3: Users can insert messages for contacts they have access to
CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Owners/admins can message any contact
      auth.uid() IN (
        SELECT user_id FROM workspace_members 
        WHERE workspace_id = messages.workspace_id 
        AND role IN ('owner', 'admin')
      )
      OR
      -- Members can message their assigned contacts
      contact_id IN (
        SELECT id FROM contacts 
        WHERE assigned_to = auth.uid()
      )
    )
  );

-- Policy 4: Users can update messages they have access to
CREATE POLICY "Users can update messages"
  ON messages FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Owners/admins can update any message
      auth.uid() IN (
        SELECT user_id FROM workspace_members 
        WHERE workspace_id = messages.workspace_id 
        AND role IN ('owner', 'admin')
      )
      OR
      -- Members can update messages for their assigned contacts
      contact_id IN (
        SELECT id FROM contacts 
        WHERE assigned_to = auth.uid()
      )
    )
  );

-- ========================================
-- PART 2: RESTRICT ACTIVITY LOG
-- ========================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view activity in their workspace" ON activity_log;

-- Policy 1: Only owners and admins can view activity log
CREATE POLICY "Only owners and admins see activity log"
  ON activity_log FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Keep the insert policy unchanged (all members can create logs)
-- This is fine because they're logging their own actions

-- Add comments
COMMENT ON POLICY "Owners and admins see all messages" ON messages IS
  'Owners and admins have full visibility of all messages in their workspace';

COMMENT ON POLICY "Members see assigned contact messages" ON messages IS
  'Regular members can only see messages for contacts assigned to them';

COMMENT ON POLICY "Only owners and admins see activity log" ON activity_log IS
  'Activity log is restricted to owners and admins for audit purposes. Members cannot see activity feed.';
