import type { WorkspaceTheme } from '@/shared/lib/database/types';

/**
 * Default preset themes for workspaces
 */
export const DEFAULT_THEMES: Record<string, WorkspaceTheme> = {
  professional_blue: {
    primary_color: '#4F46E5', // Indigo
    secondary_color: '#10B981', // Emerald
    accent_color: '#F59E0B', // Amber
    theme_mode: 'light',
  },
  modern_purple: {
    primary_color: '#8B5CF6', // Violet
    secondary_color: '#EC4899', // Pink
    accent_color: '#F97316', // Orange
    theme_mode: 'light',
  },
  fresh_green: {
    primary_color: '#10B981', // Emerald
    secondary_color: '#3B82F6', // Blue
    accent_color: '#F59E0B', // Amber
    theme_mode: 'light',
  },
  elegant_dark: {
    primary_color: '#6366F1', // Indigo (lighter for dark mode)
    secondary_color: '#14B8A6', // Teal
    accent_color: '#FBBF24', // Amber (lighter)
    theme_mode: 'dark',
  },
};

/**
 * Apply theme to the document root
 */
export function applyTheme(theme: WorkspaceTheme): void {
  if (!theme) {
    console.warn('No theme provided to applyTheme');
    return;
  }

  const root = document.documentElement;

  // Apply color CSS variables in HSL format (shadcn/ui format)
  if (theme.primary_color) {
    const primaryHsl = hexToHsl(theme.primary_color);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--ring', primaryHsl); // Ring color matches primary
  }
  
  if (theme.secondary_color) {
    const secondaryHsl = hexToHsl(theme.secondary_color);
    root.style.setProperty('--secondary', secondaryHsl);
  }
  
  if (theme.accent_color) {
    const accentHsl = hexToHsl(theme.accent_color);
    root.style.setProperty('--accent', accentHsl);
  }

  // Apply theme mode class
  if (theme.theme_mode) {
    root.classList.remove('light', 'dark');
    root.classList.add(theme.theme_mode);
  }

  // Store entire theme in localStorage for instant apply on page load
  try {
    localStorage.setItem('workspace-theme', JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

/**
 * Get the current theme mode from localStorage or system preference
 */
export function getStoredThemeMode(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Handle undefined/null/empty string
  if (!hex || typeof hex !== 'string') {
    console.warn('Invalid hex color provided to hexToRgb:', hex);
    return { r: 0, g: 0, b: 0 };
  }

  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse hex values
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

  if (!result || !result[1] || !result[2] || !result[3]) {
    // Return black as fallback
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert hex color to HSL format for CSS variables
 */
export function hexToHsl(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  
  // Convert RGB to 0-1 range
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r1:
        h = ((g1 - b1) / diff + (g1 < b1 ? 6 : 0)) / 6;
        break;
      case g1:
        h = ((b1 - r1) / diff + 2) / 6;
        break;
      case b1:
        h = ((r1 - g1) / diff + 4) / 6;
        break;
    }
  }
  
  // Convert to HSL format (h in degrees, s and l in percentages)
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  // Return in the format expected by shadcn/ui: "h s% l%"
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Check if a color is valid hex format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Get a lighter shade of a color
 */
export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  
  return rgbToHex(newR, newG, newB);
}

/**
 * Get a darker shade of a color
 */
export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  
  const newR = Math.max(0, Math.floor(r - r * (percent / 100)));
  const newG = Math.max(0, Math.floor(g - g * (percent / 100)));
  const newB = Math.max(0, Math.floor(b - b * (percent / 100)));
  
  return rgbToHex(newR, newG, newB);
}
