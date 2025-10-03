-- =====================================================
-- Remove Old Permissive Deals Policies
-- Migration: 042_remove_old_deals_policies
-- Description: Drop old workspace-wide policies that bypass role-based access control
-- =====================================================

-- Drop OLD permissive policies that allow all workspace members to see all deals
DROP POLICY IF EXISTS "Users can view deals in their workspaces" ON deals;
DROP POLICY IF EXISTS "Users can create deals in their workspaces" ON deals;
DROP POLICY IF EXISTS "Users can update deals in their workspaces" ON deals;
DROP POLICY IF EXISTS "Users can delete deals in their workspaces" ON deals;

-- The NEW role-based policies from migration 041 will remain:
-- - "Role-based deal viewing" (SELECT with role checking)
-- - "Workspace members can create deals" (INSERT for all members)
-- - "Role-based deal updating" (UPDATE with role checking)
-- - "Owners and admins can delete deals" (DELETE for admins only)

-- Add comment
COMMENT ON TABLE deals IS 'Deal/opportunity tracking with role-based access control. Members see only assigned deals.';
