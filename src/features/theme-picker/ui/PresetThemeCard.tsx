/**
 * @module features/theme-picker
 * @description Preset theme card component
 */

import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

interface PresetThemeCardProps {
  name: string;
  theme: WorkspaceTheme;
  isActive: boolean;
  onClick: () => void;
}

export function PresetThemeCard({ name, theme, isActive, onClick }: PresetThemeCardProps) {
  const displayName = name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50',
        isActive ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Theme name */}
      <div className="text-sm font-medium">{displayName}</div>

      {/* Color swatches */}
      <div className="flex gap-2">
        <div
          className="h-8 flex-1 rounded border border-border"
          style={{ backgroundColor: theme.primary_color }}
          title={`Primary: ${theme.primary_color}`}
        />
        <div
          className="h-8 flex-1 rounded border border-border"
          style={{ backgroundColor: theme.secondary_color }}
          title={`Secondary: ${theme.secondary_color}`}
        />
        <div
          className="h-8 flex-1 rounded border border-border"
          style={{ backgroundColor: theme.accent_color }}
          title={`Accent: ${theme.accent_color}`}
        />
      </div>

      {/* Theme mode badge */}
      <div className="text-xs text-muted-foreground">
        {theme.theme_mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </div>
    </button>
  );
}
