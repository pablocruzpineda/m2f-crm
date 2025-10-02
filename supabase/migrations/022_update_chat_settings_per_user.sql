-- Migration: Update chat_settings for per-user configuration
-- Purpose: Enable each user to have personal WhatsApp settings with workspace fallback
-- Date: 2025-10-01

-- Add user_id column (nullable for workspace defaults)
ALTER TABLE chat_settings 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);

-- Drop old unique constraint on workspace_id only
ALTER TABLE chat_settings 
  DROP CONSTRAINT IF EXISTS chat_settings_workspace_unique;

-- Add new unique constraint that allows multiple entries per workspace (one per user + one workspace default)
-- UNIQUE NULLS NOT DISTINCT means NULL values are considered equal for uniqueness
ALTER TABLE chat_settings 
  ADD CONSTRAINT unique_workspace_user_settings 
  UNIQUE NULLS NOT DISTINCT (workspace_id, user_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_id ON chat_settings(user_id) WHERE user_id IS NOT NULL;

-- Add comment explaining the nullable user_id
COMMENT ON COLUMN chat_settings.user_id IS 
  'NULL = workspace default settings (for webhook receiving and fallback sending), UUID = user personal settings (for sending from their phone)';

-- Note: Existing settings have user_id = NULL, which makes them workspace defaults (perfect!)
