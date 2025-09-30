/**
 * @module features/theme-picker
 * @description Main theme picker component
 */

import { Moon, Sun } from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { ColorPicker } from './ColorPicker';
import { PresetThemeCard } from './PresetThemeCard';
import { DEFAULT_THEMES } from '@/shared/lib/theme';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

interface ThemePickerProps {
  currentTheme: WorkspaceTheme;
  onThemeChange: (theme: WorkspaceTheme) => void;
}

export function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  const handlePresetSelect = (presetTheme: WorkspaceTheme) => {
    onThemeChange(presetTheme);
  };

  const handleColorChange = (colorKey: keyof Omit<WorkspaceTheme, 'theme_mode'>, value: string) => {
    onThemeChange({
      ...currentTheme,
      [colorKey]: value,
    });
  };

  const handleThemeModeToggle = (checked: boolean) => {
    onThemeChange({
      ...currentTheme,
      theme_mode: checked ? 'dark' : 'light',
    });
  };

  // Check if current theme matches any preset
  const isPresetActive = (preset: WorkspaceTheme) => {
    return (
      preset.primary_color === currentTheme.primary_color &&
      preset.secondary_color === currentTheme.secondary_color &&
      preset.accent_color === currentTheme.accent_color &&
      preset.theme_mode === currentTheme.theme_mode
    );
  };

  return (
    <div className="space-y-8">
      {/* Preset Themes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Preset Themes</h3>
          <p className="text-sm text-muted-foreground">
            Choose from our curated color palettes
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(DEFAULT_THEMES).map(([name, theme]) => (
            <PresetThemeCard
              key={name}
              name={name}
              theme={theme}
              isActive={isPresetActive(theme)}
              onClick={() => handlePresetSelect(theme)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Colors */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Custom Colors</h3>
          <p className="text-sm text-muted-foreground">
            Create your own color palette
          </p>
        </div>

        <div className="space-y-4">
          <ColorPicker
            label="Primary Color"
            value={currentTheme.primary_color}
            onChange={(color) => handleColorChange('primary_color', color)}
          />
          <ColorPicker
            label="Secondary Color"
            value={currentTheme.secondary_color}
            onChange={(color) => handleColorChange('secondary_color', color)}
          />
          <ColorPicker
            label="Accent Color"
            value={currentTheme.accent_color}
            onChange={(color) => handleColorChange('accent_color', color)}
          />
        </div>
      </div>

      <Separator />

      {/* Theme Mode */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark mode
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            {currentTheme.theme_mode === 'dark' ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="dark-mode" className="cursor-pointer">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                {currentTheme.theme_mode === 'dark' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <Switch
            id="dark-mode"
            checked={currentTheme.theme_mode === 'dark'}
            onCheckedChange={handleThemeModeToggle}
          />
        </div>
      </div>
    </div>
  );
}
