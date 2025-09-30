-- =====================================================
-- Temporarily disable the trigger to test signup
-- Migration: 003_temporarily_disable_trigger
-- =====================================================

-- Disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- We'll manually create profiles in the app for now
