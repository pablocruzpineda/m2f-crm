-- =====================================================
-- M2F CRM - Initial Database Schema
-- Migration: 001_initial_schema
-- Description: Multi-tenant foundation with workspaces, users, and RLS
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Stores user profile information
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- WORKSPACES TABLE
-- The tenant container - all data belongs to a workspace
-- =====================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  
  -- Theme customization (JSON for flexibility)
  theme_config JSONB DEFAULT '{
    "primaryColor": "hsl(222.2 47.4% 11.2%)",
    "accentColor": "hsl(210 40% 96.1%)",
    "backgroundColor": "hsl(0 0% 100%)"
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Owner reference (user who created the workspace)
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS (policies will be added AFTER workspace_members table is created)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WORKSPACE_MEMBERS TABLE
-- Many-to-many relationship between users and workspaces
-- =====================================================
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  
  -- Metadata
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique user per workspace
  UNIQUE(workspace_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policies: Users can see memberships in their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- WORKSPACES POLICIES (Created after workspace_members)
-- =====================================================

-- Policies: Users can only see workspaces they're members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workspaces they own"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- INVITATIONS TABLE
-- Pending invitations to join workspaces
-- =====================================================
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role member_role NOT NULL DEFAULT 'member',
  status invitation_status NOT NULL DEFAULT 'pending',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Metadata
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Track acceptance
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for token lookups
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view invitations to their workspaces"
  ON invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Workspace admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Create workspace with owner as first member
CREATE OR REPLACE FUNCTION create_workspace_with_owner(
  workspace_name TEXT,
  workspace_slug TEXT,
  user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Insert workspace
  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (workspace_name, workspace_slug, user_id)
  RETURNING id INTO new_workspace_id;
  
  -- Add owner as first member
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, user_id, 'owner');
  
  RETURN new_workspace_id;
END;
$$;

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers: Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing - remove in production)
-- =====================================================

-- Note: You'll need to run this after creating test users via Supabase Auth
-- Replace the UUIDs with actual user IDs from auth.users

-- Example:
-- INSERT INTO workspaces (name, slug, owner_id)
-- VALUES ('Acme Corp', 'acme-corp', 'your-user-uuid-here');

-- INSERT INTO workspace_members (workspace_id, user_id, role)
-- VALUES ('workspace-uuid-here', 'your-user-uuid-here', 'owner');

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE workspaces IS 'Tenant containers - all CRM data belongs to a workspace';
COMMENT ON TABLE workspace_members IS 'Many-to-many relationship between users and workspaces';
COMMENT ON TABLE invitations IS 'Pending workspace invitations';

COMMENT ON COLUMN workspaces.theme_config IS 'JSON configuration for workspace theme customization';
COMMENT ON COLUMN workspaces.slug IS 'URL-friendly unique identifier for workspace';
