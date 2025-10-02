-- Migration: Update contacts RLS policies for assignment-based access
-- Purpose: Enable role-based access control - owners/admins see all, members see assigned
-- Date: 2025-10-01

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their workspace" ON contacts;

-- Policy 1: Owners and admins see ALL contacts
CREATE POLICY "Owners and admins see all contacts"
  ON contacts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy 2: Members see only assigned contacts (or unassigned ones)
CREATE POLICY "Members see assigned contacts"
  ON contacts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'member'
    )
    AND (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

-- Policy 3: Users can create contacts (will be auto-assigned to them)
CREATE POLICY "Users can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy 4: Users can update their assigned contacts
CREATE POLICY "Users can update assigned contacts"
  ON contacts FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Owners/admins can update all
      auth.uid() IN (
        SELECT user_id FROM workspace_members 
        WHERE workspace_id = contacts.workspace_id 
        AND role IN ('owner', 'admin')
      )
      OR
      -- Members can update assigned
      assigned_to = auth.uid()
    )
  );

-- Policy 5: Only owners/admins can delete contacts
CREATE POLICY "Owners and admins can delete contacts"
  ON contacts FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
