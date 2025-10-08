/**
 * @module app/providers/workspace-provider
 * @description Workspace provider for managing workspace state
 */

import { useEffect, type ReactNode } from 'react';
import { useSession } from '@/entities/session';
import { useWorkspaces, useWorkspaceStore, getStoredWorkspaceId } from '@/entities/workspace';
import { useWorkspaceFromHostname } from '@/entities/sub-account/model/useWorkspaceFromHostname';

interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * Get the base domain for hostname detection
 * In development: localhost
 * In production: Extract from VITE_APP_URL or use a default
 */
function getBaseDomain(): string {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  try {
    const url = new URL(appUrl);
    const hostname = url.hostname;

    // In development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'localhost';
    }

    // In production, extract the base domain
    // e.g., "app.yourcrm.com" -> "yourcrm.com"
    // or "yourcrm.com" -> "yourcrm.com"
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }

    return hostname;
  } catch {
    return 'localhost';
  }
}

/**
 * WorkspaceProvider component
 * Loads user's workspaces and restores selected workspace from storage
 * Also handles automatic workspace detection from hostname (subdomain or custom domain)
 */
export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, isAuthenticated } = useSession();
  const { data: workspaces, isSuccess } = useWorkspaces(user?.id);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  // Hostname detection: Try to auto-load workspace from URL
  // This enables subdomain routing (client.yourcrm.com) and custom domains (crm.client.com)
  const baseDomain = getBaseDomain();
  useWorkspaceFromHostname(baseDomain, isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !isSuccess || !workspaces || workspaces.length === 0) {
      return;
    }

    // If no current workspace, try to restore from storage or set first workspace
    // Note: hostname detection (above) runs first and may have already set the workspace
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
