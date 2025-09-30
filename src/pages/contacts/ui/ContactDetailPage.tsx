import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Building2, MapPin, Globe, Linkedin, Twitter } from 'lucide-react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { useContact, useDeleteContact } from '@/entities/contact';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';
import { useState } from 'react';

/**
 * Contact Detail Page - View individual contact
 */
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id);
  const deleteContact = useDeleteContact();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteContact.mutateAsync(id);
      navigate('/contacts');
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!contact) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">Contact not found</h2>
          <Link to="/contacts" className="mt-4 text-primary hover:text-primary">
            Back to contacts
          </Link>
        </div>
      </PageContainer>
    );
  }

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
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/contacts"
              className="rounded-lg p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-xl font-semibold uppercase">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                {contact.job_title && contact.company && (
                  <p className="text-sm text-gray-500">
                    {contact.job_title} at {contact.company}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/contacts/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border bg-card px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-muted"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-card px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="rounded-lg border border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Contact Information
              </h2>
              <dl className="space-y-4">
                {contact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary hover:text-primary"
                        >
                          {contact.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-foreground hover:text-primary"
                        >
                          {contact.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company</dt>
                      <dd className="mt-1 text-sm text-foreground">{contact.company}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Address */}
            {(contact.address_line1 || contact.city || contact.country) && (
              <div className="rounded-lg border border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Address</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="text-sm text-foreground">
                    {contact.address_line1 && <div>{contact.address_line1}</div>}
                    {contact.address_line2 && <div>{contact.address_line2}</div>}
                    {(contact.city || contact.state || contact.postal_code) && (
                      <div>
                        {contact.city}
                        {contact.state && `, ${contact.state}`}
                        {contact.postal_code && ` ${contact.postal_code}`}
                      </div>
                    )}
                    {contact.country && <div>{contact.country}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(contact.website || contact.linkedin_url || contact.twitter_url) && (
              <div className="rounded-lg border border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Web & Social
                </h2>
                <dl className="space-y-4">
                  {contact.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Website</dt>
                        <dd className="mt-1">
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary"
                          >
                            {contact.website}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {contact.linkedin_url && (
                    <div className="flex items-start gap-3">
                      <Linkedin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
                        <dd className="mt-1">
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary"
                          >
                            {contact.linkedin_url}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {contact.twitter_url && (
                    <div className="flex items-start gap-3">
                      <Twitter className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Twitter</dt>
                        <dd className="mt-1">
                          <a
                            href={contact.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary"
                          >
                            {contact.twitter_url}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="rounded-lg border border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Details */}
            <div className="rounded-lg border border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                      {contact.status || 'active'}
                    </span>
                  </dd>
                </div>
                {contact.source && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Source</dt>
                    <dd className="mt-1 text-sm text-foreground">{contact.source}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(contact.created_at || '').toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(contact.updated_at || '').toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="rounded-lg border border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                      style={{
                        backgroundColor: `${tag.color || '#3b82f6'}20`,
                        color: tag.color || '#3b82f6',
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-muted/500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-card rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Contact</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {fullName}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-card border border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteContact.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50"
                >
                  {deleteContact.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
