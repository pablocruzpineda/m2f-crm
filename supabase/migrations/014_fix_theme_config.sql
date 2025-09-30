-- Migration: Fix theme_config for existing workspaces
-- Phase: 5.1
-- Description: Updates any workspaces with NULL or invalid theme_config

-- Update any workspaces that have NULL theme_config
UPDATE workspaces
SET theme_config = '{
  "primary_color": "#4F46E5",
  "secondary_color": "#10B981", 
  "accent_color": "#F59E0B",
  "theme_mode": "light"
}'::jsonb
WHERE theme_config IS NULL;

-- Update any workspaces that have empty or invalid theme_config
UPDATE workspaces
SET theme_config = '{
  "primary_color": "#4F46E5",
  "secondary_color": "#10B981", 
  "accent_color": "#F59E0B",
  "theme_mode": "light"
}'::jsonb
WHERE theme_config::text = '{}'
   OR NOT (theme_config ? 'primary_color')
   OR NOT (theme_config ? 'secondary_color')
   OR NOT (theme_config ? 'accent_color')
   OR NOT (theme_config ? 'theme_mode');
