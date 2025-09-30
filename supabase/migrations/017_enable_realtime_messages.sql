/**
 * Migration: Enable Realtime for messages table
 * Purpose: Allow real-time message updates in the UI
 * Phase: 5.2 - Chat Integration
 */

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add comment
COMMENT ON PUBLICATION supabase_realtime IS 'Realtime publication includes messages table for instant chat updates';

