/**
 * @module entities/sub-account/api
 * @description Sub-account management API functions
 */

import { supabase } from '@/shared/lib/supabase/client';

export interface SubAccount {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    parent_workspace_id: string | null;
    custom_domain: string | null;
    theme_config: Record<string, unknown> | null;
    logo_url: string | null;
    logo_storage_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubAccountWithDetails extends SubAccount {
    admin_email?: string;
    admin_name?: string;
    member_count?: number;
}

export interface CreateSubAccountInput {
    master_workspace_id: string;
    name: string;
    slug: string;
    admin_user_id: string;
    custom_domain?: string | null;
}

/**
 * Get all sub-accounts for a master workspace
 */
export async function getSubAccounts(
    masterWorkspaceId: string
): Promise<SubAccountWithDetails[]> {
    const { data, error } = await supabase.rpc('get_sub_accounts', {
        p_master_workspace_id: masterWorkspaceId,
    });

    if (error) {
        console.error('Error fetching sub-accounts:', error);
        throw new Error(`Failed to fetch sub-accounts: ${error.message}`);
    }

    // Map the RPC response to SubAccountWithDetails
    return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        owner_id: item.owner_id,
        parent_workspace_id: masterWorkspaceId,
        custom_domain: (item as { custom_domain?: string }).custom_domain || null,
        theme_config: null,
        logo_url: null,
        logo_storage_path: null,
        created_at: item.created_at,
        updated_at: item.created_at,
        admin_email: item.admin_email,
        admin_name: item.admin_name,
        member_count: item.member_count,
    }));
}

/**
 * Create a new sub-account workspace
 */
export async function createSubAccount(
    input: CreateSubAccountInput
): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: subAccountId, error } = await supabase.rpc(
        'create_sub_account_workspace',
        {
            p_master_workspace_id: input.master_workspace_id,
            p_sub_account_name: input.name,
            p_sub_account_slug: input.slug,
            p_admin_user_id: input.admin_user_id,
            p_master_owner_id: user.id,
        }
    );

    if (error) {
        console.error('Error creating sub-account:', error);
        throw new Error(`Failed to create sub-account: ${error.message}`);
    }

    // Set custom domain if provided
    if (input.custom_domain && input.custom_domain.trim()) {
        const { error: domainError } = await supabase
            .from('workspaces')
            .update({ custom_domain: input.custom_domain.trim() })
            .eq('id', subAccountId);

        if (domainError) {
            console.error('Error setting custom domain:', domainError);
            // Don't throw - workspace is created, domain can be set later
        }
    }

    // Log activity
    await supabase.from('activity_log').insert({
        workspace_id: input.master_workspace_id,
        user_id: user.id,
        action: 'created',
        entity_type: 'sub_account',
        entity_id: subAccountId,
        details: {
            sub_account_name: input.name,
            admin_user_id: input.admin_user_id,
            custom_domain: input.custom_domain || null,
        },
    });

    return subAccountId;
}

/**
 * Delete a sub-account workspace
 */
export async function deleteSubAccount(subAccountId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get sub-account details before deletion for activity log
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('name, parent_workspace_id')
        .eq('id', subAccountId)
        .single();

    // Delete the workspace (CASCADE will handle members and data)
    const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', subAccountId);

    if (error) {
        console.error('Error deleting sub-account:', error);
        throw new Error(`Failed to delete sub-account: ${error.message}`);
    }

    // Log activity
    if (workspace?.parent_workspace_id) {
        await supabase.from('activity_log').insert({
            workspace_id: workspace.parent_workspace_id,
            user_id: user.id,
            action: 'deleted',
            entity_type: 'sub_account',
            entity_id: subAccountId,
            details: {
                sub_account_name: workspace.name,
            },
        });
    }
}

/**
 * Get master workspace for current user
 */
export async function getMasterWorkspace(): Promise<{
    workspace_id: string;
    workspace_name: string;
    is_owner: boolean;
} | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.rpc('get_master_workspace_for_user', {
        p_user_id: user.id,
    });

    if (error) {
        console.error('Error fetching master workspace:', error);
        return null;
    }

    return data && data.length > 0 ? (data[0] || null) : null;
}

/**
 * Check if workspace is a sub-account
 */
export async function isSubAccountWorkspace(
    workspaceId: string
): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_sub_account_workspace', {
        p_workspace_id: workspaceId,
    });

    if (error) {
        console.error('Error checking sub-account status:', error);
        return false;
    }

    return data || false;
}

/**
 * Get workspace hierarchy (parent and children)
 */
export async function getWorkspaceHierarchy(workspaceId: string): Promise<{
    current: SubAccount;
    parent?: SubAccount;
    children: SubAccountWithDetails[];
}> {
    // Get current workspace
    const { data: current, error: currentError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

    if (currentError) {
        throw new Error(`Failed to fetch workspace: ${currentError.message}`);
    }

    let parent = undefined;
    let children: SubAccountWithDetails[] = [];

    // If current workspace has a parent, fetch it
    if (current.parent_workspace_id) {
        const { data: parentData } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', current.parent_workspace_id)
            .single();

        parent = parentData as SubAccount | undefined;
    }

    // If current workspace is a master (no parent), fetch its children
    if (!current.parent_workspace_id) {
        children = await getSubAccounts(workspaceId);
    }

    return {
        current: current as SubAccount,
        parent,
        children
    };
}

/**
 * Get workspace by hostname (custom domain)
 * Used for domain-based routing
 */
export async function getWorkspaceByHostname(hostname: string): Promise<SubAccount | null> {
    const { data, error } = await supabase.rpc('get_workspace_by_hostname', {
        p_hostname: hostname,
    });

    if (error) {
        console.error('Error fetching workspace by hostname:', error);
        return null;
    }

    return data && data.length > 0 ? (data[0] as SubAccount) : null;
}

/**
 * Get workspace by slug (for subdomain routing)
 * Used when custom_domain is not set
 */
export async function getWorkspaceBySlug(slug: string): Promise<SubAccount | null> {
    const { data, error } = await supabase.rpc('get_workspace_by_slug', {
        p_slug: slug,
    });

    if (error) {
        console.error('Error fetching workspace by slug:', error);
        return null;
    }

    return data && data.length > 0 ? (data[0] as SubAccount) : null;
}

/**
 * Update custom domain for a workspace
 */
export async function updateCustomDomain(
    workspaceId: string,
    customDomain: string | null
): Promise<void> {
    const { error } = await supabase
        .from('workspaces')
        .update({ custom_domain: customDomain })
        .eq('id', workspaceId);

    if (error) {
        console.error('Error updating custom domain:', error);
        throw new Error(`Failed to update custom domain: ${error.message}`);
    }

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('activity_log').insert({
            workspace_id: workspaceId,
            user_id: user.id,
            action: 'updated',
            entity_type: 'workspace',
            entity_id: workspaceId,
            details: {
                custom_domain: customDomain,
            },
        });
    }
}
