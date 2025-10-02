/**
 * Assignment Section for Contact Form
 * Phase 5.3 - Team Collaboration
 * Allows assigning contacts to team members
 */

import { useTeamMembers } from '@/entities/team';
import { useUserRole } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import type { CreateContactInput } from '@/shared/lib/database/types';

interface AssignmentSectionProps {
    data: Partial<CreateContactInput>;
    errors: Record<string, string>;
    onChange: (field: keyof CreateContactInput, value: string) => void;
}

export function AssignmentSection({ data, errors, onChange }: AssignmentSectionProps) {
    const { session } = useSession();
    const { data: members, isLoading } = useTeamMembers();
    const { canAssignToOthers } = useUserRole();
    const currentUserId = session?.user?.id;

    // If user cannot assign to others, auto-assign to self (handled by API)
    if (!canAssignToOthers) {
        return null;
    }

    return (
        <div className="rounded-lg border border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Assignment</h3>

            <div className="space-y-4">
                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                        Assign To
                    </label>
                    <select
                        id="assigned_to"
                        value={data.assigned_to || ''}
                        onChange={(e) => onChange('assigned_to', e.target.value)}
                        disabled={isLoading}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.assigned_to
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border focus:border-primary focus:ring-primary'
                            }`}
                    >
                        <option value="">Auto-assign to me</option>
                        {members?.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.full_name || member.email}
                                {member.id === currentUserId ? ' (Me)' : ''}
                                {' - '}
                                {member.role}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {canAssignToOthers
                            ? 'Select a team member to assign this contact to. Leave empty to assign to yourself.'
                            : 'This contact will be assigned to you.'}
                    </p>
                    {errors.assigned_to && (
                        <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
