/**
 * Team member management API
 * Phase 5.3 - Team Collaboration
 */

import { supabase } from '@/shared/lib/supabase/client'
import type { Role } from '@/shared/lib/permissions'
import type { Json } from '@/shared/lib/database/types'

export interface TeamMember {
    id: string
    email: string
    full_name?: string
    role: Role
    joined_at: string
}

export interface AddTeamMemberParams {
    workspaceId: string
    email: string
    role: Role
}

export interface UpdateMemberRoleParams {
    workspaceId: string
    userId: string
    newRole: Role
}

export interface RemoveTeamMemberParams {
    workspaceId: string
    userId: string
}

/**
 * Get all team members for a workspace
 */
export async function getTeamMembers(workspaceId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
        .from('workspace_members')
        .select(`
      user_id,
      role,
      joined_at,
      profiles:user_id (
        email,
        full_name
      )
    `)
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true })

    if (error) throw error

    return (data || []).map((m) => ({
        id: m.user_id,
        email: m.profiles?.email || 'Unknown',
        full_name: m.profiles?.full_name || undefined,
        role: m.role as Role,
        joined_at: m.joined_at,
    }))
}

/**
 * Add a new team member to the workspace
 */
export async function addTeamMember(params: AddTeamMemberParams): Promise<void> {
    const { workspaceId, email, role } = params

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (userError || !user) {
        throw new Error('User not found. They must register first before being added to the workspace.')
    }

    // 2. Check if already a member
    const { data: existing } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        throw new Error('User is already a member of this workspace')
    }

    // 3. Add to workspace
    const { error } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            role: role,
        })

    if (error) throw error

    // 4. Log activity
    await logActivity({
        workspace_id: workspaceId,
        action: 'member_added',
        entity_type: 'member',
        entity_id: user.id,
        details: { email, role },
    })
}

/**
 * Remove a team member from the workspace
 */
export async function removeTeamMember(params: RemoveTeamMemberParams): Promise<void> {
    const { workspaceId, userId } = params

    // 1. Get workspace owner
    const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (workspaceError || !workspace) {
        throw new Error('Workspace not found')
    }

    // Prevent removing the owner
    if (workspace.owner_id === userId) {
        throw new Error('Cannot remove the workspace owner')
    }

    // 2. Get current user ID for logging
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')

    // 3. Reassign contacts to owner
    const { error: contactsError } = await supabase
        .from('contacts')
        .update({
            assigned_to: workspace.owner_id,
            assigned_by: currentUser.id,
            assigned_at: new Date().toISOString(),
        })
        .eq('workspace_id', workspaceId)
        .eq('assigned_to', userId)

    if (contactsError) throw contactsError

    // 4. Reassign deals to owner
    const { error: dealsError } = await supabase
        .from('deals')
        .update({
            assigned_to: workspace.owner_id,
            assigned_by: currentUser.id,
            assigned_at: new Date().toISOString(),
        })
        .eq('workspace_id', workspaceId)
        .eq('assigned_to', userId)

    if (dealsError) throw dealsError

    // 5. Remove member
    const { error: removeError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)

    if (removeError) throw removeError

    // 6. Log activity
    await logActivity({
        workspace_id: workspaceId,
        action: 'member_removed',
        entity_type: 'member',
        entity_id: userId,
        details: { reassigned_to: workspace.owner_id },
    })
}

/**
 * Update a team member's role
 */
export async function updateMemberRole(params: UpdateMemberRoleParams): Promise<void> {
    const { workspaceId, userId, newRole } = params

    // Prevent changing owner role
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (workspace?.owner_id === userId && newRole !== 'owner') {
        throw new Error('Cannot change the workspace owner\'s role. Transfer ownership first.')
    }

    const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)

    if (error) throw error

    // Log activity
    await logActivity({
        workspace_id: workspaceId,
        action: 'role_changed',
        entity_type: 'member',
        entity_id: userId,
        details: { new_role: newRole },
    })
}

/**
 * Log activity to activity_log table
 */
async function logActivity(params: {
    workspace_id: string
    action: string
    entity_type: string
    entity_id?: string
    details?: Record<string, unknown>
}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('activity_log').insert({
        workspace_id: params.workspace_id,
        user_id: user.id,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        details: (params.details || {}) as unknown as Json,
    })
}
