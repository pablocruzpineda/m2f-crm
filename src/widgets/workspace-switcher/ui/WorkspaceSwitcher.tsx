/**
 * @module widgets/workspace-switcher
 * @description Workspace switcher dropdown
 */

import { useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useWorkspaces, useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
import type { Workspace } from '@/shared/lib/auth/types';
import { cn } from '@/shared/lib/utils';

export function WorkspaceSwitcher() {
  const { session } = useSession();
  const { data: workspaces, isLoading } = useWorkspaces(session?.user?.id);
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspace();
  const [isOpen, setIsOpen] = useState(false);

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
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border bg-card shadow-lg">
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
            <div className="border-t border py-1">
              <button className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-muted">
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
