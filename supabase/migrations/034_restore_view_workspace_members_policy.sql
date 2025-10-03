-- =====================================================
-- Restore Policy to View Workspace Members
-- Migration: 034_restore_view_workspace_members_policy
-- Description: Re-add the policy that allows users to view other members in their workspace
-- =====================================================

-- The problem: Migration 007 removed the policy that allows viewing other workspace members
-- This means owners/admins can only see themselves, not their team members

-- Solution: Restore the policy from migration 006

CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON POLICY "Users can view members in their workspaces" ON workspace_members IS
  'Allows users to see all members in workspaces where they are also members. Required for Team Members page to display all team members.';
