/**
 * @module pages/settings
 * @description Appearance settings page for workspace customization
 */

import { useState } from 'react';
import { Save, X, RotateCcw } from 'lucide-react';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useUploadLogo, useDeleteLogo, useUpdateTheme } from '@/entities/workspace';
import { ThemePicker } from '@/features/theme-picker';
import { ImageUpload } from '@/shared/ui/image-upload';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { PageHeader } from '@/shared/ui/layouts/PageHeader';
import { applyTheme } from '@/shared/lib/theme';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

// Default theme configuration
const DEFAULT_THEME: WorkspaceTheme = {
  primary_color: '#4F46E5',
  secondary_color: '#10B981',
  accent_color: '#F59E0B',
  theme_mode: 'light',
};

export function AppearanceSettingsPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  
  const uploadLogo = useUploadLogo(currentWorkspace?.id || '');
  const deleteLogo = useDeleteLogo(currentWorkspace?.id || '', currentWorkspace?.logo_storage_path || undefined);
  const updateTheme = useUpdateTheme(currentWorkspace?.id || '');

  // Parse theme_config from JSON
  const currentThemeConfig = currentWorkspace?.theme_config 
    ? (typeof currentWorkspace.theme_config === 'string' 
        ? JSON.parse(currentWorkspace.theme_config) 
        : currentWorkspace.theme_config) as WorkspaceTheme
    : {
        primary_color: '#4F46E5',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        theme_mode: 'light' as const,
      };

  const [previewTheme, setPreviewTheme] = useState<WorkspaceTheme | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetIncludeLogo, setResetIncludeLogo] = useState(false);

  if (!currentWorkspace) {
    return (
      <PageContainer>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </PageContainer>
    );
  }

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo.mutateAsync(file);
      console.log('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleLogoRemove = async () => {
    try {
      await deleteLogo.mutateAsync();
      console.log('Logo removed successfully');
    } catch (error) {
      console.error('Logo removal error:', error);
      alert('Failed to remove logo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleThemeChange = (theme: WorkspaceTheme) => {
    setPreviewTheme(theme);
    // Apply preview immediately
    applyTheme(theme);
  };

  const handleSaveTheme = async () => {
    if (!previewTheme) return;

    try {
      await updateTheme.mutateAsync(previewTheme);
      setPreviewTheme(null);
      console.log('Theme saved successfully');
    } catch (error) {
      console.error('Theme update error:', error);
      alert('Failed to save theme: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancelTheme = () => {
    setPreviewTheme(null);
    // Revert to original theme
    applyTheme(currentThemeConfig);
  };

  const handleResetToDefault = () => {
    setResetIncludeLogo(false); // Reset checkbox state
    setShowResetDialog(true);
  };

  const handleConfirmReset = async () => {
    try {
      // Apply default theme immediately
      applyTheme(DEFAULT_THEME);
      
      // Save theme to database
      await updateTheme.mutateAsync(DEFAULT_THEME);
      
      // Remove logo if user chose to
      if (resetIncludeLogo && currentWorkspace?.logo_storage_path) {
        await deleteLogo.mutateAsync();
      }
      
      // Clear preview state
      setPreviewTheme(null);
      
      // Close dialog
      setShowResetDialog(false);
      
      console.log(`Theme reset to default successfully${resetIncludeLogo ? ' (logo removed)' : ''}`);
    } catch (error) {
      console.error('Theme reset error:', error);
      alert('Failed to reset theme: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const activeTheme = previewTheme || currentThemeConfig;
  const hasUnsavedChanges = previewTheme !== null;

  return (
    <PageContainer>
      <PageHeader
        title="Appearance"
        description="Customize your workspace logo and theme"
      />

      <div className="space-y-6">
        {/* Logo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Logo</CardTitle>
            <CardDescription>
              Upload a custom logo for your workspace. Recommended size: 200x200px.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={currentWorkspace.logo_url}
              onUpload={handleLogoUpload}
              onRemove={currentWorkspace.logo_storage_path ? handleLogoRemove : undefined}
              isLoading={uploadLogo.isPending || deleteLogo.isPending}
              label="Upload Logo"
              maxSize={2 * 1024 * 1024} // 2MB
              acceptedFormats={['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']}
            />
          </CardContent>
        </Card>

        {/* Theme Customization Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Theme & Colors</CardTitle>
                <CardDescription>
                  Customize your workspace colors and appearance mode.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                disabled={updateTheme.isPending}
                title="Reset to default theme"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ThemePicker
              currentTheme={activeTheme}
              onThemeChange={handleThemeChange}
            />
          </CardContent>
          {hasUnsavedChanges && (
            <CardFooter className="flex gap-3 border-t bg-muted/50 py-4">
              <Button
                onClick={handleSaveTheme}
                disabled={updateTheme.isPending}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateTheme.isPending ? 'Saving...' : 'Save Theme'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelTheme}
                disabled={updateTheme.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Reset to Default Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to Default Theme</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset to the default theme? This will replace your current theme settings with the default Professional Blue theme.
            </DialogDescription>
          </DialogHeader>

          {/* Checkbox Option */}
          {currentWorkspace?.logo_url && (
            <div className="flex items-center space-x-2 rounded-md border border-border bg-muted/50 p-4">
              <Checkbox
                id="reset-logo"
                checked={resetIncludeLogo}
                onCheckedChange={(checked) => setResetIncludeLogo(checked === true)}
                disabled={updateTheme.isPending || deleteLogo.isPending}
              />
              <Label
                htmlFor="reset-logo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Also remove custom logo
              </Label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={updateTheme.isPending || deleteLogo.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReset}
              disabled={updateTheme.isPending || deleteLogo.isPending}
            >
              {updateTheme.isPending || deleteLogo.isPending ? 'Resetting...' : 'Reset Theme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
