import { useState } from 'react';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useDealsByStage } from '@/entities/deal';
import { usePipelineStages } from '@/entities/pipeline-stage';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { PipelineBoard } from './PipelineBoard';
import { PipelineHeader } from './PipelineHeader';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import type { DealFilters } from '@/shared/lib/database/types';

/**
 * Pipeline Page - Kanban board view of deals
 */
export function PipelinePage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const [filters, setFilters] = useState<Omit<DealFilters, 'stage_id'>>({
    search: '',
    status: 'all',
  });

  const { data: stages, isLoading: stagesLoading } = usePipelineStages(
    currentWorkspace?.id
  );
  const { data: dealsByStage, isLoading: dealsLoading } = useDealsByStage(
    currentWorkspace?.id,
    filters
  );

  const isLoading = stagesLoading || dealsLoading;

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96 w-80 flex-shrink-0" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex h-full flex-col space-y-6">
        <PipelineHeader
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <PipelineBoard
          stages={stages || []}
          dealsByStage={dealsByStage || {}}
          workspaceId={currentWorkspace?.id || ''}
        />
      </div>
    </PageContainer>
  );
}
