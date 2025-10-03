-- =====================================================
-- Fix Team Invitations Acceptance Policy
-- Migration: 030_fix_team_invitations_acceptance_policy
-- Description: Allow new users to update invitation status when accepting
-- =====================================================

-- Drop the overly restrictive "all" policy
DROP POLICY IF EXISTS "Workspace admins can manage invitations" ON team_invitations;

-- Replace with separate policies for different operations

-- Admins can INSERT invitations
CREATE POLICY "Workspace admins can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Admins can UPDATE invitations (for resend/cancel)
CREATE POLICY "Workspace admins can update invitations"
  ON team_invitations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Special policy: Allow authenticated users to update invitation when accepting
-- This allows newly created users to mark their invitation as accepted
CREATE POLICY "Users can accept their own invitation"
  ON team_invitations FOR UPDATE
  USING (
    -- Must be authenticated
    auth.uid() IS NOT NULL
    -- Must be updating to 'accepted' status
    AND status = 'pending'
  )
  WITH CHECK (
    -- Must be setting their own user_id
    user_id = auth.uid()
    -- Must be marking as accepted
    AND status = 'accepted'
  );

-- Admins can DELETE invitations
CREATE POLICY "Workspace admins can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Add comment
COMMENT ON POLICY "Users can accept their own invitation" ON team_invitations IS 
  'Allows newly registered users to mark their invitation as accepted';
