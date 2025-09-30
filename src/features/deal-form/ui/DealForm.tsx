import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { CreateDealInput } from '@/shared/lib/database/types';

interface DealFormProps {
  initialData?: Partial<CreateDealInput>;
  onSubmit: (data: CreateDealInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  stages: Array<{ id: string; name: string }>;
  contacts?: Array<{ id: string; first_name: string; last_name: string | null }>;
}

/**
 * Deal form for creating and editing deals
 */
export function DealForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  stages,
  contacts = [],
}: DealFormProps) {
  const [formData, setFormData] = useState<Partial<CreateDealInput>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    value: initialData?.value || 0,
    currency: initialData?.currency || 'USD',
    probability: initialData?.probability || 0,
    expected_close_date: initialData?.expected_close_date || undefined,
    status: initialData?.status || 'open',
    stage_id: initialData?.stage_id || (stages[0]?.id || ''),
    primary_contact_id: initialData?.primary_contact_id || undefined,
    source: initialData?.source || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateDealInput, value: string | number | null | undefined) => {
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
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.stage_id) {
      newErrors.stage_id = 'Stage is required';
    }

    // Value validation
    if (formData.value && Number(formData.value) < 0) {
      newErrors.value = 'Value must be positive';
    }

    // Probability validation
    if (
      formData.probability !== undefined &&
      formData.probability !== null &&
      (formData.probability < 0 || formData.probability > 100)
    ) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData as CreateDealInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-lg border border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Deal Information</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border focus:border-primary focus:ring-primary'
              }`}
              placeholder="e.g., Enterprise Software Deal"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Deal details and notes..."
            />
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="stage_id" className="block text-sm font-medium text-gray-700">
              Stage *
            </label>
            <select
              id="stage_id"
              value={formData.stage_id || ''}
              onChange={(e) => handleChange('stage_id', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.stage_id
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border focus:border-primary focus:ring-primary'
              }`}
            >
              <option value="">Select a stage</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            {errors.stage_id && <p className="mt-1 text-sm text-red-600">{errors.stage_id}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={formData.status || 'open'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              type="number"
              id="value"
              value={formData.value || ''}
              onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.value
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border focus:border-primary focus:ring-primary'
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>

          {/* Probability */}
          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700">
              Probability (%)
            </label>
            <input
              type="number"
              id="probability"
              value={formData.probability || ''}
              onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.probability
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border focus:border-primary focus:ring-primary'
              }`}
              placeholder="0"
              min="0"
              max="100"
            />
            {errors.probability && <p className="mt-1 text-sm text-red-600">{errors.probability}</p>}
          </div>

          {/* Expected Close Date */}
          <div>
            <label htmlFor="expected_close_date" className="block text-sm font-medium text-gray-700">
              Expected Close Date
            </label>
            <input
              type="date"
              id="expected_close_date"
              value={formData.expected_close_date || ''}
              onChange={(e) => handleChange('expected_close_date', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          {/* Primary Contact */}
          {contacts.length > 0 && (
            <div className="sm:col-span-2">
              <label htmlFor="primary_contact_id" className="block text-sm font-medium text-gray-700">
                Primary Contact
              </label>
              <select
                id="primary_contact_id"
                value={formData.primary_contact_id || ''}
                onChange={(e) => handleChange('primary_contact_id', e.target.value || null)}
                className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">No contact selected</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name || ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source */}
          <div className="sm:col-span-2">
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Source
            </label>
            <input
              type="text"
              id="source"
              value={formData.source || ''}
              onChange={(e) => handleChange('source', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="e.g., Website, Referral, Event"
            />
          </div>
        </div>
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
          {isSubmitting ? 'Saving...' : 'Save Deal'}
        </button>
      </div>
    </form>
  );
}
