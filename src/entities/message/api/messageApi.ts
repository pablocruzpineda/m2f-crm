import { supabase } from '@/shared/lib/supabase';
import type {
  Database,
  Message,
  CreateMessageInput,
  MessageWithSender,
  MessageFilters,
} from '@/shared/lib/database/types';

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
 */
export async function sendMessage(
  input: CreateMessageInput
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      workspace_id: input.workspace_id,
      contact_id: input.contact_id,
      sender_type: input.sender_type,
      sender_id: input.sender_id,
      content: input.content,
      message_type: input.message_type || 'text',
      status: input.status || 'sent',
      media_url: input.media_url || null,
      external_id: input.external_id || null,
      metadata: (input.metadata || null) as Database['public']['Tables']['messages']['Insert']['metadata'],
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
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
    throw error;
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
