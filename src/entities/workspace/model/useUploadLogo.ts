/**
 * @module entities/workspace/model
 * @description Hook for uploading workspace logo
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadWorkspaceLogo, updateWorkspaceLogo, deleteWorkspaceLogo } from '../api/workspaceApi';
import { useWorkspaceStore } from './useCurrentWorkspace';

/**
 * Hook for uploading workspace logo
 */
export function useUploadLogo(workspaceId: string) {
  const queryClient = useQueryClient();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: async (file: File) => {
      // Upload file to storage
      const { url, path } = await uploadWorkspaceLogo(workspaceId, file);
      
      // Update workspace record with logo URL
      await updateWorkspaceLogo(workspaceId, url, path);
      
      return { url, path };
    },
    onSuccess: (data) => {
      // Update Zustand store immediately
      if (currentWorkspace) {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo_url: data.url,
          logo_storage_path: data.path,
        });
      }
      
      // Save logo URL to localStorage for instant loading
      try {
        localStorage.setItem('workspace-logo', data.url);
      } catch (error) {
        console.error('Failed to save logo to localStorage:', error);
      }
      
      // Invalidate workspace queries to refetch with new logo
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
}

/**
 * Hook for deleting workspace logo
 */
export function useDeleteLogo(workspaceId: string, storagePath?: string) {
  const queryClient = useQueryClient();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: async () => {
      if (!storagePath) {
        throw new Error('No logo to delete');
      }
      await deleteWorkspaceLogo(workspaceId, storagePath);
    },
    onSuccess: () => {
      // Update Zustand store immediately
      if (currentWorkspace) {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo_url: null,
          logo_storage_path: null,
        });
      }
      
      // Remove logo from localStorage
      try {
        localStorage.removeItem('workspace-logo');
      } catch (error) {
        console.error('Failed to remove logo from localStorage:', error);
      }
      
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
}
