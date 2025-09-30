import { supabase } from '@/shared/lib/supabase/client';
import type {
  PipelineStage,
  CreatePipelineStageInput,
  UpdatePipelineStageInput,
} from '@/shared/lib/database/types';

/**
 * Get all pipeline stages for a workspace
 */
export async function getPipelineStages(
  workspaceId: string
): Promise<PipelineStage[]> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('display_order');

  if (error) {
    console.error('Error fetching pipeline stages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single pipeline stage by ID
 */
export async function getPipelineStage(stageId: string): Promise<PipelineStage | null> {
  const { data, error} = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('id', stageId)
    .single();

  if (error) {
    console.error('Error fetching pipeline stage:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new pipeline stage
 */
export async function createPipelineStage(
  workspaceId: string,
  input: CreatePipelineStageInput
): Promise<PipelineStage> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert({
      ...input,
      workspace_id: workspaceId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pipeline stage:', error);
    throw error;
  }

  return data;
}

/**
 * Update a pipeline stage
 */
export async function updatePipelineStage(
  stageId: string,
  input: UpdatePipelineStageInput
): Promise<PipelineStage> {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(input)
    .eq('id', stageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating pipeline stage:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a pipeline stage
 * Note: This will fail if there are deals in this stage (ON DELETE RESTRICT)
 */
export async function deletePipelineStage(stageId: string): Promise<void> {
  const { error } = await supabase
    .from('pipeline_stages')
    .delete()
    .eq('id', stageId);

  if (error) {
    console.error('Error deleting pipeline stage:', error);
    throw error;
  }
}

/**
 * Reorder pipeline stages
 */
export async function reorderPipelineStages(
  stages: Array<{ id: string; display_order: number }>
): Promise<void> {
  const updates = stages.map((stage) =>
    supabase
      .from('pipeline_stages')
      .update({ display_order: stage.display_order })
      .eq('id', stage.id)
  );

  const results = await Promise.all(updates);

  const error = results.find((result) => result.error)?.error;
  if (error) {
    console.error('Error reordering pipeline stages:', error);
    throw error;
  }
}
