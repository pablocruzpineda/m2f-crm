-- Migration 046: Create meeting_notes table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create meeting_notes table
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Note content
  content TEXT NOT NULL,
  
  -- Author
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);
CREATE INDEX idx_meeting_notes_created_by ON meeting_notes(created_by);
CREATE INDEX idx_meeting_notes_created_at ON meeting_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view notes for meetings in their workspace
CREATE POLICY "Users can view meeting notes in workspace"
  ON meeting_notes
  FOR SELECT
  USING (
    meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE workspace_id IN (
        SELECT workspace_id 
        FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can create notes for meetings in their workspace
CREATE POLICY "Users can create notes for workspace meetings"
  ON meeting_notes
  FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE workspace_id IN (
        SELECT workspace_id 
        FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
    AND created_by = auth.uid()
  );

-- Policy: Users can update their own notes
CREATE POLICY "Users can update their own notes"
  ON meeting_notes
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Users can delete their own notes, admins/owners can delete all
CREATE POLICY "Users can delete their notes or admins delete all"
  ON meeting_notes
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    meeting_id IN (
      SELECT m.id 
      FROM meetings m
      INNER JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE meeting_notes IS 'Stores notes and minutes for meetings';
