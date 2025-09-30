import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state/EmptyState';

/**
 * Empty state when no contacts exist
 */
export function ContactsEmpty() {
  return (
    <EmptyState
      icon={UserPlus}
      title="No contacts yet"
      description="Get started by adding your first contact. You can import contacts, add them manually, or sync from other tools."
      action={
        <Link
          to="/contacts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <UserPlus className="h-5 w-5" />
          Add Your First Contact
        </Link>
      }
    />
  );
}
