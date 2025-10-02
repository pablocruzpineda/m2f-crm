-- Migration: Add assignment system to contacts
-- Purpose: Enable contact assignment to team members
-- Date: 2025-10-01

-- Add assignment columns
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Set default assigned_to for existing contacts (assign to creator)
UPDATE contacts 
SET 
  assigned_to = created_by, 
  assigned_by = created_by,
  assigned_at = created_at
WHERE assigned_to IS NULL;

-- Create indexes for assignment queries
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_assigned ON contacts(workspace_id, assigned_to);

-- Add comments
COMMENT ON COLUMN contacts.assigned_to IS 'Team member responsible for this contact';
COMMENT ON COLUMN contacts.assigned_by IS 'Team member who made the assignment';
COMMENT ON COLUMN contacts.assigned_at IS 'Timestamp when the assignment was made';
