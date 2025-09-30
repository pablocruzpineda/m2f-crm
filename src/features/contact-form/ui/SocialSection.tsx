import type { CreateContactInput } from '@/shared/lib/database/types';

interface SocialSectionProps {
  data: Partial<CreateContactInput>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateContactInput, value: string) => void;
}

/**
 * Social links section of contact form
 */
export function SocialSection({ data, errors, onChange }: SocialSectionProps) {
  return (
    <div className="rounded-lg border border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Social & Web Presence
      </h3>

      <div className="grid grid-cols-1 gap-6">
        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            value={data.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://example.com"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.website
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border focus:border-primary focus:ring-primary'
            }`}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="linkedin_url"
            className="block text-sm font-medium text-gray-700"
          >
            LinkedIn Profile
          </label>
          <input
            type="url"
            id="linkedin_url"
            value={data.linkedin_url || ''}
            onChange={(e) => onChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.linkedin_url
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border focus:border-primary focus:ring-primary'
            }`}
          />
          {errors.linkedin_url && (
            <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>
          )}
        </div>

        {/* Twitter */}
        <div>
          <label
            htmlFor="twitter_url"
            className="block text-sm font-medium text-gray-700"
          >
            Twitter / X Profile
          </label>
          <input
            type="url"
            id="twitter_url"
            value={data.twitter_url || ''}
            onChange={(e) => onChange('twitter_url', e.target.value)}
            placeholder="https://twitter.com/username"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors.twitter_url
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border focus:border-primary focus:ring-primary'
            }`}
          />
          {errors.twitter_url && (
            <p className="mt-1 text-sm text-red-600">{errors.twitter_url}</p>
          )}
        </div>
      </div>
    </div>
  );
}
