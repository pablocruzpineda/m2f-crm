-- =====================================================
-- Fix workspace_members to profiles relationship
-- Migration: 027_fix_workspace_members_profiles_fk
-- Description: Add explicit foreign key to profiles table for proper PostgREST joins
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE workspace_members 
DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;

-- Add foreign key constraint to profiles table
-- This allows PostgREST to automatically detect the relationship
ALTER TABLE workspace_members 
ADD CONSTRAINT workspace_members_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT workspace_members_user_id_fkey ON workspace_members IS 
'Foreign key to profiles table for user information. This enables automatic joins in PostgREST queries.';
