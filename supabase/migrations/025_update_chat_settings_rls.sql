-- Migration: Update chat_settings RLS for per-user configuration
-- Purpose: Allow users to manage their own settings and admins to manage workspace defaults
-- Date: 2025-10-01

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view chat settings in their workspace" ON chat_settings;
DROP POLICY IF EXISTS "Users can create chat settings in their workspace" ON chat_settings;
DROP POLICY IF EXISTS "Users can update chat settings in their workspace" ON chat_settings;
DROP POLICY IF EXISTS "Users can delete chat settings in their workspace" ON chat_settings;

-- Policy 1: Users can view their own settings and workspace defaults
CREATE POLICY "Users view their settings and workspace defaults"
  ON chat_settings FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Own settings
      user_id = auth.uid()
      -- Or workspace default
      OR user_id IS NULL
    )
  );

-- Policy 2: Owners/admins can view all settings (for status dashboard)
CREATE POLICY "Owners and admins see all chat settings"
  ON chat_settings FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy 3: Users can create their own settings
CREATE POLICY "Users can create their own chat settings"
  ON chat_settings FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Own settings
      user_id = auth.uid()
      -- Or workspace default (owners/admins only)
      OR (
        user_id IS NULL
        AND auth.uid() IN (
          SELECT user_id FROM workspace_members 
          WHERE workspace_id = chat_settings.workspace_id 
          AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Policy 4: Users can update their own settings
CREATE POLICY "Users can update their chat settings"
  ON chat_settings FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Own settings
      user_id = auth.uid()
      -- Or workspace default (owners/admins only)
      OR (
        user_id IS NULL
        AND auth.uid() IN (
          SELECT user_id FROM workspace_members 
          WHERE workspace_id = chat_settings.workspace_id 
          AND role IN ('owner', 'admin')
        )
      )
    )
  );

-- Policy 5: Users can delete their own settings
CREATE POLICY "Users can delete their chat settings"
  ON chat_settings FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Own settings
      user_id = auth.uid()
      -- Or workspace default (owners/admins only)
      OR (
        user_id IS NULL
        AND auth.uid() IN (
          SELECT user_id FROM workspace_members 
          WHERE workspace_id = chat_settings.workspace_id 
          AND role IN ('owner', 'admin')
        )
      )
    )
  );
