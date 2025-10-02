-- =====================================================
-- DIAGNOSTIC: Check profiles table health
-- Run this in Supabase SQL Editor to diagnose the timeout issue
-- =====================================================

-- 1. Check if profiles table exists and has data
SELECT 
  count(*) as total_profiles,
  count(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email,
  count(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_name
FROM profiles;

-- 2. Check RLS policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Check indexes on profiles table
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- 4. Test a simple profile query (replace with your user ID)
-- Get your user ID first:
SELECT auth.uid() as your_user_id;

-- Then test the query (replace 'YOUR_USER_ID' with the actual ID from above):
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- 5. Check if there are any slow queries or locks
SELECT 
  pid,
  usename,
  state,
  query,
  query_start,
  state_change
FROM pg_stat_activity 
WHERE datname = current_database()
  AND state != 'idle'
ORDER BY query_start;
