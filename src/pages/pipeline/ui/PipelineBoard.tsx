import { useState } from 'react';
import { PipelineStage } from './PipelineStage';
import { useUpdateDealStage } from '@/entities/deal';
import type { PipelineStage as PipelineStageType, DealWithRelations } from '@/shared/lib/database/types';

interface PipelineBoardProps {
  stages: PipelineStageType[];
  dealsByStage: Record<string, DealWithRelations[]>;
  workspaceId: string;
}

/**
 * Kanban board for pipeline management with drag-and-drop
 */
export function PipelineBoard({ stages, dealsByStage, workspaceId }: PipelineBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<DealWithRelations | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const updateDealStage = useUpdateDealStage(workspaceId);

  const handleDragStart = (deal: DealWithRelations) => {
    setDraggedDeal(deal);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (stageId: string) => {
    setDragOverStage(stageId);
  };

  const handleDrop = async (stageId: string) => {
    if (!draggedDeal || draggedDeal.stage_id === stageId) {
      handleDragEnd();
      return;
    }

    // Calculate new position (add to end of stage)
    const dealsInStage = dealsByStage[stageId] || [];
    const newPosition = dealsInStage.length;

    try {
      await updateDealStage.mutateAsync({
        dealId: draggedDeal.id,
        stageId,
        position: newPosition,
      });
    } catch (error) {
      console.error('Failed to update deal stage:', error);
    } finally {
      handleDragEnd();
    }
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 pb-4 min-h-0">
        {stages.map((stage) => (
          <PipelineStage
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            workspaceId={workspaceId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={() => handleDragOver(stage.id)}
            onDrop={() => handleDrop(stage.id)}
            isDraggedOver={dragOverStage === stage.id}
          />
        ))}
      </div>
    </div>
  );
}
