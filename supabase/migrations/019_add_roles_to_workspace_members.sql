-- Migration: Add role system to workspace_members
-- Purpose: Enable role-based access control (owner, admin, member, viewer)
-- Date: 2025-10-01

-- Check if role column exists and what type it is
DO $$ 
BEGIN
  -- If role column doesn't exist, add it as TEXT
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_members' AND column_name = 'role'
  ) THEN
    ALTER TABLE workspace_members 
      ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
  END IF;
  
  -- If it exists as an ENUM, we need to add missing values
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_members' 
    AND column_name = 'role' 
    AND udt_name = 'member_role'
  ) THEN
    -- Add 'owner' to enum if it doesn't exist
    BEGIN
      ALTER TYPE member_role ADD VALUE IF NOT EXISTS 'owner';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    
    -- Add 'viewer' to enum if it doesn't exist
    BEGIN
      ALTER TYPE member_role ADD VALUE IF NOT EXISTS 'viewer';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Set existing workspace owners
UPDATE workspace_members 
SET role = 'owner'
WHERE workspace_id IN (
  SELECT id FROM workspaces 
  WHERE workspaces.owner_id = workspace_members.user_id
)
AND role != 'owner';

-- Create indexes for role queries
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON workspace_members(role);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_role ON workspace_members(workspace_id, role);

-- Add comment
COMMENT ON COLUMN workspace_members.role IS 
  'User role in workspace: owner (1 per workspace), admin (many), member (many), viewer (read-only)';
