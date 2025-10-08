-- Migration: Add sub-account hierarchy to workspaces
-- Purpose: Enable multi-tenant sub-accounts (agency with multiple client accounts)
-- Date: 2025-10-07
-- Phase: Multi-Tenant Sub-Accounts

-- =====================================================
-- ADD PARENT_WORKSPACE_ID COLUMN
-- =====================================================
-- This creates a parent-child relationship between workspaces
-- NULL = Master workspace (Owner's agency)
-- NOT NULL = Sub-account workspace (Admin's client account)

ALTER TABLE workspaces 
  ADD COLUMN IF NOT EXISTS parent_workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- =====================================================
-- CREATE INDEX FOR PERFORMANCE
-- =====================================================
-- Index for finding sub-accounts of a master workspace
CREATE INDEX IF NOT EXISTS idx_workspaces_parent 
  ON workspaces(parent_workspace_id);

-- Index for combined queries (parent + workspace lookup)
CREATE INDEX IF NOT EXISTS idx_workspaces_parent_id 
  ON workspaces(parent_workspace_id, id);

-- =====================================================
-- ADD DOCUMENTATION
-- =====================================================
COMMENT ON COLUMN workspaces.parent_workspace_id IS 
  'NULL = Master tenant workspace (Owner/Agency), NOT NULL = Sub-account workspace (Admin/Client)';

-- =====================================================
-- HELPER FUNCTION: Create Sub-Account Workspace
-- =====================================================
-- Creates a sub-account workspace and sets up proper membership
-- Adds both the admin (as owner) and the master owner (for visibility)

CREATE OR REPLACE FUNCTION create_sub_account_workspace(
  p_master_workspace_id UUID,
  p_sub_account_name TEXT,
  p_sub_account_slug TEXT,
  p_admin_user_id UUID,
  p_master_owner_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_account_id UUID;
BEGIN
  -- Verify the master workspace exists and user has permission
  IF NOT EXISTS (
    SELECT 1 FROM workspaces WHERE id = p_master_workspace_id
  ) THEN
    RAISE EXCEPTION 'Master workspace does not exist';
  END IF;

  -- Verify the requesting user is the owner of the master workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members 
    WHERE workspace_id = p_master_workspace_id 
    AND user_id = p_master_owner_id 
    AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only master workspace owner can create sub-accounts';
  END IF;

  -- Create the sub-account workspace
  INSERT INTO workspaces (
    name, 
    slug, 
    owner_id, 
    parent_workspace_id,
    theme_config
  )
  VALUES (
    p_sub_account_name,
    p_sub_account_slug,
    p_admin_user_id,  -- Admin is the owner of their sub-account
    p_master_workspace_id,
    '{
      "primary_color": "#4F46E5",
      "secondary_color": "#10B981", 
      "accent_color": "#F59E0B",
      "theme_mode": "light"
    }'::jsonb
  )
  RETURNING id INTO v_sub_account_id;

  -- Add admin as owner of their sub-account workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_sub_account_id, p_admin_user_id, 'owner');

  -- Add master owner to sub-account (for visibility across all sub-accounts)
  -- Only add if master owner is not the same as admin
  IF p_master_owner_id != p_admin_user_id THEN
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (v_sub_account_id, p_master_owner_id, 'owner');
  END IF;

  RETURN v_sub_account_id;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Get Sub-Accounts of Master Workspace
-- =====================================================
-- Returns all sub-account workspaces for a given master workspace

CREATE OR REPLACE FUNCTION get_sub_accounts(p_master_workspace_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  owner_id UUID,
  admin_email TEXT,
  admin_name TEXT,
  member_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.slug,
    w.owner_id,
    p.email as admin_email,
    p.full_name as admin_name,
    (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
    w.created_at
  FROM workspaces w
  JOIN profiles p ON p.id = w.owner_id
  WHERE w.parent_workspace_id = p_master_workspace_id
  ORDER BY w.created_at DESC;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Get Master Workspace for User
-- =====================================================
-- Finds the master workspace where user is a member
-- Returns NULL if user is not in any master workspace

CREATE OR REPLACE FUNCTION get_master_workspace_for_user(p_user_id UUID)
RETURNS TABLE (
  workspace_id UUID,
  workspace_name TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    (wm.role = 'owner') as is_owner
  FROM workspaces w
  JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE w.parent_workspace_id IS NULL  -- Master workspace
  AND wm.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- =====================================================
-- HELPER FUNCTION: Check if Workspace is Sub-Account
-- =====================================================

CREATE OR REPLACE FUNCTION is_sub_account_workspace(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_id UUID;
BEGIN
  SELECT parent_workspace_id INTO v_parent_id
  FROM workspaces
  WHERE id = p_workspace_id;
  
  RETURN v_parent_id IS NOT NULL;
END;
$$;

-- =====================================================
-- UPDATE WORKSPACE POLICIES (Optional - for clarity)
-- =====================================================
-- The existing policies already work correctly because:
-- - RLS checks workspace_members for access
-- - Sub-account workspaces are just regular workspaces with parent_workspace_id set
-- - No policy changes needed!

-- =====================================================
-- VALIDATION CONSTRAINTS
-- =====================================================
-- Ensure a workspace cannot be its own parent (circular reference)
ALTER TABLE workspaces
  ADD CONSTRAINT chk_no_self_parent 
  CHECK (id != parent_workspace_id);

-- Note: PostgreSQL doesn't support CHECK constraints with subqueries for multi-level
-- circular reference prevention, so we rely on application logic for that

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION create_sub_account_workspace IS 
  'Creates a sub-account workspace with proper membership setup. Admin becomes owner of sub-account, master owner gets visibility.';

COMMENT ON FUNCTION get_sub_accounts IS 
  'Returns all sub-account workspaces for a master workspace with admin details and member counts.';

COMMENT ON FUNCTION get_master_workspace_for_user IS 
  'Finds the master workspace where user is a member. Returns NULL if user only belongs to sub-accounts.';

COMMENT ON FUNCTION is_sub_account_workspace IS 
  'Checks if a workspace is a sub-account (has a parent_workspace_id).';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Allow authenticated users to call these functions
GRANT EXECUTE ON FUNCTION create_sub_account_workspace TO authenticated;
GRANT EXECUTE ON FUNCTION get_sub_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION get_master_workspace_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION is_sub_account_workspace TO authenticated;

