import type { CreateContactInput } from '@/shared/lib/database/types';

interface BasicInfoSectionProps {
  data: Partial<CreateContactInput>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateContactInput, value: string) => void;
}

/**
 * Basic information section of contact form
 */
export function BasicInfoSection({ data, errors, onChange }: BasicInfoSectionProps) {
  return (
    <div className="rounded-lg border border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            value={data.first_name || ''}
            onChange={(e) => onChange('first_name', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.first_name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border focus:border-primary focus:ring-primary'
              }`}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            value={data.last_name || ''}
            onChange={(e) => onChange('last_name', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="example@email.com"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border focus:border-primary focus:ring-primary'
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-gray-700"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            value={data.company || ''}
            onChange={(e) => onChange('company', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Job Title */}
        <div>
          <label
            htmlFor="job_title"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            id="job_title"
            value={data.job_title || ''}
            onChange={(e) => onChange('job_title', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            value={data.status || 'active'}
            onChange={(e) => onChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label
            htmlFor="source"
            className="block text-sm font-medium text-gray-700"
          >
            Source
          </label>
          <input
            type="text"
            id="source"
            value={data.source || ''}
            onChange={(e) => onChange('source', e.target.value)}
            placeholder="e.g., Website, Referral, Event"
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
