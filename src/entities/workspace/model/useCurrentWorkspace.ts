/**
 * @module entities/workspace/model
 * @description Current workspace management with Zustand
 */

import { create } from 'zustand';
import type { Workspace } from '@/shared/lib/auth/types.js';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/shared/lib/storage';

interface WorkspaceStore {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  clearCurrentWorkspace: () => void;
}

/**
 * Workspace store with localStorage persistence
 */
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  currentWorkspace: null,

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
    if (workspace) {
      setStorageItem(STORAGE_KEYS.CURRENT_WORKSPACE_ID, workspace.id);
    }
  },

  clearCurrentWorkspace: () => {
    set({ currentWorkspace: null });
    localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKSPACE_ID);
  },
}));

/**
 * Hook to access current workspace
 */
export function useCurrentWorkspace() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const clearCurrentWorkspace = useWorkspaceStore((state) => state.clearCurrentWorkspace);

  return {
    currentWorkspace,
    setCurrentWorkspace,
    clearCurrentWorkspace,
  };
}

/**
 * Get stored workspace ID from localStorage
 */
export function getStoredWorkspaceId(): string | null {
  return getStorageItem<string>(STORAGE_KEYS.CURRENT_WORKSPACE_ID);
}
