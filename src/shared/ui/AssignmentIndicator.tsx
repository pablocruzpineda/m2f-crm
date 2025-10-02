/**
 * Assignment Indicator Component
 * Phase 5.3 - Team Collaboration
 * Shows who a contact or deal is assigned to
 */

import { User } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { useTeamMembers } from '@/entities/team';
import { useSession } from '@/entities/session';

interface AssignmentIndicatorProps {
    assignedToId?: string | null;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export function AssignmentIndicator({
    assignedToId,
    size = 'md',
    showIcon = true,
}: AssignmentIndicatorProps) {
    const { session } = useSession();
    const { data: members } = useTeamMembers();
    const currentUserId = session?.user?.id;

    if (!assignedToId) {
        return null;
    }

    const assignedMember = members?.find((m) => m.id === assignedToId);
    const isMe = assignedToId === currentUserId;

    const displayName = assignedMember
        ? assignedMember.full_name || assignedMember.email
        : 'Unknown User';

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
            {showIcon && <User className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="text-muted-foreground">
                {isMe ? (
                    <>
                        Assigned to{' '}
                        <span className="font-medium text-foreground">You</span>
                    </>
                ) : (
                    <>
                        Assigned to{' '}
                        <span className="font-medium text-foreground">{displayName}</span>
                    </>
                )}
            </span>
            {assignedMember && (
                <Badge variant="outline" className="text-xs capitalize ml-1">
                    {assignedMember.role}
                </Badge>
            )}
        </div>
    );
}
