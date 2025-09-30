-- =====================================================
-- Disable trigger again - it's causing auth to hang
-- Migration: 005_disable_trigger_again
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- We'll handle profile creation in the application code instead
