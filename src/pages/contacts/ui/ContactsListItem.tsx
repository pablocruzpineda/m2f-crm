import { Link } from 'react-router-dom';
import { Mail, Phone, Building2 } from 'lucide-react';
import type { ContactWithTags } from '@/shared/lib/database/types';

interface ContactsListItemProps {
  contact: ContactWithTags;
}

/**
 * Individual contact card in the list
 */
export function ContactsListItem({ contact }: ContactsListItemProps) {
  const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();
  const initials = contact.first_name[0] + (contact.last_name?.[0] || '');

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    lead: 'bg-blue-100 text-blue-800',
    customer: 'bg-purple-100 text-purple-800',
  };

  const statusColor = contact.status
    ? statusColors[contact.status as keyof typeof statusColors]
    : statusColors.active;

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className="block rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-105"
    >
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-semibold uppercase">{initials}</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{fullName}</h3>
            {contact.job_title && (
              <p className="text-sm text-muted-foreground">{contact.job_title}</p>
            )}
          </div>
        </div>
        {/* Status Badge */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {contact.status || 'active'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="mt-4 space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color || '#3b82f6'}20`,
                color: tag.color || '#3b82f6',
              }}
            >
              {tag.name}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              +{contact.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
