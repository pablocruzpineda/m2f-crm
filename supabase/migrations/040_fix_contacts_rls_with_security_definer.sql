-- =====================================================
-- Fix Contacts RLS Using Security Definer Function
-- Migration: 040_fix_contacts_rls_with_security_definer
-- Description: Update contacts policies to use security definer functions for consistency
-- =====================================================

-- Drop existing contacts policies
DROP POLICY IF EXISTS "Owners and admins see all contacts" ON contacts;
DROP POLICY IF EXISTS "Members see assigned contacts" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update assigned contacts" ON contacts;
DROP POLICY IF EXISTS "Owners and admins can delete contacts" ON contacts;

-- Policy 1: SELECT - Role-based viewing
CREATE POLICY "Role-based contact viewing"
  ON contacts FOR SELECT
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
CREATE POLICY "Workspace members can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    is_workspace_member(workspace_id, auth.uid())
    AND created_by = auth.uid()
  );

-- Policy 3: UPDATE - Role-based updating
CREATE POLICY "Role-based contact updating"
  ON contacts FOR UPDATE
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
CREATE POLICY "Owners and admins can delete contacts"
  ON contacts FOR DELETE
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Add comments
COMMENT ON POLICY "Role-based contact viewing" ON contacts IS
  'Owners/Admins see all contacts, Members see assigned+unassigned, Viewers see only assigned';

COMMENT ON POLICY "Role-based contact updating" ON contacts IS
  'Owners/Admins can update all contacts, Members can only update their assigned contacts';
