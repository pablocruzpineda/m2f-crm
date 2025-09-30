import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { DealForm } from '@/features/deal-form';
import { useCreateDeal } from '@/entities/deal';
import { usePipelineStages } from '@/entities/pipeline-stage';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import type { CreateDealInput } from '@/shared/lib/database/types';

/**
 * Deal creation page
 */
export function DealCreatePage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useCurrentWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDeal = useCreateDeal(currentWorkspace?.id);
  const { data: stages, isLoading: stagesLoading } = usePipelineStages(currentWorkspace?.id);
  const { data: contactsData, isLoading: contactsLoading } = useContacts(currentWorkspace?.id, { limit: 100 });

  const handleSubmit = async (data: CreateDealInput) => {
    setIsSubmitting(true);
    try {
      await createDeal.mutateAsync(data);
      navigate('/pipeline');
    } catch (error) {
      console.error('Failed to create deal:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/pipeline');
  };

  if (stagesLoading || contactsLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Deal</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new opportunity to your pipeline
            </p>
          </div>
        </div>

        {/* Form */}
        <DealForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          stages={stages || []}
          contacts={contactsData?.data || []}
        />
      </div>
    </PageContainer>
  );
}
