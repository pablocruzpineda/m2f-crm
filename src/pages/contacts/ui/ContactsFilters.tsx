import { Filter } from 'lucide-react';
import type { ContactFilters, ContactStatus } from '@/shared/lib/database/types';

interface ContactsFiltersProps {
  filters: ContactFilters;
  onFilterChange: (filters: Partial<ContactFilters>) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Customer' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Recently Added' },
  { value: 'updated_at', label: 'Recently Updated' },
  { value: 'name', label: 'Name (A-Z)' },
];

/**
 * Contacts filters bar
 */
export function ContactsFilters({ filters, onFilterChange }: ContactsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4" />
        Filters:
      </div>

      {/* Status Filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ status: (e.target.value || undefined) as ContactStatus | 'all' | undefined })}
        className="rounded-md border bg-background py-1.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Sort By */}
      <select
        value={filters.sortBy || 'created_at'}
        onChange={(e) =>
          onFilterChange({
            sortBy: e.target.value as ContactFilters['sortBy'],
          })
        }
        className="rounded-md border bg-background py-1.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Sort Order */}
      <button
        onClick={() =>
          onFilterChange({
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
          })
        }
        className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>

      {/* Clear Filters */}
      {(filters.status || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc') && (
        <button
          onClick={() =>
            onFilterChange({
              status: undefined,
              sortBy: 'created_at',
              sortOrder: 'desc',
            })
          }
          className="ml-auto text-sm font-medium text-primary hover:text-primary/80"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
