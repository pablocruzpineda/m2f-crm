-- Migration: Add workspace customization (logo and theme)
-- Phase: 5.1
-- Description: Adds logo storage references and theme configuration to workspaces table

-- Add customization columns to workspaces table
ALTER TABLE workspaces 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981", 
    "accent_color": "#F59E0B",
    "theme_mode": "light"
  }'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN workspaces.logo_url IS 'Public URL to workspace logo from Supabase Storage';
COMMENT ON COLUMN workspaces.logo_storage_path IS 'Storage path for logo file (for deletion)';
COMMENT ON COLUMN workspaces.theme_config IS 'Workspace theme configuration including colors and mode';

-- Create index on theme_config for faster queries (optional, for future filtering)
CREATE INDEX IF NOT EXISTS idx_workspaces_theme_mode 
  ON workspaces ((theme_config->>'theme_mode'));
