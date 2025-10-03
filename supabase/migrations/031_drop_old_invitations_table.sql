-- =====================================================
-- Drop Old Invitations Table
-- Migration: 031_drop_old_invitations_table
-- Description: Remove deprecated invitations table (replaced by team_invitations)
-- =====================================================

-- Drop the old invitations table
-- The new team_invitations table (migration 029) has better structure:
-- - Includes phone number for WhatsApp invitations
-- - Includes full_name field
-- - Better status tracking
-- - More flexible authentication

DROP TABLE IF EXISTS invitations CASCADE;

-- Add comment
COMMENT ON DATABASE postgres IS 'Removed deprecated invitations table in favor of team_invitations';
