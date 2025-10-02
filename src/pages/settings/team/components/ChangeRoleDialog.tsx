/**
 * Change Role Dialog
 * Allows changing a team member's role
 */

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useUpdateMemberRole } from '@/entities/team'
import type { TeamMember } from '@/entities/team/api/teamApi'
import type { Role } from '@/shared/lib/permissions'

interface ChangeRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: TeamMember
}

export function ChangeRoleDialog({ open, onOpenChange, member }: ChangeRoleDialogProps) {
    const [newRole, setNewRole] = useState<Role>(member.role)
    const updateRole = useUpdateMemberRole()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newRole === member.role) {
            onOpenChange(false)
            return
        }

        await updateRole.mutateAsync(
            { userId: member.id, newRole },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!updateRole.isPending) {
            setNewRole(member.role)
            onOpenChange(newOpen)
        }
    }

    const isDowngrade = () => {
        const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 }
        return roleHierarchy[newRole] < roleHierarchy[member.role]
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Member Role</DialogTitle>
                    <DialogDescription>
                        Update the role and permissions for {member.full_name || member.email}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Role Display */}
                    <div className="space-y-2">
                        <Label>Current Role</Label>
                        <div className="px-3 py-2 rounded-md bg-muted text-sm capitalize">
                            {member.role}
                        </div>
                    </div>

                    {/* New Role Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="new-role">New Role</Label>
                        <Select
                            value={newRole}
                            onValueChange={(value) => setNewRole(value as Role)}
                            disabled={updateRole.isPending}
                        >
                            <SelectTrigger id="new-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Admin</span>
                                        <span className="text-xs text-muted-foreground">
                                            Full team management and data access
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="member">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Member</span>
                                        <span className="text-xs text-muted-foreground">
                                            Access to assigned contacts and deals
                                        </span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="viewer">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Viewer</span>
                                        <span className="text-xs text-muted-foreground">
                                            Read-only access to assigned data
                                        </span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Warning for Downgrades */}
                    {isDowngrade() && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                This will reduce the member's permissions. They will lose access to features and data
                                that are not available in the new role.
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={updateRole.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateRole.isPending || newRole === member.role}
                        >
                            {updateRole.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Update Role
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
