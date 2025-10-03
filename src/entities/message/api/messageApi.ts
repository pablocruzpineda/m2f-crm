import { supabase } from '@/shared/lib/supabase';
import { getChatSettingsForSending } from '@/entities/chat-settings';
import type {
  Database,
  Message,
  CreateMessageInput,
  MessageWithSender,
  MessageFilters,
} from '@/shared/lib/database/types';

/**
 * Normalize phone number for WhatsApp API
 * Removes carrier codes that WhatsApp adds but the API doesn't expect
 * 
 * @param phone - Phone number from database
 * @returns Normalized phone number for API
 */
function normalizePhoneForWhatsApp(phone: string | null): string {
  if (!phone) return '';

  // Mexican numbers: Remove carrier code '1' after country code
  // WhatsApp format: 5214427817483 (52 + 1 + 10 digits = 13)
  // API format: 524427817483 (52 + 10 digits = 12)
  if (phone.startsWith('521') && phone.length === 13) {
    const normalized = '52' + phone.substring(3);
    console.log(`Normalized MX phone: ${phone} → ${normalized}`);
    return normalized;
  }

  // Add more country-specific rules here as needed:
  // Argentina (54): Similar pattern with '9' after country code
  // if (phone.startsWith('549') && phone.length === 13) {
  //   return '54' + phone.substring(3);
  // }

  // For other countries, return as-is
  return phone;
}

/**
 * Get messages for a specific contact
 */
export async function getContactMessages(
  workspaceId: string,
  contactId: string,
  filters?: MessageFilters
): Promise<MessageWithSender[]> {
  let query = supabase
    .from('messages')
    .select('*, contact:contacts(*)')
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true });

  // Apply filters
  if (filters?.messageType) {
    query = query.eq('message_type', filters.messageType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.search) {
    query = query.ilike('content', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  // Manually fetch sender data based on sender_type
  const messagesWithSender: MessageWithSender[] = await Promise.all(
    (data || []).map(async (msg) => {
      let sender: MessageWithSender['sender'];

      if (msg.sender_type === 'user') {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        sender = profile || msg.contact;
      } else {
        // sender_type is 'contact'
        sender = msg.contact;
      }

      return {
        ...msg,
        sender,
        contact: msg.contact,
      };
    })
  );

  return messagesWithSender;
}

/**
 * Get all messages for workspace (for chat list)
 */
export async function getWorkspaceMessages(
  workspaceId: string,
  filters?: MessageFilters
): Promise<MessageWithSender[]> {
  let query = supabase
    .from('messages')
    .select('*, contact:contacts(*)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.contactId) {
    query = query.eq('contact_id', filters.contactId);
  }

  if (filters?.messageType) {
    query = query.eq('message_type', filters.messageType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.search) {
    query = query.ilike('content', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching workspace messages:', error);
    throw error;
  }

  // Manually fetch sender data
  const messagesWithSender: MessageWithSender[] = await Promise.all(
    (data || []).map(async (msg) => {
      let sender: MessageWithSender['sender'];

      if (msg.sender_type === 'user') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        sender = profile || msg.contact;
      } else {
        sender = msg.contact;
      }

      return {
        ...msg,
        sender,
        contact: msg.contact,
      };
    })
  );

  return messagesWithSender;
}

/**
 * Send a new message
 * Saves to database and sends via WhatsApp API if configured
 */
export async function sendMessage(
  input: CreateMessageInput
): Promise<Message> {
  // 1. Save to database first (we'll update status later)
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      workspace_id: input.workspace_id,
      contact_id: input.contact_id,
      sender_type: input.sender_type,
      sender_id: input.sender_id,
      content: input.content,
      message_type: input.message_type || 'text',
      status: input.status || 'sent', // Use provided status or default to 'sent'
      media_url: input.media_url || null,
      external_id: input.external_id || null,
      metadata: (input.metadata || null) as Database['public']['Tables']['messages']['Insert']['metadata'],
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }

  // 2. Get contact's phone number
  const { data: contact } = await supabase
    .from('contacts')
    .select('phone')
    .eq('id', input.contact_id)
    .single();

  if (!contact?.phone) {
    console.warn('Contact has no phone number, skipping WhatsApp send');
    return message;
  }

  // 3. Get WhatsApp settings (with fallback: personal → workspace)
  try {
    const chatSettings = await getChatSettingsForSending(
      input.workspace_id,
      input.sender_id
    );

    if (!chatSettings?.is_active || !chatSettings?.api_endpoint) {
      console.warn('WhatsApp not configured, message saved to DB only');
      return message;
    }

    // 4. Send via WhatsApp API
    let phoneNumber = contact.phone;

    // Normalize phone number for WhatsApp API
    // Some countries add carrier codes that need to be removed
    phoneNumber = normalizePhoneForWhatsApp(phoneNumber);

    console.log(`Sending WhatsApp message to ${phoneNumber} via ${chatSettings.api_endpoint}`);

    // Build request body with auth credentials to avoid CORS preflight
    const requestBody = {
      phoneNumber,
      message: input.content,
      ...(chatSettings.api_key && { apiKey: chatSettings.api_key }),
      ...(chatSettings.api_secret && { apiSecret: chatSettings.api_secret }),
    };

    console.log('Request URL:', chatSettings.api_endpoint);
    console.log('Request method: POST');
    console.log('Request headers:', { 'Content-Type': 'application/json' });
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Validate API endpoint URL
    try {
      new URL(chatSettings.api_endpoint);
    } catch {
      throw new Error(`Invalid API endpoint URL: ${chatSettings.api_endpoint}`);
    }

    const response = await fetch(chatSettings.api_endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('WhatsApp message sent successfully:', result);

    // 5. Update message with external_id from WhatsApp
    const { data: updatedMessage } = await supabase
      .from('messages')
      .update({
        external_id: result.message_id || result.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', message.id)
      .select()
      .single();

    return updatedMessage || message;

  } catch (error) {
    console.error('Failed to send via WhatsApp:', error);

    // Mark message as failed
    try {
      await supabase
        .from('messages')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);
    } catch (updateError) {
      console.error('Failed to update message status:', updateError);
      // Still return the message even if status update fails
    }

    // Don't throw - message is saved, just not sent
    // This allows the UI to show the message but with 'failed' status
    return message;
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }

  return data;
}

/**
 * Mark all messages from a contact as read
 */
export async function markContactMessagesAsRead(
  workspaceId: string,
  contactId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('contact_id', contactId)
      .eq('sender_type', 'contact') // Only mark contact messages as read
      .neq('status', 'read'); // Only update unread messages

    if (error) {
      console.error('Error marking contact messages as read:', error);
      // Don't throw - just log the error to prevent infinite retries
      return;
    }
  } catch (error) {
    console.error('Failed to mark contact messages as read:', error);
    // Silently fail to prevent loops
    return;
  }
}

/**
 * Get unread message count for a contact
 */
export async function getUnreadCount(
  workspaceId: string,
  contactId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('contact_id', contactId)
    .eq('sender_type', 'contact')
    .neq('status', 'read');

  if (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Get last message for each contact (for chat list)
 */
export async function getContactsLastMessages(
  workspaceId: string
): Promise<Record<string, MessageWithSender>> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, contact:contacts(*)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching last messages:', error);
    throw error;
  }

  // Group by contact_id and get the most recent message
  const lastMessages: Record<string, MessageWithSender> = {};

  // Process in chunks to avoid too many concurrent requests
  for (const msg of data || []) {
    if (!lastMessages[msg.contact_id]) {
      let sender: MessageWithSender['sender'];

      if (msg.sender_type === 'user') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        sender = profile || msg.contact;
      } else {
        sender = msg.contact;
      }

      lastMessages[msg.contact_id] = {
        ...msg,
        sender,
        contact: msg.contact,
      };
    }
  }

  return lastMessages;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Search messages across all contacts
 */
export async function searchMessages(
  workspaceId: string,
  searchTerm: string
): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, contact:contacts(*)')
    .eq('workspace_id', workspaceId)
    .ilike('content', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error searching messages:', error);
    throw error;
  }

  // Manually fetch sender data
  const messagesWithSender: MessageWithSender[] = await Promise.all(
    (data || []).map(async (msg) => {
      let sender: MessageWithSender['sender'];

      if (msg.sender_type === 'user') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        sender = profile || msg.contact;
      } else {
        sender = msg.contact;
      }

      return {
        ...msg,
        sender,
        contact: msg.contact,
      };
    })
  );

  return messagesWithSender;
}
