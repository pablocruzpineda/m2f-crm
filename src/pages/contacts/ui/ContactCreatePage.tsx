import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { ContactForm } from '@/features/contact-form';
import { useCreateContact } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { CreateContactInput } from '@/shared/lib/database/types';

/**
 * Contact Create Page
 */
export function ContactCreatePage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useCurrentWorkspace();
  const createContact = useCreateContact();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<CreateContactInput, 'workspace_id'>) => {
    if (!currentWorkspace?.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createContact.mutateAsync({
        ...data,
        workspace_id: currentWorkspace.id,
      });
      navigate('/contacts');
    } catch (error) {
      console.error('Failed to create contact:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

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
              <h1 className="text-2xl font-bold text-foreground">Add New Contact</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new contact in your CRM
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <ContactForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageContainer>
  );
}
