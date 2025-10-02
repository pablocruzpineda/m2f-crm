/**
 * Bulk Assignment Dialog
 * Phase 5.3 - Team Collaboration
 * Allows bulk assignment of contacts or deals to team members
 */

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Loader2, Info, UserCheck } from 'lucide-react';
import { useTeamMembers } from '@/entities/team';
import { useSession } from '@/entities/session';

interface BulkAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAssign: (userId: string) => void;
    selectedCount: number;
    entityType: 'contact' | 'deal';
    isLoading?: boolean;
}

export function BulkAssignmentDialog({
    open,
    onOpenChange,
    onAssign,
    selectedCount,
    entityType,
    isLoading = false,
}: BulkAssignmentDialogProps) {
    const { session } = useSession();
    const { data: members, isLoading: membersLoading } = useTeamMembers();
    const currentUserId = session?.user?.id;
    const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;
        onAssign(selectedUserId);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!isLoading) {
            setSelectedUserId(currentUserId || '');
            onOpenChange(newOpen);
        }
    };

    const entityLabel = entityType === 'contact' ? 'contacts' : 'deals';

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Bulk Assign {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                    </DialogTitle>
                    <DialogDescription>
                        Assign {selectedCount} selected {entityLabel} to a team member.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Team Member Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="assigned_to">Assign To</Label>
                        <Select
                            value={selectedUserId}
                            onValueChange={(value: string) => setSelectedUserId(value)}
                            disabled={isLoading || membersLoading}
                        >
                            <SelectTrigger id="assigned_to">
                                <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                            <SelectContent>
                                {members?.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {member.full_name || member.email}
                                            </span>
                                            {member.id === currentUserId && (
                                                <span className="text-xs text-muted-foreground">(Me)</span>
                                            )}
                                            <span className="text-xs text-muted-foreground capitalize">
                                                • {member.role}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Info Alert */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Assignment Summary:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>{selectedCount} {entityLabel} will be reassigned</li>
                                <li>Previous assignment history will be preserved</li>
                                <li>The selected team member will be notified (if enabled)</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !selectedUserId || membersLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Assign {selectedCount} {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
