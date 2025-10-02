/**
 * Team Member Row Component
 * Displays a single team member with actions
 */

import { useState } from 'react'
import { MoreVertical, Shield, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { useSession } from '@/entities/session'
import { useUserRole } from '@/entities/workspace'
import type { TeamMember } from '@/entities/team/api/teamApi'
import { ChangeRoleDialog } from './ChangeRoleDialog'
import { RemoveMemberDialog } from './RemoveMemberDialog'

interface TeamMemberRowProps {
    member: TeamMember
}

export function TeamMemberRow({ member }: TeamMemberRowProps) {
    const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)
    const [isRemoveOpen, setIsRemoveOpen] = useState(false)
    const { session } = useSession()
    const { role: currentUserRole } = useUserRole()

    const isCurrentUser = session?.user?.id === member.id
    const isOwner = member.role === 'owner'
    const canModify = !isCurrentUser && !isOwner && currentUserRole !== 'member'

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'owner':
                return 'default' // Blue
            case 'admin':
                return 'secondary' // Purple
            case 'member':
                return 'outline' // Green
            case 'viewer':
                return 'outline' // Gray
            default:
                return 'outline'
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'text-blue-600 dark:text-blue-400'
            case 'admin':
                return 'text-purple-600 dark:text-purple-400'
            case 'member':
                return 'text-green-600 dark:text-green-400'
            case 'viewer':
                return 'text-gray-600 dark:text-gray-400'
            default:
                return 'text-gray-600'
        }
    }

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (email) {
            return email.slice(0, 2).toUpperCase()
        }
        return 'U'
    }

    return (
        <>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <Avatar>
                        <AvatarFallback className={getRoleColor(member.role)}>
                            {getInitials(member.full_name, member.email)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                                {member.full_name || member.email}
                            </p>
                            {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">
                                    You
                                </Badge>
                            )}
                        </div>
                        {member.full_name && (
                            <p className="text-sm text-muted-foreground truncate">
                                {member.email}
                            </p>
                        )}
                    </div>

                    {/* Role Badge */}
                    <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                        {member.role}
                    </Badge>
                </div>

                {/* Actions */}
                {canModify && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsChangeRoleOpen(true)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setIsRemoveOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Dialogs */}
            <ChangeRoleDialog
                open={isChangeRoleOpen}
                onOpenChange={setIsChangeRoleOpen}
                member={member}
            />
            <RemoveMemberDialog
                open={isRemoveOpen}
                onOpenChange={setIsRemoveOpen}
                member={member}
            />
        </>
    )
}
