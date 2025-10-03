-- =====================================================
-- Add Unique Constraint on Contact Phone Numbers
-- Migration: 043_unique_phone_per_workspace
-- Description: Prevent duplicate phone numbers within the same workspace
-- =====================================================

-- First, check if there are any existing duplicates that need to be resolved
-- (This query won't execute in migration, just documenting for manual check if needed)
-- SELECT workspace_id, phone, COUNT(*) as count
-- FROM contacts
-- WHERE phone IS NOT NULL
-- GROUP BY workspace_id, phone
-- HAVING COUNT(*) > 1;

-- Add unique constraint on (workspace_id, phone) combination
-- This allows:
-- - Same phone across different workspaces (different businesses can have the same customer)
-- - NULL phones (contacts without phone numbers)
-- - But prevents duplicate phones within the same workspace

ALTER TABLE contacts
ADD CONSTRAINT unique_phone_per_workspace 
UNIQUE (workspace_id, phone);

-- Add index to improve phone lookup performance
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_phone 
ON contacts(workspace_id, phone) 
WHERE phone IS NOT NULL;

-- Add comments
COMMENT ON CONSTRAINT unique_phone_per_workspace ON contacts IS
  'Ensures phone numbers are unique within a workspace. Prevents duplicate contacts and ensures webhook messages route correctly.';

COMMENT ON INDEX idx_contacts_workspace_phone IS
  'Improves performance of phone lookups for webhook message routing.';
