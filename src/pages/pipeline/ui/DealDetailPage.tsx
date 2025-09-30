import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, DollarSign, Calendar, TrendingUp, User, Building2 } from 'lucide-react';
import { useDeal, useDeleteDeal } from '@/entities/deal';
import { useCurrentWorkspace } from '@/entities/workspace';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

// Helper function to format dates
const formatDate = (date: string | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Deal Detail Page - View full deal information
 */
export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: deal, isLoading } = useDeal(id!);
  const deleteDeal = useDeleteDeal(currentWorkspace?.id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deal) return;

    try {
      await deleteDeal.mutateAsync(deal.id);
      setShowDeleteDialog(false);
      navigate('/pipeline');
    } catch (error) {
      console.error('Failed to delete deal:', error);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!deal) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-foreground">Deal not found</h2>
          <p className="mt-2 text-gray-600">The deal you're looking for doesn't exist.</p>
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
        {/* Header */}
        <PageHeader
          title={deal.title}
          description={`Deal in ${deal.stage?.name || 'Unknown Stage'}`}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/pipeline')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/pipeline/${deal.id}/edit`)}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={deleteDeal.isPending}
              >
                <Trash2 className="h-4 w-4" />
                {deleteDeal.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Deal Information Card */}
            <div className="rounded-lg border border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Deal Information</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Value */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    <span>Value</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {deal.currency} {Number(deal.value || 0).toLocaleString()}
                  </p>
                </div>

                {/* Probability */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>Probability</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {deal.probability}%
                  </p>
                </div>

                {/* Expected Close Date */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Expected Close</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {deal.expected_close_date ? formatDate(deal.expected_close_date) : 'Not set'}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Status</span>
                  </div>
                  <p className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      deal.status === 'won' ? 'bg-green-100 text-green-800' :
                      deal.status === 'lost' ? 'bg-red-100 text-red-800' :
                      deal.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {deal.status?.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {deal.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="mt-2 text-gray-600 whitespace-pre-wrap">{deal.description}</p>
                </div>
              )}
            </div>

            {/* Activities Timeline */}
            <div className="rounded-lg border border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Activity Timeline</h3>
              
              {deal.activities && deal.activities.length > 0 ? (
                <div className="space-y-4">
                  {deal.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title || activity.activity_type}
                        </p>
                        {activity.description && (
                          <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activities yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pipeline Stage */}
            <div className="rounded-lg border border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Pipeline Stage</h3>
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: deal.stage?.color || '#3b82f6' }}
                />
                <span className="text-sm font-medium text-foreground">
                  {deal.stage?.name || 'Unknown'}
                </span>
              </div>
              {deal.stage?.description && (
                <p className="mt-2 text-sm text-gray-600">{deal.stage.description}</p>
              )}
            </div>

            {/* Primary Contact */}
            {deal.primary_contact && (
              <div className="rounded-lg border border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Primary Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-foreground">
                      {deal.primary_contact.first_name} {deal.primary_contact.last_name}
                    </span>
                  </div>
                  {deal.primary_contact.email && (
                    <p className="text-sm text-gray-600">{deal.primary_contact.email}</p>
                  )}
                  {deal.primary_contact.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{deal.primary_contact.company}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Contacts */}
            {deal.contacts && deal.contacts.length > 0 && (
              <div className="rounded-lg border border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Additional Contacts ({deal.contacts.length})
                </h3>
                <div className="space-y-3">
                  {deal.contacts.map((contact) => (
                    <div key={contact.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-foreground">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.role && (
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      )}
                      {contact.email && (
                        <p className="text-xs text-gray-600 mt-1">{contact.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-lg border border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-foreground">{formatDate(deal.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-foreground">{formatDate(deal.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Deal"
          description={`Are you sure you want to delete "${deal.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          isLoading={deleteDeal.isPending}
        />
      </div>
    </PageContainer>
  );
}
