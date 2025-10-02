/**
 * Role-based permission utilities
 * Phase 5.3 - Team Collaboration
 */

export type Role = 'owner' | 'admin' | 'member' | 'viewer'

/**
 * Check if role can manage team members (add/remove/change roles)
 */
export function canManageMembers(role: Role): boolean {
    return ['owner', 'admin'].includes(role)
}

/**
 * Check if role can see all data (contacts, deals, etc.)
 */
export function canSeeAllData(role: Role): boolean {
    return ['owner', 'admin'].includes(role)
}

/**
 * Check if role can change theme settings
 */
export function canChangeTheme(role: Role): boolean {
    return role === 'owner'
}

/**
 * Check if role can configure workspace-level WhatsApp settings
 */
export function canConfigureWorkspaceWhatsApp(role: Role): boolean {
    return ['owner', 'admin'].includes(role)
}

/**
 * Check if role can delete entities (contacts, deals, etc.)
 */
export function canDeleteEntity(role: Role): boolean {
    return ['owner', 'admin'].includes(role)
}

/**
 * Check if role can assign items to other team members
 */
export function canAssignToOthers(role: Role): boolean {
    return ['owner', 'admin'].includes(role)
}

/**
 * Check if role can view activity feed
 */
export function canViewActivity(): boolean {
    return true // All roles can view activity
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
    const displayNames: Record<Role, string> = {
        owner: 'Owner',
        admin: 'Admin',
        member: 'Member',
        viewer: 'Viewer',
    }
    return displayNames[role]
}

/**
 * Get role badge variant for UI
 */
export function getRoleBadgeVariant(role: Role): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variants: Record<Role, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        owner: 'default',
        admin: 'secondary',
        member: 'outline',
        viewer: 'outline',
    }
    return variants[role]
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
    const descriptions: Record<Role, string> = {
        owner: 'Full control over workspace, can manage all settings and members',
        admin: 'Can manage members and see all data, limited settings access',
        member: 'Can only see and manage assigned contacts and deals',
        viewer: 'Read-only access to assigned data',
    }
    return descriptions[role]
}
