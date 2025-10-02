import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { BasicInfoSection } from './BasicInfoSection';
import { AddressSection } from './AddressSection';
import { SocialSection } from './SocialSection';
import { AssignmentSection } from './AssignmentSection';
import type { CreateContactInput } from '@/shared/lib/database/types';

interface ContactFormProps {
  initialData?: Partial<CreateContactInput>;
  onSubmit: (data: Omit<CreateContactInput, 'workspace_id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Contact form for creating and editing contacts
 */
export function ContactForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContactFormProps) {
  const [formData, setFormData] = useState<Partial<CreateContactInput>>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    job_title: initialData?.job_title || '',
    status: initialData?.status || 'active',
    source: initialData?.source || '',
    notes: initialData?.notes || '',
    address_line1: initialData?.address_line1 || '',
    address_line2: initialData?.address_line2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || '',
    website: initialData?.website || '',
    linkedin_url: initialData?.linkedin_url || '',
    twitter_url: initialData?.twitter_url || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateContactInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // URL validation (if provided)
    const urlFields: Array<keyof CreateContactInput> = [
      'website',
      'linkedin_url',
      'twitter_url',
    ];
    urlFields.forEach((field) => {
      const value = formData[field];
      if (value && typeof value === 'string' && value.trim()) {
        try {
          new URL(value);
        } catch {
          newErrors[field] = 'Invalid URL format';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData as Omit<CreateContactInput, 'workspace_id'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <BasicInfoSection
        data={formData}
        errors={errors}
        onChange={handleChange}
      />

      {/* Address Information */}
      <AddressSection data={formData} errors={errors} onChange={handleChange} />

      {/* Social Links */}
      <SocialSection data={formData} errors={errors} onChange={handleChange} />

      {/* Assignment */}
      <AssignmentSection data={formData} errors={errors} onChange={handleChange} />

      {/* Notes */}
      <div className="rounded-lg border border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          placeholder="Add any additional notes about this contact..."
          className="block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 rounded-lg border border bg-card p-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg border border bg-card px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}
