-- Migration: Enable Realtime for contacts table
-- This allows real-time subscriptions to contact changes

-- Enable realtime for contacts table
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;

-- Set replica identity to FULL to get old and new values in updates
ALTER TABLE contacts REPLICA IDENTITY FULL;
