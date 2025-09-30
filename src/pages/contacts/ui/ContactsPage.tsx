import { useState } from 'react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { ContactsHeader } from './ContactsHeader';
import { ContactsFilters } from './ContactsFilters';
import { ContactsList } from './ContactsList';
import { ContactsEmpty } from './ContactsEmpty';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { ContactFilters } from '@/shared/lib/database/types';

/**
 * Contacts Page - Main container for contact management
 */
export function ContactsPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    status: undefined,
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useContacts(currentWorkspace?.id, filters);

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<ContactFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const contacts = data?.data || [];
  const totalCount = data?.count || 0;
  const hasContacts = totalCount > 0;
  const hasFilters = !!(filters.search || filters.status || filters.tags?.length);

  return (
    <PageContainer>
      <ContactsHeader
        onSearchChange={handleSearchChange}
        searchValue={filters.search || ''}
      />

      {hasContacts || hasFilters ? (
        <>
          <ContactsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <ContactsList
            contacts={contacts}
            isLoading={isLoading}
            currentPage={filters.page || 1}
            totalCount={totalCount}
            pageSize={filters.limit || 20}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <ContactsEmpty />
      )}
    </PageContainer>
  );
}
