-- =====================================================
-- Safe Workspace Members View Policy
-- Migration: 036_safe_workspace_members_view
-- Description: Use a security definer function to avoid RLS recursion
-- =====================================================

-- Create a security definer function that bypasses RLS
-- This function checks if a user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM workspace_members
    WHERE workspace_id = workspace_id_param
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create a SELECT policy that uses this function
-- This avoids recursion because the function runs with definer's rights
CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  USING (
    is_workspace_member(workspace_id, auth.uid())
  );

-- Add comment
COMMENT ON FUNCTION is_workspace_member IS 
  'Security definer function to check workspace membership without RLS recursion';

COMMENT ON POLICY "Users can view members in their workspaces" ON workspace_members IS
  'Allows users to see all members in workspaces where they are members. Uses security definer function to avoid RLS recursion.';
