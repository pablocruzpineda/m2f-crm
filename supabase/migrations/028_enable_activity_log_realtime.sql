-- =====================================================
-- Enable realtime for activity_log table
-- Migration: 028_enable_activity_log_realtime
-- Description: Enable real-time subscriptions for the activity feed
-- =====================================================

-- Enable realtime publication for activity_log table
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Add comment
COMMENT ON TABLE activity_log IS 'Activity log table with realtime enabled for live feed updates';
