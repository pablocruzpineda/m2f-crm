import { Link } from 'react-router-dom';
import { DollarSign, Calendar, User, GripVertical } from 'lucide-react';
import type { DealWithRelations } from '@/shared/lib/database/types';

interface DealCardProps {
  deal: DealWithRelations;
  onDragStart: () => void;
  onDragEnd: () => void;
}

/**
 * Individual deal card in the pipeline with drag-and-drop
 */
export function DealCard({ deal, onDragStart, onDragEnd }: DealCardProps) {
  const contactName = deal.primary_contact
    ? `${deal.primary_contact.first_name} ${deal.primary_contact.last_name || ''}`.trim()
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group cursor-move rounded-lg border border bg-card shadow-sm transition-all hover:shadow-md hover:scale-105"
    >
      <Link
        to={`/pipeline/${deal.id}`}
        className="block p-4"
      >
        {/* Drag Handle */}
        <div className="flex items-start gap-2">
          <GripVertical className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-semibold text-foreground truncate">{deal.title}</h4>

            {/* Value */}
            {deal.value && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">
                  {Number(deal.value).toLocaleString()} {deal.currency || 'USD'}
                </span>
              </div>
            )}

            {/* Contact */}
            {contactName && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="truncate">{contactName}</span>
              </div>
            )}

            {/* Expected Close Date */}
            {deal.expected_close_date && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
              </div>
            )}

            {/* Probability Badge */}
            {deal.probability !== null && deal.probability !== undefined && (
              <div className="mt-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {deal.probability}% probability
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
