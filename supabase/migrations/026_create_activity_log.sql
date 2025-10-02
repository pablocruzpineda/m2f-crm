-- Migration: Create activity log table
-- Purpose: Track team member activities for audit and collaboration
-- Date: 2025-10-01

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Activity details
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  -- Additional data (flexible JSON for context)
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'created', 'updated', 'deleted', 'assigned', 'status_changed',
    'member_added', 'member_removed', 'role_changed', 'note_added'
  )),
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'contact', 'deal', 'message', 'member', 'workspace', 'settings', 'note'
  ))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_workspace ON activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_workspace_created ON activity_log(workspace_id, created_at DESC);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view activity in their workspace
CREATE POLICY "Users can view activity in their workspace"
  ON activity_log FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Users can create activity logs
CREATE POLICY "Users can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Add comments
COMMENT ON TABLE activity_log IS 'Audit log of team member activities';
COMMENT ON COLUMN activity_log.action IS 'Type of action performed';
COMMENT ON COLUMN activity_log.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN activity_log.entity_id IS 'ID of the affected entity (if applicable)';
COMMENT ON COLUMN activity_log.details IS 'Additional context about the action (JSON)';
