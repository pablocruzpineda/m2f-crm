import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';

interface ContactsHeaderProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
}

/**
 * Contacts page header with search and create button
 */
export function ContactsHeader({ onSearchChange, searchValue }: ContactsHeaderProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Contacts"
        description="Manage your contacts and leads"
        actions={
          <Link
            to="/contacts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search contacts by name, email, or company..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-foreground shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}
