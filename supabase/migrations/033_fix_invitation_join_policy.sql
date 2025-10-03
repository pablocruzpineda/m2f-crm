-- =====================================================
-- Fix Invitation Workspace Join Policy
-- Migration: 033_fix_invitation_join_policy
-- Description: Fix the RLS policy to use profiles table instead of auth.users
-- =====================================================

-- Drop the policy that tries to access auth.users (which is not allowed in RLS)
DROP POLICY IF EXISTS "Users can join workspace via accepted invitation" ON workspace_members;

-- Create corrected policy using profiles table instead
CREATE POLICY "Users can join workspace via accepted invitation"
  ON workspace_members FOR INSERT
  WITH CHECK (
    -- User is adding themselves
    user_id = auth.uid()
    AND
    -- There exists a pending invitation for this user in this workspace
    EXISTS (
      SELECT 1
      FROM team_invitations ti
      JOIN profiles p ON p.email = ti.email
      WHERE ti.workspace_id = workspace_members.workspace_id
      AND p.id = auth.uid()
      AND ti.status = 'pending'
    )
  );

-- Add comment
COMMENT ON POLICY "Users can join workspace via accepted invitation" ON workspace_members IS
  'Allows newly registered users to add themselves to a workspace when accepting an invitation. Uses profiles table instead of auth.users.';
