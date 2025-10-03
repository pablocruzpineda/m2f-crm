-- =====================================================
-- Fix Deals RLS Using Security Definer Function
-- Migration: 039_fix_deals_rls_with_security_definer
-- Description: Update deals policies to use is_workspace_member function and add role checking
-- =====================================================

-- Create a helper function to check user's role in workspace
CREATE OR REPLACE FUNCTION get_user_role_in_workspace(workspace_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_id_param
  AND user_id = user_id_param;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing deals policies
DROP POLICY IF EXISTS "Owners and admins see all deals" ON deals;
DROP POLICY IF EXISTS "Members see assigned deals" ON deals;
DROP POLICY IF EXISTS "Users can create deals" ON deals;
DROP POLICY IF EXISTS "Users can update assigned deals" ON deals;
DROP POLICY IF EXISTS "Owners and admins can delete deals" ON deals;

-- Policy 1: SELECT - Role-based viewing
CREATE POLICY "Role-based deal viewing"
  ON deals FOR SELECT
  USING (
    CASE get_user_role_in_workspace(workspace_id, auth.uid())
      WHEN 'owner' THEN true
      WHEN 'admin' THEN true
      WHEN 'member' THEN (assigned_to = auth.uid() OR assigned_to IS NULL)
      WHEN 'viewer' THEN (assigned_to = auth.uid())
      ELSE false
    END
  );

-- Policy 2: INSERT - All authenticated workspace members can create
CREATE POLICY "Workspace members can create deals"
  ON deals FOR INSERT
  WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND created_by = auth.uid()
  );

-- Policy 3: UPDATE - Role-based updating
CREATE POLICY "Role-based deal updating"
  ON deals FOR UPDATE
  USING (
    is_workspace_member(workspace_id, auth.uid())
    AND (
      CASE get_user_role_in_workspace(workspace_id, auth.uid())
        WHEN 'owner' THEN true
        WHEN 'admin' THEN true
        WHEN 'member' THEN (assigned_to = auth.uid())
        ELSE false
      END
    )
  );

-- Policy 4: DELETE - Only owners and admins
CREATE POLICY "Owners and admins can delete deals"
  ON deals FOR DELETE
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Add comments
COMMENT ON FUNCTION get_user_role_in_workspace IS 
  'Returns the role of a user in a workspace. Returns NULL if not a member.';

COMMENT ON POLICY "Role-based deal viewing" ON deals IS
  'Owners/Admins see all deals, Members see assigned+unassigned, Viewers see only assigned';

COMMENT ON POLICY "Role-based deal updating" ON deals IS
  'Owners/Admins can update all deals, Members can only update their assigned deals';
