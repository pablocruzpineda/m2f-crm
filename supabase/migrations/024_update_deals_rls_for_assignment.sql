-- Migration: Update deals RLS policies for assignment-based access
-- Purpose: Enable role-based access control - owners/admins see all, members see assigned
-- Date: 2025-10-01

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view deals in their workspace" ON deals;
DROP POLICY IF EXISTS "Users can create deals in their workspace" ON deals;
DROP POLICY IF EXISTS "Users can update deals in their workspace" ON deals;
DROP POLICY IF EXISTS "Users can delete deals in their workspace" ON deals;

-- Policy 1: Owners and admins see ALL deals
CREATE POLICY "Owners and admins see all deals"
  ON deals FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy 2: Members see only assigned deals (or unassigned ones)
CREATE POLICY "Members see assigned deals"
  ON deals FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'member'
    )
    AND (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

-- Policy 3: Users can create deals (will be auto-assigned to them)
CREATE POLICY "Users can create deals"
  ON deals FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy 4: Users can update their assigned deals
CREATE POLICY "Users can update assigned deals"
  ON deals FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Owners/admins can update all
      auth.uid() IN (
        SELECT user_id FROM workspace_members 
        WHERE workspace_id = deals.workspace_id 
        AND role IN ('owner', 'admin')
      )
      OR
      -- Members can update assigned
      assigned_to = auth.uid()
    )
  );

-- Policy 5: Only owners/admins can delete deals
CREATE POLICY "Owners and admins can delete deals"
  ON deals FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
