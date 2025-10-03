-- =====================================================
-- Revert View Workspace Members Policy
-- Migration: 035_revert_workspace_members_view_policy
-- Description: Remove the policy that's causing recursion issues
-- =====================================================

-- Drop the policy that's causing problems
DROP POLICY IF EXISTS "Users can view members in their workspaces" ON workspace_members;

-- The issue: This policy creates infinite recursion because it queries workspace_members
-- from within a workspace_members policy (circular dependency)

-- Temporary solution: Only allow viewing own membership
-- We'll need a different approach for the Team Members page
