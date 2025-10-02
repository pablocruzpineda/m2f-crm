import { supabase } from '@/shared/lib/supabase';
import type {
  ChatSettings,
  CreateChatSettingsInput,
  UpdateChatSettingsInput,
} from '@/shared/lib/database/types';

/**
 * Get workspace default chat settings (user_id = NULL)
 * Phase 5.3 - Team Collaboration
 */
export async function getWorkspaceChatSettings(
  workspaceId: string
): Promise<ChatSettings | null> {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('user_id', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching workspace chat settings:', error);
    throw error;
  }

  return data;
}

/**
 * Get personal chat settings for a user (user_id = specific user)
 * Phase 5.3 - Team Collaboration
 */
export async function getPersonalChatSettings(
  workspaceId: string,
  userId: string
): Promise<ChatSettings | null> {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching personal chat settings:', error);
    throw error;
  }

  return data;
}

/**
 * Get chat settings for sending (with fallback logic)
 * Phase 5.3 - Try personal first, fallback to workspace default
 */
export async function getChatSettingsForSending(
  workspaceId: string,
  userId: string
): Promise<ChatSettings | null> {
  // Try personal settings first
  const personalSettings = await getPersonalChatSettings(workspaceId, userId);
  if (personalSettings?.is_active && personalSettings?.api_endpoint) {
    return personalSettings;
  }

  // Fallback to workspace default
  const workspaceSettings = await getWorkspaceChatSettings(workspaceId);
  if (workspaceSettings?.is_active && workspaceSettings?.api_endpoint) {
    return workspaceSettings;
  }

  return null;
}

/**
 * Get chat settings for a workspace (deprecated - use getWorkspaceChatSettings)
 * @deprecated Use getWorkspaceChatSettings or getPersonalChatSettings instead
 */
export async function getChatSettings(
  workspaceId: string
): Promise<ChatSettings | null> {
  return getWorkspaceChatSettings(workspaceId);
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
 * Update or create workspace chat settings (upsert)
 */
export async function upsertWorkspaceChatSettings(
  workspaceId: string,
  updates: Omit<UpdateChatSettingsInput, 'workspace_id' | 'user_id'>
): Promise<ChatSettings> {
  const existing = await getWorkspaceChatSettings(workspaceId);

  if (existing) {
    return updateChatSettings(existing.id, updates);
  } else {
    return createChatSettings({
      workspace_id: workspaceId,
      user_id: null,
      ...updates,
    });
  }
}

/**
 * Update or create personal chat settings (upsert)
 * Phase 5.3 - Team Collaboration
 */
export async function upsertPersonalChatSettings(
  workspaceId: string,
  userId: string,
  updates: Omit<UpdateChatSettingsInput, 'workspace_id' | 'user_id'>
): Promise<ChatSettings> {
  const existing = await getPersonalChatSettings(workspaceId, userId);

  if (existing) {
    return updateChatSettings(existing.id, updates);
  } else {
    return createChatSettings({
      workspace_id: workspaceId,
      user_id: userId,
      ...updates,
    });
  }
}

/**
 * Update or create chat settings (upsert) - deprecated
 * @deprecated Use upsertWorkspaceChatSettings or upsertPersonalChatSettings
 */
export async function upsertChatSettings(
  workspaceId: string,
  updates: Omit<UpdateChatSettingsInput, 'workspace_id'>
): Promise<ChatSettings> {
  return upsertWorkspaceChatSettings(workspaceId, updates);
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
 * Get team WhatsApp status (for owners/admins)
 * Phase 5.3 - Shows which team members have personal settings
 */
export async function getTeamWhatsAppStatus(workspaceId: string) {
  const { data, error } = await supabase
    .from('chat_settings')
    .select(`
      user_id,
      is_active,
      api_endpoint,
      updated_at,
      profiles:user_id (
        id,
        email,
        full_name
      )
    `)
    .eq('workspace_id', workspaceId)
    .not('user_id', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching team WhatsApp status:', error);
    throw error;
  }

  return data;
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
