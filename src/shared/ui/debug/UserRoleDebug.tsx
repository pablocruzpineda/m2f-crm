/**
 * Debug component to show current user role and workspace info
 * Temporary - for troubleshooting multi-tenant permissions
 */

import { useCurrentWorkspace, useUserRole } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

export function UserRoleDebug() {
    const { session } = useSession();
    const { currentWorkspace } = useCurrentWorkspace();
    const { role, isOwner, isAdmin, canChangeTheme } = useUserRole();

    if (!session || !currentWorkspace) return null;

    return (
        <Card className="border-amber-500 bg-amber-50/50">
            <CardHeader>
                <CardTitle className="text-sm font-mono">🔍 Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono">
                <div>
                    <span className="font-semibold">User ID:</span> {session.user.id}
                </div>
                <div>
                    <span className="font-semibold">Email:</span> {session.user.email}
                </div>
                <div>
                    <span className="font-semibold">Workspace ID:</span> {currentWorkspace.id}
                </div>
                <div>
                    <span className="font-semibold">Workspace Name:</span> {currentWorkspace.name}
                </div>
                <div>
                    <span className="font-semibold">Workspace Owner ID:</span> {currentWorkspace.owner_id}
                </div>
                <div>
                    <span className="font-semibold">Parent Workspace ID:</span>{' '}
                    {currentWorkspace.parent_workspace_id || 'NULL (master)'}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Your Role:</span>
                    <Badge>{role}</Badge>
                </div>
                <div className="space-y-1 border-t pt-2">
                    <div>✅ isOwner: {isOwner ? 'true' : 'false'}</div>
                    <div>✅ isAdmin: {isAdmin ? 'true' : 'false'}</div>
                    <div className={canChangeTheme ? 'text-green-600' : 'text-red-600'}>
                        {canChangeTheme ? '✅' : '❌'} canChangeTheme: {canChangeTheme ? 'true' : 'false'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
