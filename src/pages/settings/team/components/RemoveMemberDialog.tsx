/**
 * Remove Member Dialog
 * Confirmation dialog for removing team members
 * Shows warning about data reassignment
 */

import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useRemoveTeamMember } from '@/entities/team'
import type { TeamMember } from '@/entities/team/api/teamApi'

interface RemoveMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: TeamMember
}

export function RemoveMemberDialog({ open, onOpenChange, member }: RemoveMemberDialogProps) {
    const removeMember = useRemoveTeamMember()

    const handleRemove = async () => {
        await removeMember.mutateAsync(
            member.id,
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!removeMember.isPending) {
            onOpenChange(newOpen)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove Team Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {member.full_name || member.email} from the workspace?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Warning Alert */}
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>This action cannot be undone.</strong> The member will immediately lose access
                            to the workspace.
                        </AlertDescription>
                    </Alert>

                    {/* Data Reassignment Info */}
                    <Alert>
                        <AlertDescription>
                            <strong>Automatic Data Reassignment:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>All contacts assigned to this member will be reassigned to the workspace owner</li>
                                <li>All deals assigned to this member will be reassigned to the workspace owner</li>
                                <li>Activity history will be preserved for audit purposes</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Member Info */}
                    <div className="rounded-lg border p-4 bg-muted/50">
                        <div className="text-sm space-y-1">
                            <div>
                                <span className="text-muted-foreground">Name:</span>{' '}
                                <span className="font-medium">{member.full_name || 'Not set'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>{' '}
                                <span className="font-medium">{member.email}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Role:</span>{' '}
                                <span className="font-medium capitalize">{member.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={removeMember.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemove}
                        disabled={removeMember.isPending}
                    >
                        {removeMember.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Remove Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
