import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDeal, useUpdateDeal } from '@/entities/deal';
import { useCurrentWorkspace } from '@/entities/workspace';
import { usePipelineStages } from '@/entities/pipeline-stage';
import { useContacts } from '@/entities/contact';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';
import { Button } from '@/shared/ui/button';
import { DealForm } from '@/features/deal-form';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import type { UpdateDealInput } from '@/shared/lib/database/types';

/**
 * Deal Edit Page - Edit an existing deal
 */
export function DealEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useCurrentWorkspace();
  
  const { data: deal, isLoading: dealLoading } = useDeal(id!);
  const { data: stages, isLoading: stagesLoading } = usePipelineStages(currentWorkspace?.id);
  const { data: contactsData, isLoading: contactsLoading } = useContacts(currentWorkspace?.id);
  const updateDeal = useUpdateDeal(currentWorkspace?.id);

  const isLoading = dealLoading || stagesLoading || contactsLoading;

  const handleSubmit = async (data: UpdateDealInput) => {
    if (!deal) return;

    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        input: data,
      });
      navigate(`/pipeline/${deal.id}`);
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/pipeline/${id}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!deal) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-foreground">Deal not found</h2>
          <p className="mt-2 text-gray-600">The deal you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate('/pipeline')} className="mt-4">
            Back to Pipeline
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Edit Deal"
          description={`Editing "${deal.title}"`}
          actions={
            <Button
              variant="outline"
              onClick={() => navigate(`/pipeline/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />

        <div className="rounded-lg border border bg-card p-6">
          <DealForm
            initialData={{
              title: deal.title,
              stage_id: deal.stage_id,
              primary_contact_id: deal.primary_contact_id,
              value: deal.value,
              currency: deal.currency,
              probability: deal.probability,
              expected_close_date: deal.expected_close_date,
              description: deal.description,
              status: deal.status,
            }}
            stages={stages || []}
            contacts={contactsData?.data || []}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateDeal.isPending}
          />
        </div>
      </div>
    </PageContainer>
  );
}
