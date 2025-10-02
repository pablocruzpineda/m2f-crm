-- =====================================================
-- Check if your profile exists
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check your current user ID
SELECT auth.uid() as current_user_id;

-- 2. Check if your profile exists
SELECT 
  id,
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM profiles
WHERE id = auth.uid();

-- 3. If the above returns nothing, create your profile manually:
-- INSERT INTO profiles (id, email, full_name)
-- VALUES (
--   auth.uid(),
--   (SELECT email FROM auth.users WHERE id = auth.uid()),
--   'Your Name Here'
-- );

-- 4. Verify all profiles in the system
SELECT 
  id,
  email,
  full_name,
  created_at
FROM profiles
ORDER BY created_at DESC;
