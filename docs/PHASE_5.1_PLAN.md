# Phase 5.1: Customization - Implementation Plan

**Phase**: 5.1  
**Feature**: Logo Upload & Theming  
**Estimated Time**: 3-5 days  
**Prerequisites**: Phase 5 complete, Supabase Storage available  
**Date Created**: September 30, 2025

---

## Overview

Phase 5.1 adds workspace customization capabilities, allowing users to:
1. Upload custom logos for their workspace
2. Customize the color theme and branding
3. Toggle between light and dark modes

This phase focuses on **quick wins** with high visual impact while establishing the foundation for workspace settings management.

---

## Goals

### Primary Goals
- ✅ Enable logo upload per workspace
- ✅ Display logo in sidebar, header, and login
- ✅ Implement theme customization (primary, secondary, accent colors)
- ✅ Support light/dark mode toggle
- ✅ Provide preset theme options

### Secondary Goals
- ✅ Create reusable settings infrastructure
- ✅ Optimize logo storage and delivery
- ✅ Ensure theme persistence across sessions
- ✅ Provide theme preview before applying

---

## Technical Architecture

### Database Schema Changes

**Add columns to `workspaces` table:**
```sql
ALTER TABLE workspaces 
  ADD COLUMN logo_url TEXT,
  ADD COLUMN logo_storage_path TEXT,
  ADD COLUMN theme_config JSONB DEFAULT '{
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981", 
    "accent_color": "#F59E0B",
    "theme_mode": "light"
  }'::jsonb;
```

### Supabase Storage

**Bucket Configuration:**
- **Bucket Name**: `workspace-logos`
- **Public Access**: Yes (logos need to be publicly accessible)
- **File Size Limit**: 2MB
- **Allowed Formats**: PNG, JPG, JPEG, SVG
- **File Naming**: `{workspace_id}/{timestamp}-{filename}`

**Storage Policies:**
- Users can upload logos to their own workspace folder
- Users can view logos from any workspace (public read)
- Users can delete only their workspace logos

### Theme System Architecture

**CSS Variables Approach:**
```css
:root {
  --color-primary: #4F46E5;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  /* ... more variables */
}

.dark {
  --color-primary: #6366F1;
  /* ... dark mode overrides */
}
```

**Theme Application Flow:**
```
User changes theme → Update DB → Apply CSS variables → Persist in localStorage
```

---

## Implementation Steps

### Step 1: Database Migration (30 minutes)

**File**: `supabase/migrations/012_add_workspace_customization.sql`

**Tasks:**
- [ ] Add logo columns to workspaces table
- [ ] Add theme_config JSONB column with default
- [ ] Create indexes if needed
- [ ] Test migration on dev database

**SQL Schema:**
```sql
-- Add customization columns
ALTER TABLE workspaces 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981", 
    "accent_color": "#F59E0B",
    "theme_mode": "light"
  }'::jsonb;

-- Add comment
COMMENT ON COLUMN workspaces.theme_config IS 'Workspace theme configuration including colors and mode';
```

---

### Step 2: Supabase Storage Setup (45 minutes)

**Bucket Creation:**
- [ ] Create `workspace-logos` bucket via Supabase dashboard or SQL
- [ ] Configure public access
- [ ] Set file size limits (2MB)

**Storage Policies:**
```sql
-- Allow authenticated users to upload logos to their workspace
CREATE POLICY "Users can upload workspace logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workspace-logos' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Allow everyone to view logos (public read)
CREATE POLICY "Anyone can view workspace logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workspace-logos');

-- Allow users to delete their workspace logos
CREATE POLICY "Users can delete their workspace logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'workspace-logos' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);
```

**MIME Type Configuration:**
```sql
-- In Supabase dashboard or via SQL
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml'
]
WHERE id = 'workspace-logos';
```

---

### Step 3: Types & Utilities (1 hour)

**File**: `src/shared/lib/database/types.ts`

**Add Types:**
```typescript
export interface WorkspaceTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: 'light' | 'dark';
}

export interface UpdateWorkspaceInput {
  logo_url?: string;
  logo_storage_path?: string;
  theme_config?: WorkspaceTheme;
}
```

**File**: `src/shared/lib/theme/themeUtils.ts`

**Theme Utilities:**
```typescript
export const DEFAULT_THEMES: Record<string, WorkspaceTheme> = {
  professional_blue: {
    primary_color: '#4F46E5',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    theme_mode: 'light',
  },
  modern_purple: {
    primary_color: '#8B5CF6',
    secondary_color: '#EC4899',
    accent_color: '#F97316',
    theme_mode: 'light',
  },
  fresh_green: {
    primary_color: '#10B981',
    secondary_color: '#3B82F6',
    accent_color: '#F59E0B',
    theme_mode: 'light',
  },
};

export function applyTheme(theme: WorkspaceTheme) {
  const root = document.documentElement;
  
  // Apply color variables
  root.style.setProperty('--color-primary', theme.primary_color);
  root.style.setProperty('--color-secondary', theme.secondary_color);
  root.style.setProperty('--color-accent', theme.accent_color);
  
  // Apply theme mode class
  root.classList.remove('light', 'dark');
  root.classList.add(theme.theme_mode);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
```

---

### Step 4: Workspace API Updates (1 hour)

**File**: `src/entities/workspace/api/workspaceApi.ts`

**Add Functions:**
```typescript
/**
 * Upload workspace logo
 */
export async function uploadWorkspaceLogo(
  workspaceId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${workspaceId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('workspace-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('workspace-logos')
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
}

/**
 * Delete workspace logo
 */
export async function deleteWorkspaceLogo(
  workspaceId: string,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from('workspace-logos')
    .remove([path]);

  if (error) {
    throw error;
  }

  // Update workspace record
  await supabase
    .from('workspaces')
    .update({
      logo_url: null,
      logo_storage_path: null,
    })
    .eq('id', workspaceId);
}

/**
 * Update workspace theme
 */
export async function updateWorkspaceTheme(
  workspaceId: string,
  theme: WorkspaceTheme
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({ theme_config: theme })
    .eq('id', workspaceId);

  if (error) {
    throw error;
  }
}

/**
 * Update workspace logo URL
 */
export async function updateWorkspaceLogo(
  workspaceId: string,
  logoUrl: string,
  logoPath: string
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      logo_url: logoUrl,
      logo_storage_path: logoPath,
    })
    .eq('id', workspaceId);

  if (error) {
    throw error;
  }
}
```

---

### Step 5: React Hooks (1 hour)

**File**: `src/entities/workspace/model/useUploadLogo.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadWorkspaceLogo, updateWorkspaceLogo } from '../api/workspaceApi';

export function useUploadLogo(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { url, path } = await uploadWorkspaceLogo(workspaceId, file);
      await updateWorkspaceLogo(workspaceId, url, path);
      return { url, path };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
}
```

**File**: `src/entities/workspace/model/useUpdateTheme.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkspaceTheme } from '../api/workspaceApi';
import { applyTheme } from '@/shared/lib/theme/themeUtils';
import type { WorkspaceTheme } from '@/shared/lib/database/types';

export function useUpdateTheme(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: WorkspaceTheme) => {
      await updateWorkspaceTheme(workspaceId, theme);
      return theme;
    },
    onSuccess: (theme) => {
      // Apply theme immediately
      applyTheme(theme);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
}
```

**Update**: `src/entities/workspace/index.ts`
```typescript
export { useUploadLogo } from './model/useUploadLogo';
export { useUpdateTheme } from './model/useUpdateTheme';
```

---

### Step 6: Logo Upload Component (2 hours)

**File**: `src/shared/ui/image-upload.tsx`

**Reusable Image Upload Component:**
```typescript
interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  maxSize?: number; // in bytes
  acceptedFormats?: string[];
  isLoading?: boolean;
  label?: string;
}

export function ImageUpload({
  currentImage,
  onUpload,
  onRemove,
  maxSize = 2 * 1024 * 1024, // 2MB default
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  isLoading = false,
  label = 'Upload Image',
}: ImageUploadProps) {
  // Implementation with:
  // - File input with drag-and-drop
  // - Image preview
  // - Validation (size, format)
  // - Upload progress
  // - Remove button
}
```

**Features:**
- Drag-and-drop zone
- Click to browse
- Image preview
- Format validation
- Size validation
- Loading state
- Error handling

---

### Step 7: Theme Picker Component (2 hours)

**File**: `src/features/theme-picker/ui/ThemePicker.tsx`

**Component Structure:**
```typescript
interface ThemePickerProps {
  currentTheme: WorkspaceTheme;
  onThemeChange: (theme: WorkspaceTheme) => void;
  isLoading?: boolean;
}

export function ThemePicker({
  currentTheme,
  onThemeChange,
  isLoading
}: ThemePickerProps) {
  return (
    <div className="space-y-6">
      {/* Preset Themes */}
      <div>
        <h3>Preset Themes</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(DEFAULT_THEMES).map(([name, theme]) => (
            <PresetThemeCard
              key={name}
              name={name}
              theme={theme}
              isActive={/* check if active */}
              onClick={() => onThemeChange(theme)}
            />
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h3>Custom Colors</h3>
        <ColorPicker
          label="Primary Color"
          value={currentTheme.primary_color}
          onChange={(color) => onThemeChange({ ...currentTheme, primary_color: color })}
        />
        <ColorPicker
          label="Secondary Color"
          value={currentTheme.secondary_color}
          onChange={(color) => onThemeChange({ ...currentTheme, secondary_color: color })}
        />
        <ColorPicker
          label="Accent Color"
          value={currentTheme.accent_color}
          onChange={(color) => onThemeChange({ ...currentTheme, accent_color: color })}
        />
      </div>

      {/* Theme Mode */}
      <div>
        <Toggle
          label="Dark Mode"
          checked={currentTheme.theme_mode === 'dark'}
          onChange={(checked) => 
            onThemeChange({ ...currentTheme, theme_mode: checked ? 'dark' : 'light' })
          }
        />
      </div>

      {/* Preview */}
      <ThemePreview theme={currentTheme} />
    </div>
  );
}
```

**Sub-components:**
- `PresetThemeCard` - Visual card with theme colors
- `ColorPicker` - HTML5 color input with hex display
- `ThemePreview` - Live preview of theme on sample UI elements

---

### Step 8: Settings Page (3 hours)

**File**: `src/pages/settings/ui/AppearanceSettingsPage.tsx`

**Page Structure:**
```typescript
export function AppearanceSettingsPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const uploadLogo = useUploadLogo(currentWorkspace?.id);
  const updateTheme = useUpdateTheme(currentWorkspace?.id);
  
  const [previewTheme, setPreviewTheme] = useState<WorkspaceTheme | null>(null);

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo.mutateAsync(file);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  const handleThemeChange = (theme: WorkspaceTheme) => {
    setPreviewTheme(theme);
    // Apply preview immediately (before save)
    applyTheme(theme);
  };

  const handleSaveTheme = async () => {
    if (!previewTheme) return;
    
    try {
      await updateTheme.mutateAsync(previewTheme);
      setPreviewTheme(null);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Appearance"
        description="Customize your workspace logo and theme"
      />

      <div className="space-y-8">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <h2>Workspace Logo</h2>
            <p>Upload a custom logo for your workspace</p>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={currentWorkspace?.logo_url}
              onUpload={handleLogoUpload}
              isLoading={uploadLogo.isPending}
              label="Upload Logo"
            />
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <h2>Theme & Colors</h2>
            <p>Customize your workspace colors and appearance</p>
          </CardHeader>
          <CardContent>
            <ThemePicker
              currentTheme={previewTheme || currentWorkspace?.theme_config}
              onThemeChange={handleThemeChange}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveTheme}
              disabled={!previewTheme}
              isLoading={updateTheme.isPending}
            >
              Save Theme
            </Button>
            {previewTheme && (
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewTheme(null);
                  applyTheme(currentWorkspace?.theme_config);
                }}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
```

**Add Route:**
- Path: `/settings/appearance`
- Add to settings navigation

---

### Step 9: Display Logo in UI (2 hours)

**Update Components:**

**1. Sidebar** (`src/widgets/app-sidebar/ui/AppSidebar.tsx`):
```typescript
// Replace static logo with workspace logo
{currentWorkspace?.logo_url ? (
  <img 
    src={currentWorkspace.logo_url} 
    alt={currentWorkspace.name}
    className="h-8 w-auto"
  />
) : (
  <Building2 className="h-8 w-8 text-primary" />
)}
```

**2. Header** (`src/widgets/app-header/ui/AppHeader.tsx`):
```typescript
// Show logo in header (mobile view)
{currentWorkspace?.logo_url && (
  <img 
    src={currentWorkspace.logo_url} 
    alt={currentWorkspace.name}
    className="h-6 w-auto"
  />
)}
```

**3. Login Page** (optional):
```typescript
// Show workspace logo if accessing workspace-specific login
```

---

### Step 10: Theme Initialization (1 hour)

**File**: `src/app/providers/ThemeProvider.tsx`

**Theme Provider:**
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    if (currentWorkspace?.theme_config) {
      applyTheme(currentWorkspace.theme_config);
    }
  }, [currentWorkspace?.theme_config]);

  return <>{children}</>;
}
```

**Update**: `src/App.tsx`
```typescript
<QueryProvider>
  <AuthProvider>
    <WorkspaceProvider>
      <ThemeProvider>
        {/* Routes */}
      </ThemeProvider>
    </WorkspaceProvider>
  </AuthProvider>
</QueryProvider>
```

---

### Step 11: Testing & Polish (2 hours)

**Manual Testing Checklist:**
- [ ] Upload PNG logo (< 2MB)
- [ ] Upload JPG logo
- [ ] Upload SVG logo
- [ ] Try uploading file > 2MB (should fail)
- [ ] Try uploading invalid format (should fail)
- [ ] Delete logo
- [ ] Apply preset theme (each one)
- [ ] Customize primary color
- [ ] Customize secondary color
- [ ] Customize accent color
- [ ] Toggle dark mode
- [ ] Save theme
- [ ] Refresh page (theme persists)
- [ ] Switch workspace (logo/theme changes)
- [ ] Logo displays in sidebar
- [ ] Logo displays in header
- [ ] Theme colors apply throughout app

**Error Scenarios:**
- [ ] Network error during upload
- [ ] Invalid file format
- [ ] File too large
- [ ] Storage quota exceeded
- [ ] Invalid color hex value

**Performance:**
- [ ] Logo loads quickly
- [ ] Theme changes are instant
- [ ] No layout shift when logo loads

---

## File Structure

```
src/
├── entities/
│   └── workspace/
│       ├── api/
│       │   └── workspaceApi.ts (updated with logo/theme functions)
│       ├── model/
│       │   ├── useUploadLogo.ts (new)
│       │   └── useUpdateTheme.ts (new)
│       └── index.ts (updated exports)
├── features/
│   └── theme-picker/
│       ├── ui/
│       │   ├── ThemePicker.tsx (new)
│       │   ├── PresetThemeCard.tsx (new)
│       │   ├── ColorPicker.tsx (new)
│       │   └── ThemePreview.tsx (new)
│       └── index.ts (new)
├── pages/
│   └── settings/
│       └── ui/
│           └── AppearanceSettingsPage.tsx (new)
├── shared/
│   ├── lib/
│   │   ├── database/
│   │   │   └── types.ts (updated with WorkspaceTheme)
│   │   └── theme/
│   │       └── themeUtils.ts (new)
│   └── ui/
│       └── image-upload.tsx (new)
├── widgets/
│   ├── app-sidebar/
│   │   └── ui/
│   │       └── AppSidebar.tsx (updated - show logo)
│   └── app-header/
│       └── ui/
│           └── AppHeader.tsx (updated - show logo)
├── app/
│   └── providers/
│       └── ThemeProvider.tsx (new)
└── supabase/
    └── migrations/
        └── 012_add_workspace_customization.sql (new)
```

---

## Dependencies

**New NPM Packages:**
None - using existing dependencies

**Supabase Features:**
- ✅ Storage (already available)
- ✅ RLS policies (existing)
- ✅ JSONB columns (PostgreSQL native)

---

## Success Criteria

### Must Have (MVP)
- [x] Users can upload workspace logo (PNG, JPG, SVG)
- [x] Logo displays in sidebar
- [x] Users can select preset theme
- [x] Users can customize colors (primary, secondary, accent)
- [x] Theme persists across sessions
- [x] Dark mode toggle works

### Nice to Have
- [ ] Logo displays in header
- [ ] Logo on login page
- [ ] Theme preview before saving
- [ ] Undo theme changes
- [ ] Export/import theme configuration
- [ ] Multiple logo variants (light/dark)

### Performance
- Logo loads in < 1 second
- Theme changes are instant
- No visual flicker on page load

---

## Risk Assessment

### Low Risk
- Logo upload (straightforward Supabase Storage)
- Basic theming (CSS variables)
- Database schema changes (additive only)

### Medium Risk
- Theme application across all components (CSS variable coverage)
- Dark mode support (may need additional styling)
- Logo aspect ratio handling (could look stretched)

### Mitigation
- Test theme on all major components before release
- Provide logo upload guidelines (recommended dimensions)
- Add logo preview before final upload
- Implement proper error handling for storage failures

---

## Timeline Estimate

| Step | Task | Time | Cumulative |
|------|------|------|------------|
| 1 | Database Migration | 0.5h | 0.5h |
| 2 | Supabase Storage Setup | 0.75h | 1.25h |
| 3 | Types & Utilities | 1h | 2.25h |
| 4 | Workspace API Updates | 1h | 3.25h |
| 5 | React Hooks | 1h | 4.25h |
| 6 | Logo Upload Component | 2h | 6.25h |
| 7 | Theme Picker Component | 2h | 8.25h |
| 8 | Settings Page | 3h | 11.25h |
| 9 | Display Logo in UI | 2h | 13.25h |
| 10 | Theme Initialization | 1h | 14.25h |
| 11 | Testing & Polish | 2h | 16.25h |

**Total**: ~16-17 hours (~2-3 days with breaks)

---

## Documentation Updates

**After Completion:**
- [ ] Create `PHASE_5.1_COMPLETE.md`
- [ ] Update `PROGRESS.md`
- [ ] Add screenshots to documentation
- [ ] Document logo upload guidelines
- [ ] Document theme customization process

---

## Next Steps (After Phase 5.1)

Once Phase 5.1 is complete, move to:
- **Phase 5.2**: Chat Integration (WhatsApp Bridge)

Settings infrastructure created here will be reused for:
- Chat API key storage
- Webhook URL configuration
- Future integration settings

---

**Ready to implement? Let's start with Step 1: Database Migration!** 🚀
