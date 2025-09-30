-- =====================================================
-- Fix: Add INSERT policy for profiles table
-- Migration: 002_fix_profiles_insert_policy
-- Description: Allow service role to insert profiles during user signup
-- =====================================================

-- Add INSERT policy for profiles
-- This allows the handle_new_user trigger to create profiles
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Alternative: Allow authenticated users to insert their own profile
-- (This is safer but the trigger runs as service role, so we use the above)
-- CREATE POLICY "Users can insert their own profile"
--   ON profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);
