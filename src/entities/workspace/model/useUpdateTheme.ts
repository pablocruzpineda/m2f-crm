/**
 * @module entities/workspace/model
 * @description Hook for updating workspace theme
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkspaceTheme } from '../api/workspaceApi';
import { applyTheme } from '@/shared/lib/theme';
import { useWorkspaceStore } from './useCurrentWorkspace';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

/**
 * Hook for updating workspace theme
 */
export function useUpdateTheme(workspaceId: string) {
  const queryClient = useQueryClient();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: async (theme: WorkspaceTheme) => {
      // Update in database
      await updateWorkspaceTheme(workspaceId, theme as never);
      return theme;
    },
    onSuccess: (theme) => {
      // Apply theme immediately to DOM
      applyTheme(theme);
      
      // Update Zustand store immediately
      if (currentWorkspace) {
        setCurrentWorkspace({
          ...currentWorkspace,
          theme_config: theme as never,
        });
      }
      
      // Invalidate queries to refetch workspace data
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
}
