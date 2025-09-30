/**
 * @module entities/workspace/api
 * @description API functions for workspace operations
 */

import { supabase } from '@/shared/lib/supabase/client.js';
import type { Workspace } from '@/shared/lib/auth/types.js';
import { generateUniqueSlug } from '@/shared/lib/utils/slug.js';

/**
 * Get all workspaces for current user
 * Uses a two-step query to avoid RLS infinite recursion
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  // Step 1: Get workspace IDs where user is a member
  const { data: memberData, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);

  if (memberError) {
    console.error('Error fetching user memberships:', memberError);
    throw memberError;
  }

  if (!memberData || memberData.length === 0) {
    return [];
  }

  const workspaceIds = memberData.map((m) => m.workspace_id);

  // Step 2: Get workspace details by IDs
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user workspaces:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }

  return data;
}

/**
 * Create workspace with owner
 * Uses the database function for atomic creation
 */
export async function createWorkspace(
  name: string,
  userId: string
): Promise<Workspace> {
  // Generate unique slug from workspace name
  const slug = generateUniqueSlug(name);

  const { data, error } = await supabase
    .rpc('create_workspace_with_owner', {
      workspace_name: name,
      workspace_slug: slug,
      user_id: userId,
    });

  if (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }

  // Fetch the created workspace
  const workspace = await getWorkspace(data);
  if (!workspace) {
    throw new Error('Failed to fetch created workspace');
  }

  return workspace;
}

/**
 * Upload workspace logo to Supabase Storage
 */
export async function uploadWorkspaceLogo(
  workspaceId: string,
  file: File
): Promise<{ url: string; path: string }> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${workspaceId}/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('workspace-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading logo:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from('workspace-logos')
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
}

/**
 * Delete workspace logo from storage
 */
export async function deleteWorkspaceLogo(
  workspaceId: string,
  storagePath: string
): Promise<void> {
  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('workspace-logos')
    .remove([storagePath]);

  if (deleteError) {
    console.error('Error deleting logo:', deleteError);
    throw deleteError;
  }

  // Clear logo references in database
  const { error: updateError } = await supabase
    .from('workspaces')
    .update({
      logo_url: null,
      logo_storage_path: null,
    })
    .eq('id', workspaceId);

  if (updateError) {
    console.error('Error updating workspace:', updateError);
    throw updateError;
  }
}

/**
 * Update workspace logo URL in database
 */
export async function updateWorkspaceLogo(
  workspaceId: string,
  logoUrl: string,
  logoPath: string
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      logo_url: logoUrl,
      logo_storage_path: logoPath,
    })
    .eq('id', workspaceId);

  if (error) {
    console.error('Error updating workspace logo:', error);
    throw error;
  }
}

/**
 * Update workspace theme configuration
 */
export async function updateWorkspaceTheme(
  workspaceId: string,
  themeConfig: Record<string, string>
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({ theme_config: themeConfig as never })
    .eq('id', workspaceId);

  if (error) {
    console.error('Error updating workspace theme:', error);
    throw error;
  }
}

/**
 * Update workspace name
 */
export async function updateWorkspaceName(
  workspaceId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({ name })
    .eq('id', workspaceId);

  if (error) {
    console.error('Error updating workspace name:', error);
    throw error;
  }
}
