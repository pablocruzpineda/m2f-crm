/**
 * @module app/providers/workspace-provider
 * @description Workspace provider for managing workspace state
 */

import { useEffect, type ReactNode } from 'react';
import { useSession } from '@/entities/session';
import { useWorkspaces, useWorkspaceStore, getStoredWorkspaceId } from '@/entities/workspace';

interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * WorkspaceProvider component
 * Loads user's workspaces and restores selected workspace from storage
 */
export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, isAuthenticated } = useSession();
  const { data: workspaces, isSuccess } = useWorkspaces(user?.id);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  useEffect(() => {
    if (!isAuthenticated || !isSuccess || !workspaces || workspaces.length === 0) {
      return;
    }

    // If no current workspace, try to restore from storage or set first workspace
    if (!currentWorkspace) {
      const storedWorkspaceId = getStoredWorkspaceId();
      
      if (storedWorkspaceId) {
        // Try to find and restore stored workspace
        const storedWorkspace = workspaces.find((w) => w.id === storedWorkspaceId);
        if (storedWorkspace) {
          setCurrentWorkspace(storedWorkspace);
          return;
        }
      }
      
      // No stored workspace or it's not in user's workspaces, use first one
      const firstWorkspace = workspaces[0];
      if (firstWorkspace) {
        setCurrentWorkspace(firstWorkspace);
      }
    }
  }, [isAuthenticated, isSuccess, workspaces, currentWorkspace, setCurrentWorkspace]);

  return <>{children}</>;
}
