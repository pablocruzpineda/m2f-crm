import { useState } from 'react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { AssignmentFilterTabs } from '@/shared/ui/AssignmentFilterTabs';
import { ContactsHeader } from './ContactsHeader';
import { ContactsFilters } from './ContactsFilters';
import { ContactsList } from './ContactsList';
import { ContactsEmpty } from './ContactsEmpty';
import { useContacts } from '@/entities/contact';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import type { ContactFilters } from '@/shared/lib/database/types';

/**
 * Contacts Page - Main container for contact management
 */
export function ContactsPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { session } = useSession();
  const [assignmentTab, setAssignmentTab] = useState<'my' | 'all'>('my');
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    status: undefined,
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
    assigned_to: session?.user?.id, // Start with "My Contacts"
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

  const handleAssignmentTabChange = (tab: 'my' | 'all') => {
    setAssignmentTab(tab);
    setFilters((prev) => ({
      ...prev,
      assigned_to: tab === 'my' ? session?.user?.id : undefined,
      page: 1,
    }));
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
          <AssignmentFilterTabs
            activeTab={assignmentTab}
            onTabChange={handleAssignmentTabChange}
            myCount={assignmentTab === 'my' ? totalCount : undefined}
            allCount={assignmentTab === 'all' ? totalCount : undefined}
          />

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
