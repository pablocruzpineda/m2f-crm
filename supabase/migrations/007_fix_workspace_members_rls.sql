-- =====================================================
-- Fix RLS policies to avoid infinite recursion
-- Solution: Remove circular dependencies between policies
-- =====================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can view members in their workspaces" ON workspace_members;

-- =====================================================
-- WORKSPACE_MEMBERS: Simple, non-recursive policies
-- =====================================================

-- Policy 1: Users can view workspace_members rows where they are the user
CREATE POLICY "Users can view their own workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- Note: We don't need a policy for viewing OTHER members in the same workspace
-- because the application layer will handle that by querying workspace_members
-- directly (which will only return rows where the user is a member via Policy 1)

-- The admin policies from migration 006 are fine as-is since they don't create recursion
