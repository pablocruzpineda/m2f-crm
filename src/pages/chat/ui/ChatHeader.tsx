/**
 * @module pages/chat/ui/ChatHeader
 * @description Chat header with contact info and actions
 */

import { ArrowLeft, Phone, MoreVertical, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useContact } from '@/entities/contact';
import { Skeleton } from '@/shared/ui/skeleton';

interface ChatHeaderProps {
  contactId: string;
  onBack: () => void;
}

export function ChatHeader({ contactId, onBack }: ChatHeaderProps) {
  const { data: contact, isLoading } = useContact(contactId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Contact not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      {/* Back button for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">
          {contact.first_name} {contact.last_name || ''}
        </h2>
        <p className="text-sm text-muted-foreground truncate">
          {contact.phone || contact.email || 'No contact info'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {contact.phone && (
          <Button
            variant="ghost"
            size="icon"
            title="Call contact"
            onClick={() => window.open(`tel:${contact.phone}`, '_self')}
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          title="Contact info"
          onClick={() => window.open(`/contacts/${contactId}`, '_blank')}
        >
          <Info className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" title="More options">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
