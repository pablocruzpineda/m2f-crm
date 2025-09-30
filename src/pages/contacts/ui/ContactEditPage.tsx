import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { ContactForm } from '@/features/contact-form';
import { useContact, useUpdateContact } from '@/entities/contact';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import type { UpdateContactInput } from '@/shared/lib/database/types';

/**
 * Contact Edit Page
 */
export function ContactEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id);
  const updateContact = useUpdateContact();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateContactInput) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateContact.mutateAsync({ id, input: data });
      navigate(`/contacts/${id}`);
    } catch (error) {
      console.error('Failed to update contact:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/contacts/${id}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!contact) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">Contact not found</h2>
          <button
            onClick={() => navigate('/contacts')}
            className="mt-4 text-primary hover:text-primary"
          >
            Back to contacts
          </button>
        </div>
      </PageContainer>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Contact</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update information for {fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <ContactForm
          initialData={contact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageContainer>
  );
}
