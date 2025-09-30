-- Migration: Create Deals and Pipeline Tables
-- Description: Deal/Opportunity pipeline management with customizable stages
-- Author: M2F CRM
-- Date: 2025-09-30

-- =====================================================
-- 1. Pipeline Stages Table
-- =====================================================
-- Customizable pipeline stages per workspace
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color code
  display_order INTEGER NOT NULL DEFAULT 0,
  is_closed BOOLEAN DEFAULT FALSE, -- Whether this stage represents a closed deal
  is_won BOOLEAN DEFAULT FALSE, -- Whether this stage represents a won deal
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100), -- Win probability (0-100%)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_workspace_stage_name UNIQUE (workspace_id, name),
  CONSTRAINT unique_workspace_stage_order UNIQUE (workspace_id, display_order)
);

-- =====================================================
-- 2. Deals Table
-- =====================================================
-- Sales opportunities/deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(15, 2) DEFAULT 0, -- Deal value/amount
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
  lost_reason TEXT,
  won_date DATE,
  
  -- Relationships
  primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Sales rep/owner
  
  -- Tracking
  position INTEGER DEFAULT 0, -- Position within stage (for drag-drop ordering)
  source VARCHAR(100), -- Where the deal came from
  tags TEXT[], -- Array of tags
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  
  -- Indexes will be added below
  CONSTRAINT positive_value CHECK (value >= 0)
);

-- =====================================================
-- 3. Deal Contacts Junction Table
-- =====================================================
-- Many-to-many relationship between deals and contacts
CREATE TABLE IF NOT EXISTS deal_contacts (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(50), -- e.g., "Decision Maker", "Influencer", "User"
  is_primary BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  PRIMARY KEY (deal_id, contact_id)
);

-- =====================================================
-- 4. Deal Activities Table
-- =====================================================
-- Track all activities/history for deals
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  activity_type VARCHAR(50) NOT NULL, -- 'created', 'stage_changed', 'value_changed', 'note_added', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Activity data
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- User tracking
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index on deal_id and created_at for efficient querying
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'created', 'stage_changed', 'value_changed', 'status_changed',
    'contact_added', 'contact_removed', 'note_added', 'updated', 'closed'
  ))
);

-- =====================================================
-- 5. Indexes
-- =====================================================

-- Pipeline Stages
CREATE INDEX idx_pipeline_stages_workspace ON pipeline_stages(workspace_id);
CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(workspace_id, display_order);

-- Deals
CREATE INDEX idx_deals_workspace ON deals(workspace_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_primary_contact ON deals(primary_contact_id);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX idx_deals_workspace_stage ON deals(workspace_id, stage_id, position);

-- Deal Contacts
CREATE INDEX idx_deal_contacts_deal ON deal_contacts(deal_id);
CREATE INDEX idx_deal_contacts_contact ON deal_contacts(contact_id);
CREATE INDEX idx_deal_contacts_primary ON deal_contacts(deal_id) WHERE is_primary = TRUE;

-- Deal Activities
CREATE INDEX idx_deal_activities_deal ON deal_activities(deal_id, created_at DESC);
CREATE INDEX idx_deal_activities_workspace ON deal_activities(workspace_id, created_at DESC);
CREATE INDEX idx_deal_activities_type ON deal_activities(activity_type);

-- =====================================================
-- 6. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- Pipeline Stages Policies
CREATE POLICY "Users can view pipeline stages in their workspaces"
  ON pipeline_stages FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pipeline stages in their workspaces"
  ON pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pipeline stages in their workspaces"
  ON pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pipeline stages in their workspaces"
  ON pipeline_stages FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Deals Policies
CREATE POLICY "Users can view deals in their workspaces"
  ON deals FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deals in their workspaces"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update deals in their workspaces"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete deals in their workspaces"
  ON deals FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Deal Contacts Policies
CREATE POLICY "Users can view deal contacts in their workspaces"
  ON deal_contacts FOR SELECT
  TO authenticated
  USING (
    deal_id IN (
      SELECT id FROM deals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage deal contacts in their workspaces"
  ON deal_contacts FOR ALL
  TO authenticated
  USING (
    deal_id IN (
      SELECT id FROM deals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Deal Activities Policies
CREATE POLICY "Users can view deal activities in their workspaces"
  ON deal_activities FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deal activities in their workspaces"
  ON deal_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for deals updated_at
CREATE TRIGGER update_deals_timestamp
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();

-- Function to update pipeline stages updated_at
CREATE OR REPLACE FUNCTION update_pipeline_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pipeline_stages updated_at
CREATE TRIGGER update_pipeline_stages_timestamp
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_stages_updated_at();

-- Function to create default pipeline stages for new workspaces
CREATE OR REPLACE FUNCTION create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default pipeline stages
  INSERT INTO pipeline_stages (workspace_id, name, description, color, display_order, probability, is_closed, is_won)
  VALUES
    (NEW.id, 'Lead', 'Initial contact or inquiry', '#94a3b8', 0, 10, FALSE, FALSE),
    (NEW.id, 'Qualified', 'Lead has been qualified', '#3b82f6', 1, 25, FALSE, FALSE),
    (NEW.id, 'Proposal', 'Proposal sent to prospect', '#8b5cf6', 2, 50, FALSE, FALSE),
    (NEW.id, 'Negotiation', 'Negotiating terms', '#f59e0b', 3, 75, FALSE, FALSE),
    (NEW.id, 'Closed Won', 'Deal successfully closed', '#10b981', 4, 100, TRUE, TRUE),
    (NEW.id, 'Closed Lost', 'Deal was lost', '#ef4444', 5, 0, TRUE, FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default pipeline stages for new workspaces
CREATE TRIGGER create_default_pipeline_on_workspace_creation
  AFTER INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION create_default_pipeline_stages();

-- =====================================================
-- 8. Comments
-- =====================================================

COMMENT ON TABLE pipeline_stages IS 'Customizable pipeline stages for sales workflows';
COMMENT ON TABLE deals IS 'Sales opportunities and deals';
COMMENT ON TABLE deal_contacts IS 'Many-to-many relationship between deals and contacts';
COMMENT ON TABLE deal_activities IS 'Activity history and timeline for deals';

COMMENT ON COLUMN deals.probability IS 'Percentage likelihood of winning the deal (0-100)';
COMMENT ON COLUMN deals.position IS 'Position within stage for drag-drop ordering';
COMMENT ON COLUMN pipeline_stages.is_closed IS 'Whether this stage represents a closed deal (won or lost)';
COMMENT ON COLUMN pipeline_stages.is_won IS 'Whether this stage represents a won deal';
