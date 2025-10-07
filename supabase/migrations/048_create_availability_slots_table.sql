-- Migration 048: Create availability_slots table
-- Phase 6: Calendar & Meeting Management
-- Created: October 6, 2025

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Weekly recurring schedule
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Timezone for this schedule
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Available or blocked time
  is_available BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_slot CHECK (end_time > start_time),
  CONSTRAINT unique_availability_slot UNIQUE(user_id, workspace_id, day_of_week, start_time)
);

-- Create indexes
CREATE INDEX idx_availability_slots_user_id ON availability_slots(user_id, workspace_id);
CREATE INDEX idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX idx_availability_slots_is_available ON availability_slots(is_available);

-- Enable Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view availability in their workspace
CREATE POLICY "Users can view workspace availability"
  ON availability_slots
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can manage their own availability
CREATE POLICY "Users can manage their own availability"
  ON availability_slots
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE availability_slots IS 'Stores weekly working hours and availability for team members';
