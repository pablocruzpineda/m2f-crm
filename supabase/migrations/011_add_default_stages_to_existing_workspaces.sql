-- Migration: Add Default Pipeline Stages to Existing Workspaces
-- Description: Backfill default pipeline stages for workspaces created before pipeline feature
-- Author: M2F CRM
-- Date: 2025-09-30

-- Insert default pipeline stages for all existing workspaces that don't have any stages yet
INSERT INTO pipeline_stages (workspace_id, name, description, color, display_order, probability, is_closed, is_won)
SELECT 
  w.id as workspace_id,
  stage.name,
  stage.description,
  stage.color,
  stage.display_order,
  stage.probability,
  stage.is_closed,
  stage.is_won
FROM workspaces w
CROSS JOIN (
  VALUES
    ('Lead', 'Initial contact or inquiry', '#94a3b8', 0, 10, FALSE, FALSE),
    ('Qualified', 'Lead has been qualified', '#3b82f6', 1, 25, FALSE, FALSE),
    ('Proposal', 'Proposal sent to prospect', '#8b5cf6', 2, 50, FALSE, FALSE),
    ('Negotiation', 'Negotiating terms', '#f59e0b', 3, 75, FALSE, FALSE),
    ('Closed Won', 'Deal successfully closed', '#10b981', 4, 100, TRUE, TRUE),
    ('Closed Lost', 'Deal was lost', '#ef4444', 5, 0, TRUE, FALSE)
) AS stage(name, description, color, display_order, probability, is_closed, is_won)
WHERE NOT EXISTS (
  -- Only insert if the workspace doesn't already have stages
  SELECT 1 FROM pipeline_stages ps 
  WHERE ps.workspace_id = w.id
);
