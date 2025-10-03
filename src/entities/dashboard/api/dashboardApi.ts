/**
 * @module entities/dashboard/api
 * @description Dashboard statistics API functions
 */

import { supabase } from '@/shared/lib/supabase';

export interface DashboardStats {
    totalContacts: number;
    totalDeals: number;
    totalMessages: number;
    activeTeamMembers: number;
}

/**
 * Get dashboard statistics for a workspace
 */
export async function getDashboardStats(workspaceId: string): Promise<DashboardStats> {
    if (!workspaceId) {
        return {
            totalContacts: 0,
            totalDeals: 0,
            totalMessages: 0,
            activeTeamMembers: 0,
        };
    }

    // Get total contacts
    const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

    // Get total deals
    const { count: totalDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

    // Get total messages
    const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

    // Get active team members
    const { count: activeTeamMembers } = await supabase
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

    return {
        totalContacts: totalContacts || 0,
        totalDeals: totalDeals || 0,
        totalMessages: totalMessages || 0,
        activeTeamMembers: activeTeamMembers || 0,
    };
}
