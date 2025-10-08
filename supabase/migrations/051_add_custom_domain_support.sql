-- Migration 051: Add custom domain support for sub-accounts
-- Allows sub-accounts to use custom domains or subdomains for white-label access

-- Add custom_domain column to workspaces table
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- Add unique constraint to prevent duplicate custom domains
ALTER TABLE workspaces 
ADD CONSTRAINT unique_custom_domain UNIQUE (custom_domain);

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_custom_domain 
ON workspaces(custom_domain) 
WHERE custom_domain IS NOT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN workspaces.custom_domain IS 
'Custom domain or subdomain for workspace access. Examples: client.yourcrm.com or crm.client.com';

-- Examples of how this will work:
-- Master workspace: custom_domain = NULL (uses main domain)
-- Sub-account 1: custom_domain = 'abc-corp.yourcrm.com' (subdomain)
-- Sub-account 2: custom_domain = 'crm.xyzltd.com' (custom domain)
-- Sub-account 3: custom_domain = NULL (will use slug for subdomain: slug.yourcrm.com)

-- Function to get workspace by hostname
CREATE OR REPLACE FUNCTION get_workspace_by_hostname(p_hostname TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  owner_id UUID,
  parent_workspace_id UUID,
  custom_domain TEXT,
  theme_config JSONB,
  logo_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, try to match custom_domain exactly
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.slug,
    w.owner_id,
    w.parent_workspace_id,
    w.custom_domain,
    w.theme_config,
    w.logo_url
  FROM workspaces w
  WHERE w.custom_domain = p_hostname
  LIMIT 1;
  
  -- If no match, return nothing (caller will try subdomain matching)
  RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_workspace_by_hostname(TEXT) TO authenticated;

-- Function to get workspace by slug (for subdomain routing)
CREATE OR REPLACE FUNCTION get_workspace_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  owner_id UUID,
  parent_workspace_id UUID,
  custom_domain TEXT,
  theme_config JSONB,
  logo_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.slug,
    w.owner_id,
    w.parent_workspace_id,
    w.custom_domain,
    w.theme_config,
    w.logo_url
  FROM workspaces w
  WHERE w.slug = p_slug
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_workspace_by_slug(TEXT) TO authenticated;

-- Add validation to prevent invalid custom domains
CREATE OR REPLACE FUNCTION validate_custom_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow valid domain format (basic validation)
  IF NEW.custom_domain IS NOT NULL THEN
    -- Remove protocol if present
    NEW.custom_domain := regexp_replace(NEW.custom_domain, '^https?://', '', 'i');
    
    -- Remove trailing slash
    NEW.custom_domain := regexp_replace(NEW.custom_domain, '/$', '');
    
    -- Convert to lowercase
    NEW.custom_domain := lower(NEW.custom_domain);
    
    -- Basic domain validation (alphanumeric, hyphens, dots)
    IF NOT (NEW.custom_domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$') THEN
      RAISE EXCEPTION 'Invalid custom domain format. Must be a valid domain like: subdomain.yourcrm.com or crm.client.com';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS trigger_validate_custom_domain ON workspaces;
CREATE TRIGGER trigger_validate_custom_domain
  BEFORE INSERT OR UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION validate_custom_domain();

-- Drop and recreate get_sub_accounts function to include custom_domain
DROP FUNCTION IF EXISTS get_sub_accounts(UUID);

CREATE OR REPLACE FUNCTION get_sub_accounts(p_master_workspace_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    owner_id UUID,
    parent_workspace_id UUID,
    custom_domain TEXT,
    admin_email TEXT,
    admin_name TEXT,
    member_count BIGINT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.slug,
    w.owner_id,
    w.parent_workspace_id,
    w.custom_domain,
    p.email as admin_email,
    p.full_name as admin_name,
    (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
    w.created_at
  FROM workspaces w
  LEFT JOIN profiles p ON p.id = w.owner_id
  WHERE w.parent_workspace_id = p_master_workspace_id
  ORDER BY w.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_workspace_by_hostname(TEXT) IS 
'Get workspace by custom domain hostname. Used for subdomain/custom domain routing.';

COMMENT ON FUNCTION get_workspace_by_slug(TEXT) IS 
'Get workspace by slug. Used for subdomain routing when custom_domain is not set.';

COMMENT ON FUNCTION validate_custom_domain() IS 
'Validates and normalizes custom domain format before saving.';
