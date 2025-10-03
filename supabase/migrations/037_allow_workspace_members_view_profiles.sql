-- =====================================================
-- Allow Workspace Members to View Each Other's Profiles
-- Migration: 037_allow_workspace_members_view_profiles
-- Description: Enable workspace members to see profiles of other members in their workspace
-- =====================================================

-- The problem: Profiles RLS only allows viewing own profile
-- This prevents the Team Members page from showing other members' names/emails

-- Solution: Add a policy that allows viewing profiles of workspace colleagues
-- We'll use the same security definer function we created in migration 036

CREATE POLICY "Users can view workspace members profiles"
  ON profiles FOR SELECT
  USING (
    -- User can view their own profile (existing behavior)
    auth.uid() = id
    OR
    -- User can view profiles of people in their workspaces
    EXISTS (
      SELECT 1
      FROM workspace_members wm1
      JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
      AND wm2.user_id = profiles.id
    )
  );

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Add comment
COMMENT ON POLICY "Users can view workspace members profiles" ON profiles IS
  'Allows users to view their own profile and profiles of other members in their workspaces. Required for Team Members page.';
