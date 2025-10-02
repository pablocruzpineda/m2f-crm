-- Migration: Add assignment system to deals
-- Purpose: Enable deal assignment to team members
-- Date: 2025-10-01

-- Add assignment columns
ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Set default assigned_to for existing deals (assign to creator)
UPDATE deals 
SET 
  assigned_to = created_by, 
  assigned_by = created_by,
  assigned_at = created_at
WHERE assigned_to IS NULL;

-- Create indexes for assignment queries
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_workspace_assigned ON deals(workspace_id, assigned_to);

-- Add comments
COMMENT ON COLUMN deals.assigned_to IS 'Team member responsible for this deal';
COMMENT ON COLUMN deals.assigned_by IS 'Team member who made the assignment';
COMMENT ON COLUMN deals.assigned_at IS 'Timestamp when the assignment was made';
