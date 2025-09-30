-- =====================================================
-- Cleanup: Remove unused trigger function
-- Migration: 008_cleanup_unused_trigger_function
-- =====================================================

-- The trigger was disabled in migration 005
-- Profile creation is now handled in application code
-- This function is no longer needed

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Note: Profile creation is now in src/features/auth/signup/model/useSignup.ts
