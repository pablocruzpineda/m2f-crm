import { supabase } from '@/shared/lib/supabase/client';
import type {
  Contact,
  ContactTag,
  ContactWithTags,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
} from '@/shared/lib/database/types';

/**
 * Get all contacts for a workspace with optional filtering
 */
export async function getContacts(
  workspaceId: string,
  filters?: ContactFilters
): Promise<{ data: ContactWithTags[]; count: number }> {
  let query = supabase
    .from('contacts')
    .select(
      `
      *,
      tags:contact_tag_assignments(
        tag:contact_tags(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('workspace_id', workspaceId);

  // Apply search filter
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }

  // Apply status filter
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Apply assignment filter (Phase 5.3)
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'name') {
    query = query.order('first_name', { ascending: sortOrder === 'asc' });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  // Apply pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  // Transform the nested tags structure
  const contactsWithTags: ContactWithTags[] = (data || []).map((contact) => ({
    ...contact,
    tags: Array.isArray(contact.tags)
      ? contact.tags.map((t: { tag: ContactTag }) => t.tag).filter(Boolean)
      : [],
  }));

  return { data: contactsWithTags, count: count || 0 };
}

/**
 * Get a single contact by ID
 */
export async function getContact(id: string): Promise<ContactWithTags> {
  const { data, error } = await supabase
    .from('contacts')
    .select(
      `
      *,
      tags:contact_tag_assignments(
        tag:contact_tags(*)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  // Transform the nested tags structure
  const contactWithTags: ContactWithTags = {
    ...data,
    tags: Array.isArray(data.tags)
      ? data.tags.map((t: { tag: ContactTag }) => t.tag).filter(Boolean)
      : [],
  };

  return contactWithTags;
}

/**
 * Create a new contact
 */
export async function createContact(
  input: CreateContactInput
): Promise<Contact> {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    throw new Error('Not authenticated');
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...input,
      created_by: userId,
      // Auto-assign to creator if not specified
      assigned_to: input.assigned_to || userId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log activity
  await logActivity({
    workspace_id: input.workspace_id,
    user_id: userId,
    action: 'created',
    entity_type: 'contact',
    entity_id: data.id,
    details: {
      name: `${input.first_name} ${input.last_name}`.trim(),
      email: input.email,
      company: input.company,
    },
  });

  return data;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  id: string,
  input: UpdateContactInput
): Promise<Contact> {
  // Get the contact first to access workspace_id
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('workspace_id, first_name, last_name')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('contacts')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log activity
  if (existingContact) {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      await logActivity({
        workspace_id: existingContact.workspace_id,
        user_id: session.session.user.id,
        action: 'updated',
        entity_type: 'contact',
        entity_id: id,
        details: {
          name: `${existingContact.first_name} ${existingContact.last_name}`.trim(),
          updated_fields: Object.keys(input),
        },
      });
    }
  }

  return data;
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  // Get the contact first to log activity
  const { data: contact } = await supabase
    .from('contacts')
    .select('workspace_id, first_name, last_name')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('contacts').delete().eq('id', id);

  if (error) {
    throw error;
  }

  // Log activity
  if (contact) {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      await logActivity({
        workspace_id: contact.workspace_id,
        user_id: session.session.user.id,
        action: 'deleted',
        entity_type: 'contact',
        entity_id: id,
        details: {
          name: `${contact.first_name} ${contact.last_name}`.trim(),
        },
      });
    }
  }
}

/**
 * Search contacts by query string
 */
export async function searchContacts(
  workspaceId: string,
  query: string
): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`
    )
    .limit(10);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Assign a contact to a user
 * Phase 5.3 - Team Collaboration
 */
export async function assignContact(
  contactId: string,
  assignToUserId: string
): Promise<Contact> {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('contacts')
    .update({
      assigned_to: assignToUserId,
      assigned_by: session.session.user.id,
      assigned_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log activity
  await logActivity({
    workspace_id: data.workspace_id,
    user_id: session.session.user.id,
    action: 'assigned',
    entity_type: 'contact',
    entity_id: contactId,
    details: {
      name: `${data.first_name} ${data.last_name}`.trim(),
      assigned_to: assignToUserId,
    },
  });

  return data;
}

/**
 * Bulk assign contacts to a user
 * Phase 5.3 - Team Collaboration
 */
export async function bulkAssignContacts(
  contactIds: string[],
  assignToUserId: string
): Promise<number> {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('contacts')
    .update({
      assigned_to: assignToUserId,
      assigned_by: session.session.user.id,
      assigned_at: new Date().toISOString(),
    })
    .in('id', contactIds);

  if (error) {
    throw error;
  }

  return contactIds.length;
}

/**
 * Log activity to activity_log table
 * Helper function for tracking user actions
 */
async function logActivity(params: {
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      workspace_id: params.workspace_id,
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      details: params.details as never,
    });
  } catch (error) {
    // Don't throw - activity logging is non-critical
    console.error('Failed to log activity:', error);
  }
}
