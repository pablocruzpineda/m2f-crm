# Phase 2: Authentication System - Implementation Plan

## Overview
Build complete authentication flow with workspace creation, session management, and protected routes.

## Architecture Layers (FSD)

### 1. Shared Layer (Foundation)
- Auth types and schemas
- Supabase auth helpers
- Storage utilities

### 2. Entities Layer (Business Logic)
- User entity with hooks
- Workspace entity with hooks
- Session entity

### 3. Features Layer (User Actions)
- Login feature
- Signup feature
- Logout feature
- Workspace switcher feature
- Password reset feature

### 4. Pages Layer (Routes)
- Login page
- Signup page
- Reset password page

### 5. App Layer (Providers)
- Auth provider
- Workspace provider
- Protected route wrapper

## Implementation Order

### Step 1: Shared Infrastructure (15 min)
- [ ] Auth schemas (Zod)
- [ ] Auth types
- [ ] Storage helpers (localStorage)
- [ ] Error messages constants

### Step 2: Entities (20 min)
- [ ] useUser hook
- [ ] useSession hook
- [ ] useWorkspace hook
- [ ] User profile queries

### Step 3: Auth Provider (15 min)
- [ ] AuthContext
- [ ] AuthProvider component
- [ ] Session state management
- [ ] Auth state listener

### Step 4: Features (45 min)
- [ ] Login form component
- [ ] Signup form component
- [ ] Logout button
- [ ] Workspace switcher
- [ ] Password reset form

### Step 5: Pages (20 min)
- [ ] Login page
- [ ] Signup page
- [ ] Reset password page
- [ ] Email verification page

### Step 6: Protected Routes (15 min)
- [ ] ProtectedRoute wrapper
- [ ] RequireAuth component
- [ ] RequireWorkspace component

### Step 7: Integration (15 min)
- [ ] Update App.tsx with providers
- [ ] Add auth routes to router
- [ ] Test authentication flow

## Total Estimated Time: ~2.5 hours

## File Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── auth-provider.tsx
│   │   └── index.ts
│   └── App.tsx (update)
│
├── pages/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── ui/
│   │   │   │   └── LoginPage.tsx
│   │   │   └── index.ts
│   │   ├── signup/
│   │   │   ├── ui/
│   │   │   │   └── SignupPage.tsx
│   │   │   └── index.ts
│   │   └── reset-password/
│   │       ├── ui/
│   │       │   └── ResetPasswordPage.tsx
│   │       └── index.ts
│   └── index.ts
│
├── features/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── ui/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── model/
│   │   │   │   └── useLogin.ts
│   │   │   └── index.ts
│   │   ├── signup/
│   │   │   ├── ui/
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── model/
│   │   │   │   └── useSignup.ts
│   │   │   └── index.ts
│   │   ├── logout/
│   │   │   ├── ui/
│   │   │   │   └── LogoutButton.tsx
│   │   │   └── index.ts
│   │   └── password-reset/
│   │       ├── ui/
│   │       │   └── PasswordResetForm.tsx
│   │       ├── model/
│   │       │   └── usePasswordReset.ts
│   │       └── index.ts
│   └── workspace/
│       ├── switcher/
│       │   ├── ui/
│       │   │   └── WorkspaceSwitcher.tsx
│       │   ├── model/
│       │   │   └── useWorkspaceSwitcher.ts
│       │   └── index.ts
│       └── index.ts
│
├── entities/
│   ├── user/
│   │   ├── model/
│   │   │   ├── useCurrentUser.ts
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   └── userApi.ts
│   │   └── index.ts
│   ├── session/
│   │   ├── model/
│   │   │   ├── useSession.ts
│   │   │   └── types.ts
│   │   └── index.ts
│   └── workspace/
│       ├── model/
│       │   ├── useWorkspaces.ts
│       │   ├── useCurrentWorkspace.ts
│       │   └── types.ts
│       ├── api/
│       │   └── workspaceApi.ts
│       └── index.ts
│
└── shared/
    ├── lib/
    │   ├── auth/
    │   │   ├── schemas.ts (Zod)
    │   │   ├── types.ts
    │   │   ├── errors.ts
    │   │   └── index.ts
    │   └── storage/
    │       ├── localStorage.ts
    │       └── index.ts
    └── ui/
        └── protected-route.tsx
```

## Key Features

### 1. Email/Password Authentication
- Login with email/password
- Signup with email/password
- Email verification (Supabase handles)
- Password reset flow

### 2. Workspace Creation on Signup
- Automatically create workspace on signup
- User becomes owner
- Store workspace selection
- Generate unique slug

### 3. Session Management
- Persist auth state
- Auto-refresh tokens
- Listen to auth changes
- Sync across tabs

### 4. Workspace Switching
- Users can belong to multiple workspaces
- Dropdown to switch between workspaces
- Store current workspace in Zustand
- Persist in localStorage

### 5. Protected Routes
- Redirect unauthenticated users to login
- Check workspace membership
- Loading states during checks
- Preserve intended destination

## Technical Decisions

### State Management
- **Zustand** for auth state (currentUser, session)
- **Zustand** for workspace state (currentWorkspace, workspaces)
- **React Query** for server data (user profile, workspace list)
- **localStorage** for persistence

### Form Handling
- **React Hook Form** for form state
- **Zod** for validation schemas
- **Shadcn Form** components for UI

### Error Handling
- Typed error messages
- Toast notifications for errors
- Form field errors
- Network error recovery

### Type Safety
- All auth functions fully typed
- Database types from generated schema
- Zod runtime validation
- No `any` types

## Success Criteria

- [ ] User can sign up with email/password
- [ ] Workspace auto-created on signup
- [ ] User can log in
- [ ] User can log out
- [ ] Session persists on page reload
- [ ] Protected routes redirect to login
- [ ] User can reset password
- [ ] Users can switch between workspaces
- [ ] No TypeScript errors
- [ ] All forms have proper validation
- [ ] Loading states shown during async operations

## Next Steps After Phase 2

Phase 3 will build:
- Profile management
- Workspace settings
- Team member invitations
- Role management

---

**Let's build it!** 🚀
