-- =====================================================
-- Allow New Users to Join Workspace via Invitation
-- Migration: 032_allow_invitation_workspace_join
-- Description: Fix RLS policy to allow newly registered users to add themselves to workspace_members
-- =====================================================

-- The problem: When a user accepts an invitation, they need to INSERT themselves into workspace_members
-- But the existing policy requires them to already be an admin/owner (chicken-and-egg)

-- Solution: Add a policy that allows users to insert themselves if they have a valid, pending invitation

CREATE POLICY "Users can join workspace via accepted invitation"
  ON workspace_members FOR INSERT
  WITH CHECK (
    -- User is adding themselves
    user_id = auth.uid()
    AND
    -- There exists a pending invitation for this user in this workspace
    EXISTS (
      SELECT 1
      FROM team_invitations
      WHERE team_invitations.workspace_id = workspace_members.workspace_id
      AND team_invitations.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND team_invitations.status = 'pending'
    )
  );

-- Add comment
COMMENT ON POLICY "Users can join workspace via accepted invitation" ON workspace_members IS
  'Allows newly registered users to add themselves to a workspace when accepting an invitation';
