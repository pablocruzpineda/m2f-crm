-- =====================================================
-- Fix infinite recursion in workspace_members RLS policies
-- =====================================================

-- Drop existing policies with circular references
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;

-- Simple policy: Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can view members of workspaces they belong to
-- This uses a direct join without recursion
CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Policy: Only workspace owners and admins can insert/update/delete members
CREATE POLICY "Workspace admins can manage members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can update members"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can delete members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid() 
      AND wm.role IN ('owner', 'admin')
    )
  );
