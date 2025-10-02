/**
 * Team Members Management Page
 * Phase 5.3 - Team Collaboration
 * 
 * Features:
 * - View all team members with their roles
 * - Add new members by email
 * - Change member roles
 * - Remove members (with automatic data reassignment)
 * - Only accessible to owners and admins
 */

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Loader2, UserPlus, AlertCircle, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useUserRole } from '@/entities/workspace'
import { useCurrentWorkspace } from '@/entities/workspace/model/useCurrentWorkspace'
import { useTeamMembers, useTeamInvitations, useInvitationStats, usePendingInvitations } from '@/entities/team'
import { TeamMemberRow } from './components/TeamMemberRow'
import { InvitationRow } from './components/InvitationRow'
import { AddMemberDialog } from './components/AddMemberDialog'

export function TeamMembersPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const { currentWorkspace } = useCurrentWorkspace()
    const { canManageMembers, isLoading: roleLoading } = useUserRole()
    const { data: members, isLoading: membersLoading } = useTeamMembers()
    const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations()
    const stats = useInvitationStats()
    const pendingInvitations = usePendingInvitations()

    const isLoading = roleLoading || membersLoading

    // Permission check
    if (!roleLoading && !canManageMembers) {
        return (
            <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to manage team members. Only workspace owners and admins can access this page.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-8 px-4 md:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your workspace team members, roles, and permissions
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Invitations</CardDescription>
                        <CardTitle className="text-3xl">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                        </CardDescription>
                        <CardTitle className="text-3xl text-yellow-600 dark:text-yellow-400">
                            {stats.pending}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Accepted
                        </CardDescription>
                        <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                            {stats.accepted}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Expired
                        </CardDescription>
                        <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                            {stats.expired}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Pending Invitations Section */}
            {pendingInvitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Pending Invitations
                                </CardTitle>
                                <CardDescription>
                                    {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? 's' : ''} waiting for acceptance
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {invitationsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingInvitations.map((invitation) => (
                                    <InvitationRow key={invitation.id} invitation={invitation} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* All Invitations History */}
            {invitations && invitations.length > 0 && invitations.length > pendingInvitations.length && (
                <Card>
                    <CardHeader>
                        <CardTitle>Invitation History</CardTitle>
                        <CardDescription>
                            All invitations sent from this workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invitationsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {invitations
                                    .filter((inv) => inv.status !== 'pending')
                                    .map((invitation) => (
                                        <InvitationRow key={invitation.id} invitation={invitation} />
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Team Members Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                {currentWorkspace?.name} • {members?.length || 0} member{members?.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        <Button onClick={() => setIsAddDialogOpen(true)} disabled={isLoading}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : members && members.length > 0 ? (
                        <div className="space-y-2">
                            {members.map((member) => (
                                <TeamMemberRow key={member.id} member={member} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No team members found. Add your first team member to get started.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                    <CardDescription>
                        Understanding what each role can do in your workspace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">Owner</div>
                            <p className="text-muted-foreground">
                                Full access to everything including workspace settings, theme customization, and team management.
                                Can delete the workspace.
                            </p>
                        </div>
                        <div>
                            <div className="font-semibold text-purple-600 dark:text-purple-400">Admin</div>
                            <p className="text-muted-foreground">
                                Can manage team members, view all contacts/deals, assign data, configure WhatsApp settings,
                                and delete entities. Cannot change theme or workspace settings.
                            </p>
                        </div>
                        <div>
                            <div className="font-semibold text-green-600 dark:text-green-400">Member</div>
                            <p className="text-muted-foreground">
                                Can view and manage only assigned contacts/deals. Can create new entities (auto-assigned to them).
                                Cannot see other members' data or manage team settings.
                            </p>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-600 dark:text-gray-400">Viewer</div>
                            <p className="text-muted-foreground">
                                Read-only access to assigned contacts/deals. Cannot create, update, or delete any data.
                                Useful for stakeholders who need visibility without editing capabilities.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Member Dialog */}
            <AddMemberDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />
        </div>
    )
}
