import { supabase } from '@/shared/lib/supabase';
import type {
  ChatSettings,
  CreateChatSettingsInput,
  UpdateChatSettingsInput,
} from '@/shared/lib/database/types';

/**
 * Get chat settings for a workspace
 */
export async function getChatSettings(
  workspaceId: string
): Promise<ChatSettings | null> {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error) {
    // If no settings exist yet, return null (not an error)
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching chat settings:', error);
    throw error;
  }

  return data;
}

/**
 * Create chat settings for a workspace
 */
export async function createChatSettings(
  input: CreateChatSettingsInput
): Promise<ChatSettings> {
  const { data, error } = await supabase
    .from('chat_settings')
    .insert({
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat settings:', error);
    throw error;
  }

  return data;
}

/**
 * Update chat settings
 */
export async function updateChatSettings(
  settingsId: string,
  updates: UpdateChatSettingsInput
): Promise<ChatSettings> {
  const { data, error } = await supabase
    .from('chat_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', settingsId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat settings:', error);
    throw error;
  }

  return data;
}

/**
 * Update or create chat settings (upsert)
 */
export async function upsertChatSettings(
  workspaceId: string,
  updates: Omit<UpdateChatSettingsInput, 'workspace_id'>
): Promise<ChatSettings> {
  const existing = await getChatSettings(workspaceId);

  if (existing) {
    return updateChatSettings(existing.id, updates);
  } else {
    return createChatSettings({
      workspace_id: workspaceId,
      ...updates,
    });
  }
}

/**
 * Toggle auto-create contacts setting
 */
export async function toggleAutoCreateContacts(
  workspaceId: string,
  enabled: boolean
): Promise<ChatSettings> {
  return upsertChatSettings(workspaceId, {
    auto_create_contacts: enabled,
  });
}

/**
 * Toggle notifications setting
 */
export async function toggleNotifications(
  workspaceId: string,
  enabled: boolean
): Promise<ChatSettings> {
  return upsertChatSettings(workspaceId, {
    enable_notifications: enabled,
  });
}

/**
 * Activate/deactivate chat integration
 */
export async function toggleChatActive(
  workspaceId: string,
  isActive: boolean
): Promise<ChatSettings> {
  return upsertChatSettings(workspaceId, {
    is_active: isActive,
  });
}

/**
 * Test connection to Mind2Flow API
 */
export async function testMind2FlowConnection(
  apiEndpoint: string,
  apiKey: string,
  apiSecret: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual Mind2Flow API test endpoint
    const response = await fetch(`${apiEndpoint}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Connection successful',
      };
    } else {
      return {
        success: false,
        message: `Connection failed: ${response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
