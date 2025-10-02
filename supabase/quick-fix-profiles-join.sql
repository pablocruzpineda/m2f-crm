-- =====================================================
-- QUICK FIX: workspace_members profiles join error
-- Run this in Supabase SQL Editor to fix the 400 error
-- =====================================================

-- Step 1: Drop the old foreign key to auth.users
ALTER TABLE workspace_members 
DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;

-- Step 2: Add new foreign key to profiles table
ALTER TABLE workspace_members 
ADD CONSTRAINT workspace_members_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Step 3: Verify the constraint was created
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint 
WHERE conname = 'workspace_members_user_id_fkey';

-- You should see:
-- constraint_name: workspace_members_user_id_fkey
-- table_name: workspace_members
-- referenced_table: profiles

-- =====================================================
-- DONE! Refresh your app and try editing a contact again.
-- =====================================================
