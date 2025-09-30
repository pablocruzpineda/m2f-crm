import { supabase } from '@/shared/lib/supabase/client';
import type {
  ContactTag,
  CreateContactTagInput,
  UpdateContactTagInput,
} from '@/shared/lib/database/types';

/**
 * Get all tags for a workspace
 */
export async function getContactTags(workspaceId: string): Promise<ContactTag[]> {
  const { data, error } = await supabase
    .from('contact_tags')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Create a new contact tag
 */
export async function createContactTag(
  input: CreateContactTagInput
): Promise<ContactTag> {
  const { data, error } = await supabase
    .from('contact_tags')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update an existing contact tag
 */
export async function updateContactTag(
  id: string,
  input: UpdateContactTagInput
): Promise<ContactTag> {
  const { data, error } = await supabase
    .from('contact_tags')
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
 * Delete a contact tag
 */
export async function deleteContactTag(id: string): Promise<void> {
  const { error } = await supabase.from('contact_tags').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * Assign a tag to a contact
 */
export async function assignTagToContact(
  contactId: string,
  tagId: string
): Promise<void> {
  const { error } = await supabase
    .from('contact_tag_assignments')
    .insert({ contact_id: contactId, tag_id: tagId });

  if (error) {
    throw error;
  }
}

/**
 * Remove a tag from a contact
 */
export async function unassignTagFromContact(
  contactId: string,
  tagId: string
): Promise<void> {
  const { error } = await supabase
    .from('contact_tag_assignments')
    .delete()
    .eq('contact_id', contactId)
    .eq('tag_id', tagId);

  if (error) {
    throw error;
  }
}
