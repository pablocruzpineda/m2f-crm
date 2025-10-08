/**
 * @module widgets/workspace-switcher
 * @description Workspace switcher dropdown
 */

import { useState, useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useWorkspaces, useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import type { Workspace } from '@/shared/lib/auth/types';
import { cn } from '@/shared/lib/utils';

export function WorkspaceSwitcher() {
  const { session } = useSession();
  const { data: allWorkspaces, isLoading } = useWorkspaces(session?.user?.id);
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  // Filter workspaces based on multi-tenant rules
  const workspaces = useMemo(() => {
    if (!allWorkspaces || !session?.user?.id) return [];

    // Find master workspaces (where user is owner and parent_workspace_id is null)
    const masterWorkspaces = allWorkspaces.filter(
      (w: Workspace) => w.owner_id === session.user.id && !w.parent_workspace_id
    );

    // Find sub-account workspaces (where user is owner and has parent_workspace_id)
    const ownedSubAccounts = allWorkspaces.filter(
      (w: Workspace) => w.owner_id === session.user.id && w.parent_workspace_id
    );

    // If user owns master workspace(s), show master + all their sub-accounts
    if (masterWorkspaces.length > 0) {
      // Get all sub-accounts where user is owner (for visibility)
      const subAccounts = allWorkspaces.filter(
        (w: Workspace) => w.parent_workspace_id &&
          masterWorkspaces.some(m => m.id === w.parent_workspace_id)
      );
      return [...masterWorkspaces, ...subAccounts];
    }

    // If user only owns sub-account(s), show only their sub-accounts
    if (ownedSubAccounts.length > 0) {
      return ownedSubAccounts;
    }

    // Otherwise, show all workspaces they're a member of (original behavior)
    return allWorkspaces;
  }, [allWorkspaces, session?.user?.id]);

  if (isLoading || !workspaces || workspaces.length === 0) {
    return null;
  }

  // Don't show switcher if only one workspace
  if (workspaces.length === 1) {
    return (
      <div className="flex items-center space-x-2 rounded-lg bg-muted px-3 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
          {currentWorkspace?.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-foreground">
          {currentWorkspace?.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg bg-muted px-3 py-2 hover:bg-muted/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
          {currentWorkspace?.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-foreground">
          {currentWorkspace?.name}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-lg border border bg-card shadow-lg">
            <div className="border-b border px-3 py-2">
              <p className="text-xs font-semibold text-gray-500">WORKSPACES</p>
            </div>
            <div className="py-1">
              {workspaces.map((workspace: Workspace) => {
                const isSelected = workspace.id === currentWorkspace?.id;
                return (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setCurrentWorkspace(workspace);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">
                        {workspace.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
