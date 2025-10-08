/**
 * @module pages/sub-accounts
 * @description Sub-accounts management page for workspace owners
 * Multi-Tenant Feature - Phase 5: UI Implementation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Users, Calendar, Trash2, AlertTriangle, Info } from 'lucide-react';
import { useCurrentWorkspace, useUserRole, useWorkspaceStore } from '@/entities/workspace';
import { useSubAccounts, useDeleteSubAccount } from '@/entities/sub-account';
import type { Json } from '@/shared/lib/database/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { CreateSubAccountDialog } from './CreateSubAccountDialog';
import { format } from 'date-fns';

export function SubAccountsPage() {
    const navigate = useNavigate();
    const { currentWorkspace } = useCurrentWorkspace();
    const { isOwner } = useUserRole();
    const { data: subAccounts, isLoading } = useSubAccounts(currentWorkspace?.id);
    const deleteSubAccount = useDeleteSubAccount(currentWorkspace?.id || '');
    const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        subAccountId: string | null;
        subAccountName: string;
    }>({
        isOpen: false,
        subAccountId: null,
        subAccountName: '',
    });

    // Check if this is a master workspace (parent_workspace_id is null)
    const isMasterWorkspace = !currentWorkspace?.parent_workspace_id;

    if (!currentWorkspace) {
        return (
            <PageContainer>
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Loading workspace...</p>
                </div>
            </PageContainer>
        );
    }

    // Only master workspace owners can manage sub-accounts
    if (!isOwner || !isMasterWorkspace) {
        return (
            <PageContainer>
                <PageHeader
                    title="Sub-Accounts"
                    description="Manage client sub-accounts"
                />
                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-destructive/15 p-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-destructive">Access Restricted</CardTitle>
                                <CardDescription className="mt-2">
                                    {!isOwner
                                        ? 'Only the workspace owner can manage sub-accounts.'
                                        : 'Sub-accounts can only be managed from the master workspace.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </PageContainer>
        );
    }

    const handleViewSubAccount = (subAccount: {
        id: string;
        name: string;
        slug: string;
        owner_id: string;
        parent_workspace_id: string | null;
        custom_domain: string | null;
        theme_config: Json | null;
        logo_url: string | null;
        logo_storage_path: string | null;
        created_at: string;
        updated_at: string;
    }) => {
        // Switch to the sub-account workspace
        setCurrentWorkspace({
            id: subAccount.id,
            name: subAccount.name,
            slug: subAccount.slug,
            owner_id: subAccount.owner_id,
            parent_workspace_id: subAccount.parent_workspace_id,
            custom_domain: subAccount.custom_domain,
            theme_config: subAccount.theme_config,
            logo_url: subAccount.logo_url,
            logo_storage_path: subAccount.logo_storage_path,
            created_at: subAccount.created_at,
            updated_at: subAccount.updated_at,
        });

        // Navigate to dashboard
        navigate('/dashboard');
    };

    const handleDeleteClick = (subAccountId: string, subAccountName: string) => {
        setDeleteDialog({
            isOpen: true,
            subAccountId,
            subAccountName,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.subAccountId) return;

        try {
            await deleteSubAccount.mutateAsync(deleteDialog.subAccountId);
            setDeleteDialog({ isOpen: false, subAccountId: null, subAccountName: '' });
        } catch (error) {
            console.error('Failed to delete sub-account:', error);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Sub-Accounts"
                description="Manage client sub-accounts and their administrators"
                actions={
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Sub-Account
                    </Button>
                }
            />

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading sub-accounts...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && (!subAccounts || subAccounts.length === 0) && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Sub-Accounts Yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                            Create sub-accounts for your clients. Each sub-account will have its own administrator
                            who can customize the appearance and manage their own data.
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Sub-Account
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Sub-Accounts List */}
            {!isLoading && subAccounts && subAccounts.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subAccounts.map((subAccount) => (
                        <Card key={subAccount.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold flex-shrink-0">
                                            {subAccount.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-lg">{subAccount.name}</CardTitle>
                                            <CardDescription className="text-xs space-y-0.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-mono">{subAccount.slug}</span>
                                                </div>
                                                {subAccount.custom_domain ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                        <span className="font-medium">Custom:</span>
                                                        <span className="font-mono">{subAccount.custom_domain}</span>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <button className="inline-flex items-center justify-center rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/20 p-0.5 transition-colors">
                                                                    <Info className="h-3 w-3" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80" align="start">
                                                                <div className="space-y-2">
                                                                    <h4 className="font-medium text-sm">DNS Configuration</h4>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        The client needs this CNAME record:
                                                                    </p>
                                                                    <div className="rounded-md bg-muted p-2 font-mono text-xs space-y-1">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Type:</span>
                                                                            <span className="font-semibold">CNAME</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Name:</span>
                                                                            <span className="font-semibold break-all">{subAccount.custom_domain}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-muted-foreground">Value:</span>
                                                                            <span className="font-semibold">yourcrm.com</span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        💡 DNS changes can take 5-60 minutes to propagate.
                                                                    </p>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground">
                                                        Subdomain: {subAccount.slug}.yourcrm.com
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Admin Info */}
                                {subAccount.admin_email && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Administrator</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                {subAccount.admin_name?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {subAccount.admin_name || 'Administrator'}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {subAccount.admin_email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{subAccount.member_count || 0} members</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(subAccount.created_at), 'MMM yyyy')}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleViewSubAccount(subAccount as Parameters<typeof handleViewSubAccount>[0])}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteClick(subAccount.id, subAccount.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Sub-Account Dialog */}
            <CreateSubAccountDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                masterWorkspaceId={currentWorkspace.id}
                masterOwnerId={currentWorkspace.owner_id}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) =>
                setDeleteDialog({ ...deleteDialog, isOpen: open })
            }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Sub-Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.subAccountName}</strong>?
                            This will permanently delete the workspace and all associated data (contacts, deals, meetings, etc.).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-destructive">This action cannot be undone</p>
                                <p className="text-xs text-muted-foreground">
                                    All data in this sub-account will be permanently deleted, including contacts, deals,
                                    meetings, and user memberships.
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ isOpen: false, subAccountId: null, subAccountName: '' })}
                            disabled={deleteSubAccount.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={deleteSubAccount.isPending}
                        >
                            {deleteSubAccount.isPending ? 'Deleting...' : 'Delete Sub-Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
