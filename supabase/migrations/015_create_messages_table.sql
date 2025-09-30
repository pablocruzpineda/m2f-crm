/**
 * Migration: Create messages table for chat functionality
 * Purpose: Store all chat messages between users and contacts
 * Phase: 5.2 - Chat Integration
 */

-- Create enum for message sender type
CREATE TYPE sender_type AS ENUM ('user', 'contact');

-- Create enum for message type
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'audio');

-- Create enum for message status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_type sender_type NOT NULL,
  sender_id UUID NOT NULL, -- References users.id or contact.id depending on sender_type
  
  -- Message content
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text' NOT NULL,
  status message_status DEFAULT 'sent' NOT NULL,
  
  -- Optional fields
  media_url TEXT,
  external_id TEXT, -- For Mind2Flow/WhatsApp message IDs
  metadata JSONB DEFAULT '{}'::jsonb, -- Extensible for additional data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_messages_workspace_id ON messages(workspace_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_workspace_contact_created ON messages(workspace_id, contact_id, created_at DESC);
CREATE INDEX idx_messages_external_id ON messages(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_messages_status ON messages(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER messages_updated_at_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access messages in their workspace
CREATE POLICY messages_workspace_isolation ON messages
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Allow service role (for webhook) to insert messages
CREATE POLICY messages_service_role_insert ON messages
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT SELECT, INSERT ON messages TO service_role;

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores all chat messages between users and contacts';
COMMENT ON COLUMN messages.external_id IS 'External message ID from Mind2Flow/WhatsApp for tracking';
COMMENT ON COLUMN messages.metadata IS 'Flexible JSONB field for additional message data';
COMMENT ON COLUMN messages.sender_type IS 'Indicates if message is from user or contact';

