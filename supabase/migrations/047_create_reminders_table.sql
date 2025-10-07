-- Migration 047: Create reminders table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- What to remind about
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- When to send reminder
  remind_at TIMESTAMPTZ NOT NULL,
  
  -- Reminder status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_meeting_id ON reminders(meeting_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX idx_reminders_status ON reminders(status) WHERE status = 'pending';
CREATE INDEX idx_reminders_pending_due ON reminders(user_id, remind_at) WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own reminders
CREATE POLICY "Users can view their own reminders"
  ON reminders
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can create reminders for themselves
CREATE POLICY "Users can create their own reminders"
  ON reminders
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND meeting_id IN (
      SELECT id 
      FROM meetings 
      WHERE workspace_id = reminders.workspace_id
    )
  );

-- Policy: Users can update their own reminders
CREATE POLICY "Users can update their own reminders"
  ON reminders
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own reminders
CREATE POLICY "Users can delete their own reminders"
  ON reminders
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable Realtime for reminders (for notification center)
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;

-- Add comment
COMMENT ON TABLE reminders IS 'Stores reminders for upcoming meetings';
