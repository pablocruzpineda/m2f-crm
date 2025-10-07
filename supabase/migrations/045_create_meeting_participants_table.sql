-- Migration 045: Create meeting_participants table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create meeting_participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Participant can be either a workspace member OR an external contact
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- RSVP Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure participant is either user OR contact, not both or none
  CONSTRAINT participant_type CHECK (
    (user_id IS NOT NULL AND contact_id IS NULL) OR
    (user_id IS NULL AND contact_id IS NOT NULL)
  ),
  
  -- Prevent duplicate participants
  CONSTRAINT unique_user_participant UNIQUE(meeting_id, user_id),
  CONSTRAINT unique_contact_participant UNIQUE(meeting_id, contact_id)
);

-- Create indexes
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_meeting_participants_contact_id ON meeting_participants(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_meeting_participants_status ON meeting_participants(status);

-- Enable Row Level Security
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view participants of meetings in their workspace
CREATE POLICY "Users can view meeting participants in workspace"
  ON meeting_participants
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

-- Policy: Meeting creator can add participants
CREATE POLICY "Meeting creator can add participants"
  ON meeting_participants
  FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE created_by = auth.uid()
    )
  );

-- Policy: Meeting creator or admins can update participant status
CREATE POLICY "Meeting creator or admins can update participants"
  ON meeting_participants
  FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE created_by = auth.uid()
    )
    OR
    meeting_id IN (
      SELECT m.id 
      FROM meetings m
      INNER JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
    -- Or user can update their own RSVP status
    OR user_id = auth.uid()
  );

-- Policy: Meeting creator or admins can remove participants
CREATE POLICY "Meeting creator or admins can remove participants"
  ON meeting_participants
  FOR DELETE
  USING (
    meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE created_by = auth.uid()
    )
    OR
    meeting_id IN (
      SELECT m.id 
      FROM meetings m
      INNER JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Add comment
COMMENT ON TABLE meeting_participants IS 'Tracks meeting participants (team members and contacts) with RSVP status';
