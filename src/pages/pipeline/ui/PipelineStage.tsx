import { DealCard } from './DealCard';
import type { PipelineStage as PipelineStageType, DealWithRelations } from '@/shared/lib/database/types';

interface PipelineStageProps {
  stage: PipelineStageType;
  deals: DealWithRelations[];
  workspaceId: string;
  onDragStart: (deal: DealWithRelations) => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDraggedOver: boolean;
}

/**
 * A single pipeline stage column with drag-and-drop support
 */
export function PipelineStage({ 
  stage, 
  deals, 
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  onDrop,
  isDraggedOver 
}: PipelineStageProps) {
  // Calculate total value in this stage
  const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <div 
      className={`flex w-80 flex-shrink-0 flex-col rounded-lg transition-colors ${
        isDraggedOver ? 'bg-primary/5 ring-2 ring-primary/50' : 'bg-muted/50'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Stage Header */}
      <div className="sticky top-0 z-10 rounded-t-lg bg-card p-4 border-b border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: stage.color || '#3b82f6' }}
            />
            <h3 className="font-semibold text-foreground">{stage.name}</h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {deals.length}
            </span>
          </div>
        </div>
        {totalValue > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            ${totalValue.toLocaleString()}
          </p>
        )}
      </div>

      {/* Deals List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {deals.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No deals in this stage
          </p>
        ) : (
          deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              deal={deal} 
              onDragStart={() => onDragStart(deal)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
