-- Migration 044: Create meetings table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  
  -- Time & Location
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  location TEXT,
  meeting_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  
  -- Relationships
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for better query performance
CREATE INDEX idx_meetings_workspace_id ON meetings(workspace_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_end_time ON meetings(end_time);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_contact_id ON meetings(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_meetings_deal_id ON meetings(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_date_range ON meetings(workspace_id, start_time, end_time);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view meetings in their workspace
CREATE POLICY "Users can view workspace meetings"
  ON meetings
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create meetings in their workspace
CREATE POLICY "Users can create meetings in workspace"
  ON meetings
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can update their own meetings, admins/owners can update all
CREATE POLICY "Users can update their meetings or admins update all"
  ON meetings
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 
        FROM workspace_members 
        WHERE workspace_id = meetings.workspace_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin')
      )
    )
  );

-- Policy: Users can delete their own meetings, admins/owners can delete all
CREATE POLICY "Users can delete their meetings or admins delete all"
  ON meetings
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR
      EXISTS (
        SELECT 1 
        FROM workspace_members 
        WHERE workspace_id = meetings.workspace_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin')
      )
    )
  );

-- Enable Realtime for meetings table
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;

-- Create updated_at trigger
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE meetings IS 'Stores calendar meetings and appointments';
