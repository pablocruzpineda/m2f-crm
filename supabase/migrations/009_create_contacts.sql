-- Migration 009: Create Contact Management Tables
-- This migration creates tables for contacts, contact tags, and tag assignments

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Social & Web
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  
  -- CRM Data
  source TEXT, -- how they were acquired (e.g., 'website', 'referral', 'event')
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'lead', 'customer'
  notes TEXT,
  
  -- Custom Fields (JSONB for flexibility)
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'lead', 'customer'))
);

-- =====================================================
-- CONTACT TAGS TABLE
-- =====================================================
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6', -- hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, name)
);

-- =====================================================
-- CONTACT TAG ASSIGNMENTS (Junction Table)
-- =====================================================
CREATE TABLE contact_tag_assignments (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES contact_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (contact_id, tag_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contact_tags_workspace ON contact_tags(workspace_id);
CREATE INDEX idx_contact_tag_assignments_contact ON contact_tag_assignments(contact_id);
CREATE INDEX idx_contact_tag_assignments_tag ON contact_tag_assignments(tag_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tag_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONTACTS RLS POLICIES
-- =====================================================
CREATE POLICY "Users can view contacts in their workspace"
  ON contacts FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create contacts in their workspace"
  ON contacts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update contacts in their workspace"
  ON contacts FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete contacts in their workspace"
  ON contacts FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- =====================================================
-- CONTACT TAGS RLS POLICIES
-- =====================================================
CREATE POLICY "Users can view tags in their workspace"
  ON contact_tags FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create tags in their workspace"
  ON contact_tags FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update tags in their workspace"
  ON contact_tags FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags in their workspace"
  ON contact_tags FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- =====================================================
-- CONTACT TAG ASSIGNMENTS RLS POLICIES
-- =====================================================
CREATE POLICY "Users can view tag assignments in their workspace"
  ON contact_tag_assignments FOR SELECT
  USING (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create tag assignments in their workspace"
  ON contact_tag_assignments FOR INSERT
  WITH CHECK (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete tag assignments in their workspace"
  ON contact_tag_assignments FOR DELETE
  USING (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));
