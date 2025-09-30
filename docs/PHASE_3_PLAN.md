# Phase 3: Core Layout & Navigation - Implementation Plan

## Overview

Build the main application shell with navigation, header, and dashboard layout. This phase creates the foundation for all future feature pages.

## Goals

- ✅ Create responsive application layout
- ✅ Build sidebar navigation
- ✅ Implement header with user menu
- ✅ Add workspace switcher
- ✅ Create dashboard page
- ✅ Set up page layout components

## Architecture Layers (FSD)

### Widgets (Complex UI Blocks)
- `AppSidebar` - Main navigation sidebar
- `AppHeader` - Top header with user menu
- `WorkspaceSwitcher` - Switch between workspaces

### Features (User Interactions)
- `user-menu` - User dropdown with logout
- `theme-toggle` - Light/dark mode switcher (future)

### Entities (Business Logic)
- Already have: `user`, `workspace`, `session`

### Shared (Reusable Components)
- Layout primitives (Container, PageHeader, etc.)
- Navigation components
- Card components

## Implementation Order

### Step 1: Shared Layout Components (20 min)
- [ ] `MainLayout` - App shell component
- [ ] `PageContainer` - Standard page wrapper
- [ ] `PageHeader` - Page title and actions
- [ ] `EmptyState` - Empty state placeholder
- [ ] `LoadingSkeleton` - Loading states

### Step 2: Sidebar Widget (25 min)
- [ ] `AppSidebar` component
- [ ] Navigation items configuration
- [ ] Active route detection
- [ ] Collapse/expand functionality
- [ ] Mobile responsive menu

### Step 3: Header Widget (25 min)
- [ ] `AppHeader` component
- [ ] User avatar and menu
- [ ] Workspace switcher
- [ ] Notifications icon (placeholder)

### Step 4: User Menu Feature (15 min)
- [ ] `UserMenu` dropdown component
- [ ] Profile link
- [ ] Settings link
- [ ] Logout button integration

### Step 5: Dashboard Page (30 min)
- [ ] Dashboard layout
- [ ] Welcome section with user name
- [ ] Stats cards (placeholders)
- [ ] Recent activity section
- [ ] Quick actions

### Step 6: Update Routing (15 min)
- [ ] Add dashboard route
- [ ] Update protected routes to use MainLayout
- [ ] Add redirect from `/` to `/dashboard`

### Step 7: Testing & Polish (15 min)
- [ ] Test navigation between pages
- [ ] Verify responsive behavior
- [ ] Check all links work
- [ ] Verify logout functionality

## Total Estimated Time: ~2.5 hours

## File Structure

```
src/
├── widgets/
│   ├── app-sidebar/
│   │   ├── ui/
│   │   │   └── AppSidebar.tsx
│   │   ├── config/
│   │   │   └── navigation.ts
│   │   └── index.ts
│   ├── app-header/
│   │   ├── ui/
│   │   │   └── AppHeader.tsx
│   │   └── index.ts
│   └── workspace-switcher/
│       ├── ui/
│       │   └── WorkspaceSwitcher.tsx
│       └── index.ts
│
├── features/
│   ├── user-menu/
│   │   ├── ui/
│   │   │   └── UserMenu.tsx
│   │   └── index.ts
│   └── theme-toggle/ (future)
│
├── pages/
│   ├── dashboard/
│   │   ├── ui/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── WelcomeSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── index.ts
│   └── index.ts (update)
│
└── shared/
    ├── ui/
    │   ├── layouts/
    │   │   ├── MainLayout.tsx
    │   │   ├── PageContainer.tsx
    │   │   └── PageHeader.tsx
    │   ├── empty-state/
    │   │   └── EmptyState.tsx
    │   └── skeleton/
    │       └── LoadingSkeleton.tsx
    └── lib/
        └── navigation/
            └── types.ts
```

## Key Features

### 1. Responsive Sidebar
- Collapsible on desktop
- Drawer on mobile
- Persistent state (localStorage)
- Active route highlighting

### 2. Header Features
- User avatar with fallback
- Dropdown menu (profile, settings, logout)
- Workspace switcher (when multiple workspaces)
- Breadcrumbs (future enhancement)

### 3. Dashboard
- Personalized welcome message
- Quick stats overview
- Recent activity feed
- Quick action buttons
- Empty states

### 4. Navigation Items
- 🏠 Dashboard
- 👥 Contacts (placeholder)
- 📊 Pipelines (placeholder)
- 💬 Chat (placeholder)
- ⚙️ Settings (placeholder)

## Technical Decisions

### Layout Strategy
- **Fixed sidebar** on desktop (250px width)
- **Overlay drawer** on mobile
- **Sticky header** at top
- **Scrollable content** area

### State Management
- Sidebar collapse state in `localStorage`
- Active workspace in Zustand store (already exists)
- Navigation handled by React Router

### Styling
- Tailwind CSS for all styling
- Shadcn/UI components where applicable
- CSS variables for theming (future)

### Icons
- Lucide React for all icons
- Consistent 20px size
- Stroke width: 2

## Component Props

### MainLayout
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}
```

### AppSidebar
```typescript
interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
```

### UserMenu
```typescript
interface UserMenuProps {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}
```

### PageContainer
```typescript
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}
```

## Success Criteria

- [ ] User can navigate between pages using sidebar
- [ ] Sidebar collapses/expands correctly
- [ ] Mobile menu opens/closes properly
- [ ] User menu displays profile info
- [ ] Logout works from user menu
- [ ] Active route is highlighted in navigation
- [ ] Dashboard shows personalized content
- [ ] All layouts are responsive (mobile, tablet, desktop)
- [ ] No TypeScript errors
- [ ] No console errors

## Next Steps After Phase 3

Phase 4 will build:
- Contact management database tables
- Contact CRUD operations
- Contact list and detail views
- Contact search and filters

---

**Let's build the core layout!** 🏗️
