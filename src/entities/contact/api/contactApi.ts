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

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...input,
      created_by: session.session.user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  id: string,
  input: UpdateContactInput
): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);

  if (error) {
    throw error;
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
