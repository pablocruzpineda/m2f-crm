import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';
import type { DealFilters } from '@/shared/lib/database/types';

interface PipelineHeaderProps {
  filters: Omit<DealFilters, 'stage_id'>;
  onFilterChange: (filters: Partial<Omit<DealFilters, 'stage_id'>>) => void;
}

/**
 * Pipeline page header with search and filters
 */
export function PipelineHeader({ filters, onFilterChange }: PipelineHeaderProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Sales Pipeline"
        description="Manage your deals and opportunities"
      />

      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="block w-full rounded-md border pl-10 pr-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || 'open'}
          onChange={(e) => onFilterChange({ status: e.target.value as 'open' | 'won' | 'lost' | 'on_hold' })}
          className="rounded-md border py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="open">Open Deals</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="on_hold">On Hold</option>
        </select>

        {/* Add Deal Button */}
        <Link
          to="/pipeline/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </Link>
      </div>
    </div>
  );
}
