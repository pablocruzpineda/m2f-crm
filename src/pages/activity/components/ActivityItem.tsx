/**
 * Activity Item Component
 * Phase 5.3 - Step 8
 * 
 * Displays a single activity log entry with user info, action, and timestamp.
 */

import { formatDistanceToNow } from 'date-fns';
import {
    UserPlus,
    UserMinus,
    UserCog,
    FileText,
    Trash2,
    Edit,
    Plus,
    CheckCircle,
    MessageSquare,
    Briefcase,
    Settings,
    Activity as ActivityIcon
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import type { ActivityLogWithUser } from '@/entities/activity-log';
import { cn } from '@/shared/lib/utils/cn';

interface ActivityItemProps {
    activity: ActivityLogWithUser;
}

// Map entity types to icons and colors
const entityConfig = {
    contact: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    deal: { icon: Briefcase, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    message: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    workspace_member: { icon: UserCog, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    chat_settings: { icon: Settings, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' },
    default: { icon: ActivityIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' },
};

// Map actions to icons
const actionConfig = {
    create: { icon: Plus, color: 'text-green-600' },
    update: { icon: Edit, color: 'text-blue-600' },
    delete: { icon: Trash2, color: 'text-red-600' },
    add: { icon: UserPlus, color: 'text-green-600' },
    remove: { icon: UserMinus, color: 'text-red-600' },
    change_role: { icon: UserCog, color: 'text-orange-600' },
    status_change: { icon: CheckCircle, color: 'text-blue-600' },
    default: { icon: FileText, color: 'text-gray-600' },
};

function getEntityConfig(entityType: string) {
    return entityConfig[entityType as keyof typeof entityConfig] || entityConfig.default;
}

function getActionConfig(action: string) {
    return actionConfig[action as keyof typeof actionConfig] || actionConfig.default;
}

function formatActionText(action: string, entityType: string): string {
    const actionMap: Record<string, string> = {
        create: 'created',
        update: 'updated',
        delete: 'deleted',
        add: 'added',
        remove: 'removed',
        change_role: 'changed role of',
        status_change: 'changed status of',
    };

    const entityMap: Record<string, string> = {
        contact: 'contact',
        deal: 'deal',
        message: 'message',
        workspace_member: 'team member',
        chat_settings: 'chat settings',
    };

    return `${actionMap[action] || action} ${entityMap[entityType] || entityType}`;
}

export function ActivityItem({ activity }: ActivityItemProps) {
    const entityCfg = getEntityConfig(activity.entity_type);
    const actionCfg = getActionConfig(activity.action);
    const EntityIcon = entityCfg.icon;
    const ActionIcon = actionCfg.icon;

    const userInitials = activity.profiles?.full_name
        ? activity.profiles.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : activity.profiles?.email?.substring(0, 2).toUpperCase() || '?';

    const userName = activity.profiles?.full_name || activity.profiles?.email || 'Unknown User';

    const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

    const actionText = formatActionText(activity.action, activity.entity_type);

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors">
            {/* Entity Icon */}
            <div className={cn('rounded-full p-2', entityCfg.bg)}>
                <EntityIcon className={cn('h-5 w-5', entityCfg.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* User and Action */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={activity.profiles?.avatar_url || undefined} alt={userName} />
                                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{userName}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ActionIcon className={cn('h-4 w-4', actionCfg.color)} />
                                <span className="text-muted-foreground">{actionText}</span>
                            </div>
                        </div>

                        {/* Details */}
                        {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                            </p>
                        )}

                        {/* Entity ID */}
                        {activity.entity_id && (
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs font-mono">
                                    ID: {activity.entity_id.substring(0, 8)}...
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo}
                    </div>
                </div>
            </div>
        </div>
    );
}
