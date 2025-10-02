import { supabase } from '@/shared/lib/supabase/client';
import type {
  Deal,
  DealWithRelations,
  CreateDealInput,
  UpdateDealInput,
  DealFilters,
} from '@/shared/lib/database/types';

/**
 * Get all deals for a workspace with filters
 */
export async function getDeals(
  workspaceId: string,
  filters: DealFilters = {}
): Promise<{ data: DealWithRelations[]; count: number }> {
  const {
    search,
    stage_id,
    status,
    owner_id,
    assigned_to,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  let query = supabase
    .from('deals')
    .select(
      `
      *,
      stage:pipeline_stages(*),
      primary_contact:contacts!primary_contact_id(*),
      contacts:deal_contacts(
        contact:contacts(*),
        role,
        is_primary
      )
    `,
      { count: 'exact' }
    )
    .eq('workspace_id', workspaceId);

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (stage_id) {
    query = query.eq('stage_id', stage_id);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (owner_id) {
    query = query.eq('owner_id', owner_id);
  }

  // Phase 5.3 - Assignment filter
  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to);
  }

  // Sorting
  const sortColumn = sortBy === 'title' ? 'title' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }

  // Transform the data to include contacts array
  const transformedData: DealWithRelations[] = (data || []).map((deal) => ({
    ...deal,
    contacts: deal.contacts?.map((dc) => ({
      ...dc.contact,
      role: dc.role || undefined,
    })),
  }));

  return { data: transformedData, count: count || 0 };
}

/**
 * Get deals grouped by pipeline stage (for Kanban board)
 */
export async function getDealsByStage(
  workspaceId: string,
  filters: Omit<DealFilters, 'stage_id'> = {}
): Promise<Record<string, DealWithRelations[]>> {
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('workspace_id', workspaceId)
    .order('display_order');

  if (!stages) return {};

  const { search, status, owner_id } = filters;

  let query = supabase
    .from('deals')
    .select(
      `
      *,
      stage:pipeline_stages(*),
      primary_contact:contacts!primary_contact_id(id, first_name, last_name, email, company)
    `
    )
    .eq('workspace_id', workspaceId)
    .order('position');

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (owner_id) {
    query = query.eq('owner_id', owner_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals by stage:', error);
    throw error;
  }

  // Group deals by stage
  const dealsByStage: Record<string, DealWithRelations[]> = {};

  stages.forEach((stage) => {
    dealsByStage[stage.id] = [];
  });

  (data || []).forEach((deal) => {
    const stageDeals = dealsByStage[deal.stage_id];
    if (stageDeals) {
      stageDeals.push(deal as DealWithRelations);
    }
  });

  return dealsByStage;
}

/**
 * Get a single deal by ID
 */
export async function getDeal(dealId: string): Promise<DealWithRelations | null> {
  const { data, error } = await supabase
    .from('deals')
    .select(
      `
      *,
      stage:pipeline_stages(*),
      primary_contact:contacts!primary_contact_id(*),
      contacts:deal_contacts(
        contact:contacts(*),
        role,
        is_primary
      ),
      activities:deal_activities(
        *,
        created_by_profile:profiles(id, full_name, email)
      )
    `
    )
    .eq('id', dealId)
    .single();

  if (error) {
    console.error('Error fetching deal:', error);
    throw error;
  }

  // Transform contacts
  const transformedDeal: DealWithRelations = {
    ...data,
    contacts: data.contacts?.map((dc) => ({
      ...dc.contact,
      role: dc.role || undefined,
    })),
    activities: data.activities || [],
  };

  return transformedDeal;
}

/**
 * Create a new deal
 */
export async function createDeal(
  workspaceId: string,
  input: CreateDealInput
): Promise<Deal> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  const { data, error } = await supabase
    .from('deals')
    .insert({
      ...input,
      workspace_id: workspaceId,
      created_by: userId,
      // Auto-assign to creator if not specified
      assigned_to: input.assigned_to || userId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating deal:', error);
    throw error;
  }

  // Create internal deal activity (for deal history)
  if (data) {
    await supabase.from('deal_activities').insert({
      deal_id: data.id,
      workspace_id: workspaceId,
      activity_type: 'created',
      title: 'Deal created',
      description: `Deal "${data.title}" was created`,
      created_by: userId,
    });

    // Log to main activity feed
    if (userId) {
      await logActivity({
        workspace_id: workspaceId,
        user_id: userId,
        action: 'created',
        entity_type: 'deal',
        entity_id: data.id,
        details: {
          title: data.title,
          value: data.value,
          stage_id: data.stage_id,
        },
      });
    }
  }

  return data;
}

/**
 * Update a deal
 */
export async function updateDeal(
  dealId: string,
  input: UpdateDealInput
): Promise<Deal> {
  // Get existing deal for activity logging
  const { data: existingDeal } = await supabase
    .from('deals')
    .select('workspace_id, title, status')
    .eq('id', dealId)
    .single();

  const { data, error } = await supabase
    .from('deals')
    .update(input)
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deal:', error);
    throw error;
  }

  // Log activity
  if (existingDeal && data) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (userId) {
      // Check if status changed
      const statusChanged = input.status && input.status !== existingDeal.status;

      await logActivity({
        workspace_id: existingDeal.workspace_id,
        user_id: userId,
        action: statusChanged ? 'status_changed' : 'updated',
        entity_type: 'deal',
        entity_id: dealId,
        details: {
          title: existingDeal.title,
          updated_fields: Object.keys(input),
          ...(statusChanged && {
            old_status: existingDeal.status,
            new_status: input.status,
          }),
        },
      });
    }
  }

  return data;
}

/**
 * Update deal stage (for drag-and-drop)
 */
export async function updateDealStage(
  dealId: string,
  stageId: string,
  position: number
): Promise<Deal> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  // Get current deal to check stage change
  const { data: currentDeal } = await supabase
    .from('deals')
    .select('stage_id, workspace_id, title')
    .eq('id', dealId)
    .single();

  const { data, error } = await supabase
    .from('deals')
    .update({
      stage_id: stageId,
      position,
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }

  // Log activity if stage changed
  if (currentDeal && currentDeal.stage_id !== stageId) {
    // Internal deal activity
    await supabase.from('deal_activities').insert({
      deal_id: dealId,
      workspace_id: currentDeal.workspace_id,
      activity_type: 'stage_changed',
      title: 'Stage changed',
      description: `Deal moved to a new stage`,
      old_value: { stage_id: currentDeal.stage_id },
      new_value: { stage_id: stageId },
      created_by: userId,
    });

    // Main activity feed - log stage change
    if (userId) {
      await logActivity({
        workspace_id: currentDeal.workspace_id,
        user_id: userId,
        action: 'status_changed',
        entity_type: 'deal',
        entity_id: dealId,
        details: {
          title: currentDeal.title,
          change_type: 'stage',
          old_stage_id: currentDeal.stage_id,
          new_stage_id: stageId,
        },
      });
    }
  }

  return data;
}

/**
 * Delete a deal
 */
export async function deleteDeal(dealId: string): Promise<void> {
  // Get deal info before deletion
  const { data: deal } = await supabase
    .from('deals')
    .select('workspace_id, title, value')
    .eq('id', dealId)
    .single();

  const { error } = await supabase.from('deals').delete().eq('id', dealId);

  if (error) {
    console.error('Error deleting deal:', error);
    throw error;
  }

  // Log activity
  if (deal) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;

    if (userId) {
      await logActivity({
        workspace_id: deal.workspace_id,
        user_id: userId,
        action: 'deleted',
        entity_type: 'deal',
        entity_id: dealId,
        details: {
          title: deal.title,
          value: deal.value,
        },
      });
    }
  }
}

/**
 * Add a contact to a deal
 */
export async function addContactToDeal(
  dealId: string,
  contactId: string,
  role?: string,
  isPrimary = false
): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  const { error } = await supabase.from('deal_contacts').insert({
    deal_id: dealId,
    contact_id: contactId,
    role,
    is_primary: isPrimary,
    added_by: userId,
  });

  if (error) {
    console.error('Error adding contact to deal:', error);
    throw error;
  }

  // Log activity
  const { data: deal } = await supabase
    .from('deals')
    .select('workspace_id')
    .eq('id', dealId)
    .single();

  if (deal) {
    await supabase.from('deal_activities').insert({
      deal_id: dealId,
      workspace_id: deal.workspace_id,
      activity_type: 'contact_added',
      title: 'Contact added',
      description: `Contact added to deal`,
      new_value: { contact_id: contactId, role },
      created_by: userId,
    });
  }
}

/**
 * Remove a contact from a deal
 */
export async function removeContactFromDeal(
  dealId: string,
  contactId: string
): Promise<void> {
  const { error } = await supabase
    .from('deal_contacts')
    .delete()
    .match({ deal_id: dealId, contact_id: contactId });

  if (error) {
    console.error('Error removing contact from deal:', error);
    throw error;
  }
}

/**
 * Add a note/activity to a deal
 */
export async function addDealNote(
  dealId: string,
  workspaceId: string,
  note: string
): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  const { error } = await supabase.from('deal_activities').insert({
    deal_id: dealId,
    workspace_id: workspaceId,
    activity_type: 'note_added',
    title: 'Note added',
    description: note,
    created_by: userId,
  });

  if (error) {
    console.error('Error adding deal note:', error);
    throw error;
  }
}

/**
 * Assign a deal to a team member
 */
export async function assignDeal(
  dealId: string,
  assignToUserId: string
): Promise<Deal> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  const { data, error } = await supabase
    .from('deals')
    .update({
      assigned_to: assignToUserId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning deal:', error);
    throw error;
  }

  // Log activity
  if (userId) {
    await logActivity({
      workspace_id: data.workspace_id,
      user_id: userId,
      action: 'assigned',
      entity_type: 'deal',
      entity_id: dealId,
      details: {
        title: data.title,
        assigned_to: assignToUserId,
      },
    });
  }

  return data;
}

/**
 * Bulk assign multiple deals to a team member
 */
export async function bulkAssignDeals(
  dealIds: string[],
  assignToUserId: string
): Promise<number> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  const { error } = await supabase
    .from('deals')
    .update({
      assigned_to: assignToUserId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
    })
    .in('id', dealIds);

  if (error) {
    console.error('Error bulk assigning deals:', error);
    throw error;
  }

  return dealIds.length;
}

/**
 * Log activity to activity_log table
 * Helper function for tracking user actions on deals
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
