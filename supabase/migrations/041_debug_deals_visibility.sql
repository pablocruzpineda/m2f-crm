-- =====================================================
-- Fix Deals Visibility with Explicit OR Logic
-- Migration: 041_fix_deals_visibility_explicit_or
-- Description: Replace CASE statement with explicit OR conditions for better reliability
-- =====================================================

-- Drop all policies that depend on the function first
DROP POLICY IF EXISTS "Role-based deal viewing" ON deals;
DROP POLICY IF EXISTS "Role-based deal updating" ON deals;
DROP POLICY IF EXISTS "Owners and admins can delete deals" ON deals;
DROP POLICY IF EXISTS "Role-based contact viewing" ON contacts;
DROP POLICY IF EXISTS "Role-based contact updating" ON contacts;
DROP POLICY IF EXISTS "Owners and admins can delete contacts" ON contacts;

-- Now we can drop and recreate the function
DROP FUNCTION IF EXISTS get_user_role_in_workspace(UUID, UUID);

CREATE OR REPLACE FUNCTION get_user_role_in_workspace(workspace_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Return NULL if either parameter is NULL
  IF workspace_id_param IS NULL OR user_id_param IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the role
  SELECT role INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_id_param
  AND user_id = user_id_param
  LIMIT 1;
  
  -- Return the role (or NULL if not found)
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate deals policy with explicit OR logic (more reliable than CASE)
DROP POLICY IF EXISTS "Role-based deal viewing" ON deals;

CREATE POLICY "Role-based deal viewing"
  ON deals FOR SELECT
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR (
      get_user_role_in_workspace(workspace_id, auth.uid()) IN ('member', 'viewer')
      AND assigned_to = auth.uid()
    )
  );

-- Recreate deals UPDATE policy
CREATE POLICY "Role-based deal updating"
  ON deals FOR UPDATE
  USING (
    is_workspace_member(workspace_id, auth.uid())
    AND (
      get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
      OR (
        get_user_role_in_workspace(workspace_id, auth.uid()) = 'member'
        AND assigned_to = auth.uid()
      )
    )
  );

-- Recreate deals DELETE policy
CREATE POLICY "Owners and admins can delete deals"
  ON deals FOR DELETE
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Recreate contacts SELECT policy
CREATE POLICY "Role-based contact viewing"
  ON contacts FOR SELECT
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
    OR (
      get_user_role_in_workspace(workspace_id, auth.uid()) IN ('member', 'viewer')
      AND assigned_to = auth.uid()
    )
  );

-- Recreate contacts UPDATE policy
CREATE POLICY "Role-based contact updating"
  ON contacts FOR UPDATE
  USING (
    is_workspace_member(workspace_id, auth.uid())
    AND (
      get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
      OR (
        get_user_role_in_workspace(workspace_id, auth.uid()) = 'member'
        AND assigned_to = auth.uid()
      )
    )
  );

-- Recreate contacts DELETE policy
CREATE POLICY "Owners and admins can delete contacts"
  ON contacts FOR DELETE
  USING (
    get_user_role_in_workspace(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Add comments
COMMENT ON FUNCTION get_user_role_in_workspace IS 
  'Returns user role in workspace with NULL safety. SECURITY DEFINER to avoid RLS recursion. STABLE for query optimization.';

COMMENT ON POLICY "Role-based deal viewing" ON deals IS
  'Owners/admins see all deals. Members/viewers see only deals assigned to them (assigned_to = their user_id).';

COMMENT ON POLICY "Role-based contact viewing" ON contacts IS
  'Owners/admins see all contacts. Members/viewers see only contacts assigned to them (assigned_to = their user_id).';
