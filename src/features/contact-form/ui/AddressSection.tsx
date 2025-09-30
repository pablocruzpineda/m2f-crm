import type { CreateContactInput } from '@/shared/lib/database/types';

interface AddressSectionProps {
  data: Partial<CreateContactInput>;
  errors: Record<string, string>;
  onChange: (field: keyof CreateContactInput, value: string) => void;
}

/**
 * Address information section of contact form
 */
export function AddressSection({ data, onChange }: AddressSectionProps) {
  return (
    <div className="rounded-lg border border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Address Information
      </h3>

      <div className="grid grid-cols-1 gap-6">
        {/* Address Line 1 */}
        <div>
          <label
            htmlFor="address_line1"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 1
          </label>
          <input
            type="text"
            id="address_line1"
            value={data.address_line1 || ''}
            onChange={(e) => onChange('address_line1', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label
            htmlFor="address_line2"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 2
          </label>
          <input
            type="text"
            id="address_line2"
            value={data.address_line2 || ''}
            onChange={(e) => onChange('address_line2', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={data.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700"
            >
              State / Province
            </label>
            <input
              type="text"
              id="state"
              value={data.state || ''}
              onChange={(e) => onChange('state', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="postal_code"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postal_code"
              value={data.postal_code || ''}
              onChange={(e) => onChange('postal_code', e.target.value)}
              className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <input
            type="text"
            id="country"
            value={data.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
