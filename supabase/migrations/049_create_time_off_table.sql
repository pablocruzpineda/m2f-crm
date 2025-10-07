-- Migration 049: Create time_off table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create time_off table
CREATE TABLE IF NOT EXISTS time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Time off period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Details
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes
CREATE INDEX idx_time_off_user_id ON time_off(user_id, workspace_id);
CREATE INDEX idx_time_off_dates ON time_off(start_date, end_date);
CREATE INDEX idx_time_off_status ON time_off(status);
CREATE INDEX idx_time_off_date_range ON time_off(user_id, start_date, end_date);

-- Enable Row Level Security
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view time off in their workspace
CREATE POLICY "Users can view workspace time off"
  ON time_off
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create their own time off requests
CREATE POLICY "Users can create their own time off"
  ON time_off
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own time off, admins can update all
CREATE POLICY "Users can update their time off or admins update all"
  ON time_off
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Policy: Users can delete their own time off, admins can delete all
CREATE POLICY "Users can delete their time off or admins delete all"
  ON time_off
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Add comment
COMMENT ON TABLE time_off IS 'Stores vacation, sick days, and other time off periods for team members';
