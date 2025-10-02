/**
 * Activity Log API Functions
 * Phase 5.3 - Step 8
 * 
 * Provides access to the activity_log table for tracking user actions
 * across the workspace.
 */

import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/lib/database/types';

type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type ActivityLogInsert = Database['public']['Tables']['activity_log']['Insert'];

export interface ActivityLogWithUser extends ActivityLog {
    profiles?: {
        id: string;
        email: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface ActivityFilters {
    user_id?: string;
    entity_type?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
}

/**
 * Get activity log entries with filters and pagination
 */
export async function getActivityLog(
    workspaceId: string,
    filters?: ActivityFilters,
    limit: number = 50,
    offset: number = 0
): Promise<{ data: ActivityLogWithUser[]; count: number }> {
    let query = supabase
        .from('activity_log')
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `,
            { count: 'exact' }
        )
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
    }

    if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.action) {
        query = query.eq('action', filters.action);
    }

    if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
    }

    if (filters?.search) {
        query = query.or(
            `entity_type.ilike.%${filters.search}%,action.ilike.%${filters.search}%,details.ilike.%${filters.search}%`
        );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching activity log:', error);
        throw error;
    }

    return {
        data: data as ActivityLogWithUser[],
        count: count || 0,
    };
}

/**
 * Get activity log entry by ID
 */
export async function getActivityLogEntry(
    id: string
): Promise<ActivityLogWithUser | null> {
    const { data, error } = await supabase
        .from('activity_log')
        .select(
            `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `
        )
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching activity log entry:', error);
        throw error;
    }

    return data as ActivityLogWithUser | null;
}

/**
 * Subscribe to real-time activity log updates
 */
export function subscribeToActivityLog(
    workspaceId: string,
    callback: (payload: ActivityLogWithUser) => void
) {
    const subscription = supabase
        .channel(`activity_log:${workspaceId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_log',
                filter: `workspace_id=eq.${workspaceId}`,
            },
            async (payload) => {
                // Fetch the full entry with user profile
                const entry = await getActivityLogEntry(payload.new.id);
                if (entry) {
                    callback(entry);
                }
            }
        )
        .subscribe();

    return subscription;
}

/**
 * Create activity log entry
 * Note: This is typically called automatically by database triggers,
 * but can be used for manual logging if needed.
 */
export async function createActivityLog(
    entry: ActivityLogInsert
): Promise<ActivityLog> {
    const { data, error } = await supabase
        .from('activity_log')
        .insert(entry)
        .select()
        .single();

    if (error) {
        console.error('Error creating activity log entry:', error);
        throw error;
    }

    return data;
}

/**
 * Get unique entity types from activity log
 */
export async function getActivityEntityTypes(
    workspaceId: string
): Promise<string[]> {
    const { data, error } = await supabase
        .from('activity_log')
        .select('entity_type')
        .eq('workspace_id', workspaceId)
        .order('entity_type');

    if (error) {
        console.error('Error fetching entity types:', error);
        throw error;
    }

    // Get unique values
    const uniqueTypes = [...new Set(data.map((row) => row.entity_type))];
    return uniqueTypes;
}

/**
 * Get unique actions from activity log
 */
export async function getActivityActions(
    workspaceId: string
): Promise<string[]> {
    const { data, error } = await supabase
        .from('activity_log')
        .select('action')
        .eq('workspace_id', workspaceId)
        .order('action');

    if (error) {
        console.error('Error fetching actions:', error);
        throw error;
    }

    // Get unique values
    const uniqueActions = [...new Set(data.map((row) => row.action))];
    return uniqueActions;
}
