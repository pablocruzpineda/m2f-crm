/**
 * @module app/providers
 * @description Theme provider that applies workspace theme on mount
 */

import { useEffect } from 'react';
import { useCurrentWorkspace } from '@/entities/workspace';
import { applyTheme } from '@/shared/lib/theme';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    try {
      if (currentWorkspace?.theme_config) {
        // Parse theme config (it might be a JSON string or already an object)
        let themeConfig: WorkspaceTheme;
        
        if (typeof currentWorkspace.theme_config === 'string') {
          themeConfig = JSON.parse(currentWorkspace.theme_config);
        } else if (typeof currentWorkspace.theme_config === 'object') {
          themeConfig = currentWorkspace.theme_config as unknown as WorkspaceTheme;
        } else {
          // If theme_config is not valid, use default theme
          console.warn('Invalid theme_config format, using default theme');
          themeConfig = {
            primary_color: '#4F46E5',
            secondary_color: '#10B981',
            accent_color: '#F59E0B',
            theme_mode: 'light',
          };
        }
        
        applyTheme(themeConfig);
      }

      // Save logo to localStorage for instant loading on next visit
      if (currentWorkspace?.logo_url) {
        try {
          localStorage.setItem('workspace-logo', currentWorkspace.logo_url);
        } catch (error) {
          console.error('Failed to save logo to localStorage:', error);
        }
      } else {
        // Remove logo if workspace has no logo
        try {
          localStorage.removeItem('workspace-logo');
        } catch (error) {
          console.error('Failed to remove logo from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      // Apply default theme on error
      applyTheme({
        primary_color: '#4F46E5',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        theme_mode: 'light',
      });
    }
  }, [currentWorkspace?.theme_config, currentWorkspace?.logo_url]);

  return <>{children}</>;
}
