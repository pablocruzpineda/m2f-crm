-- =====================================================
-- Verify Team Invitations Table
-- Run this to check if the migration was successful
-- =====================================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'team_invitations'
) as table_exists;

-- 2. View table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'team_invitations'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'team_invitations';

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'team_invitations';

-- 5. Test insert (will fail due to RLS, but confirms structure)
-- Don't actually run this - just for reference
/*
INSERT INTO team_invitations (
  workspace_id,
  email,
  full_name,
  phone,
  role,
  invited_by,
  token
) VALUES (
  'test-workspace-id',
  'test@example.com',
  'Test User',
  '+15551234567',
  'member',
  'test-user-id',
  'test-token-123'
);
*/

-- 6. Check the expire function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'expire_old_invitations'
) as function_exists;
