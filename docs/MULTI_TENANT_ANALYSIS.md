# Multi-Tenant Sub-Account Analysis

**Date**: October 7, 2025  
**Purpose**: Evaluate current architecture vs. required multi-tenant sub-account system

---

## 🎯 Requirements Summary

### Your Use Case:
**Marketing Agency with Multiple Client Sub-Accounts**

- **Owner (Tenant)**: Agency owner with full visibility
- **Admin (Sub-accounts)**: Account managers, each managing specific clients
- **Members/Viewers**: Staff assigned to specific sub-accounts
- **Data Isolation**: Each sub-account has isolated contacts, deals, meetings
- **Appearance**: Each sub-account can customize theme/appearance

---

## ✅ What You ALREADY Have

### 1. **Workspace = Tenant Container** ✅
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id), -- The "Owner/Tenant"
  theme_config JSONB, -- Already has appearance customization!
  ...
)
```
**Status**: ✅ Perfect foundation

### 2. **Role System** ✅
```sql
workspace_members (
  workspace_id UUID,
  user_id UUID,
  role TEXT -- 'owner', 'admin', 'member', 'viewer'
)
```
**Status**: ✅ All 4 roles already exist

### 3. **Data Isolation by Workspace** ✅
```sql
contacts (
  workspace_id UUID, -- All contacts scoped to workspace
  assigned_to UUID,  -- Assignment system exists!
  ...
)

deals (
  workspace_id UUID, -- All deals scoped to workspace
  assigned_to UUID,  -- Assignment system exists!
  ...
)

meetings (
  workspace_id UUID, -- All meetings scoped to workspace
  ...
)
```
**Status**: ✅ All data tables have workspace_id

### 4. **RLS (Row Level Security)** ✅
```sql
-- Contacts RLS Policy
CREATE POLICY "Users can view contacts in their workspace"
  ON contacts FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));
```
**Status**: ✅ Workspace-level isolation enforced

### 5. **Appearance/Theme System** ✅
```sql
workspaces (
  theme_config JSONB DEFAULT '{
    "primary_color": "#4F46E5",
    "secondary_color": "#10B981", 
    "accent_color": "#F59E0B",
    "theme_mode": "light"
  }'
)
```
**Status**: ✅ Theme customization already exists per workspace

---

## ❌ What You DON'T Have (Yet)

### 1. **Sub-Account Layer** ❌
You have `workspaces` but no concept of "sub-accounts within a workspace"

**Current Structure**:
```
Workspace (Agency)
  ├── Owner (Full access)
  ├── Admin 1 (Full access) ❌ Can see ALL contacts/deals
  ├── Admin 2 (Full access) ❌ Can see ALL contacts/deals
  └── Members (Full access) ❌ Can see ALL contacts/deals
```

**Required Structure**:
```
Workspace (Agency - Owner)
  ├── Sub-Account 1 (Admin 1's clients)
  │   ├── Admin 1
  │   ├── Member 1
  │   └── Member 2
  ├── Sub-Account 2 (Admin 2's clients)
  │   ├── Admin 2
  │   └── Member 3
  └── Sub-Account 3 (Admin 3's clients)
      └── Admin 3
```

### 2. **Sub-Account Data Isolation** ❌
Current RLS policies grant access to entire workspace

**Current**:
- All admins see ALL contacts in workspace
- All members see ALL deals in workspace

**Required**:
- Admin 1 only sees contacts in Sub-Account 1
- Member 1 only sees deals in Sub-Account 1
- Owner sees everything across all sub-accounts

### 3. **Admin Can't Change Appearance** ❌
Currently only `owner` role can change theme

**Current Permission:**
```typescript
// src/shared/lib/permissions/roles.ts
export function canChangeTheme(role: Role): boolean {
    return role === 'owner'  // ❌ Only owner!
}
```

**Required**:
- Each sub-account workspace has its own `theme_config` ✅ (already exists)
- Owner can customize master workspace theme ✅ (already works)
- **Admins need permission to customize their sub-account theme** ❌ (blocked)

**Fix Needed:**
When admin is owner of their sub-account workspace, they should be able to change theme

---

## 🏗️ Required Database Changes

### **Option 1: Minimal Changes (Recommended)**

Reinterpret your existing structure:

#### **Interpretation**:
1. **Owner** = Create a "master" workspace (agency)
2. **Admin Sub-Accounts** = Each admin creates their OWN workspace (client account)
3. **Owner** = Special user who has membership in ALL workspaces

#### **Changes Needed**:
```sql
-- 1. Add "parent_workspace_id" to link sub-accounts
ALTER TABLE workspaces 
  ADD COLUMN parent_workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Owner's workspace: parent_workspace_id = NULL
-- Sub-account workspaces: parent_workspace_id = owner's workspace id
```

**Pros**:
- ✅ Minimal database changes
- ✅ Data isolation already works (separate workspace_id)
- ✅ Theme customization already works (each workspace has theme_config)
- ✅ RLS policies don't need major changes

**Cons**:
- ❌ Owner needs to be member of ALL sub-account workspaces (manageable)
- ❌ UI needs to show hierarchy (parent → children workspaces)

---

### **Option 2: Add Sub-Accounts Table (More Explicit)**

Create a proper sub-account layer:

#### **New Table**:
```sql
CREATE TABLE sub_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES profiles(id), -- The admin managing this
  theme_config JSONB DEFAULT '{"primary_color": "#4F46E5"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Modify workspace_members**:
```sql
ALTER TABLE workspace_members 
  ADD COLUMN sub_account_id UUID REFERENCES sub_accounts(id) ON DELETE CASCADE;

-- NULL = workspace-level user (Owner only)
-- NOT NULL = sub-account user (Admins, Members, Viewers)
```

#### **Modify data tables**:
```sql
ALTER TABLE contacts 
  ADD COLUMN sub_account_id UUID REFERENCES sub_accounts(id) ON DELETE CASCADE;

ALTER TABLE deals 
  ADD COLUMN sub_account_id UUID REFERENCES sub_accounts(id) ON DELETE CASCADE;

ALTER TABLE meetings 
  ADD COLUMN sub_account_id UUID REFERENCES sub_accounts(id) ON DELETE CASCADE;

-- All existing data: sub_account_id = NULL (accessible to all)
-- New data: sub_account_id set based on creator's sub-account
```

#### **Update RLS Policies**:
```sql
-- Example: Contacts policy with sub-account isolation
CREATE OR REPLACE POLICY "Users can view contacts in their sub-account or workspace"
  ON contacts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND (
      -- Owner sees all (no sub_account_id assigned)
      sub_account_id IS NULL 
      OR
      -- User sees their sub-account data
      sub_account_id IN (
        SELECT sub_account_id FROM workspace_members 
        WHERE user_id = auth.uid() AND sub_account_id IS NOT NULL
      )
      OR
      -- Owner role sees everything
      EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE user_id = auth.uid() 
        AND workspace_id = contacts.workspace_id 
        AND role = 'owner'
      )
    )
  );
```

**Pros**:
- ✅ Explicit sub-account concept
- ✅ Clear hierarchy: Workspace → Sub-Accounts → Users
- ✅ Each sub-account has own theme
- ✅ Proper data isolation

**Cons**:
- ❌ More database changes required
- ❌ Need to update ALL data tables
- ❌ Need to rewrite ALL RLS policies
- ❌ Migration for existing data

---

## 🎯 My Recommendation

### **Use Option 1 (Minimal Changes)** 🌟

**Why?**

1. **You're 80% there already!** Your current architecture is actually perfect for this
2. **Minimal code changes** - mostly UI and business logic
3. **Data isolation works out of the box** - separate workspaces = separate data
4. **Theme customization exists** - each workspace has theme_config
5. **Faster implementation** - can be done in days vs. weeks

### **How Option 1 Works:**

#### **Database Changes** (One migration):
```sql
-- Migration: Add parent_workspace_id for sub-account hierarchy
ALTER TABLE workspaces 
  ADD COLUMN parent_workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

CREATE INDEX idx_workspaces_parent ON workspaces(parent_workspace_id);

COMMENT ON COLUMN workspaces.parent_workspace_id IS 
  'NULL = Master tenant workspace (Owner), NOT NULL = Sub-account workspace (Admin)';
```

#### **Business Logic Changes**:

**1. Owner (Master Tenant) Workspace Creation:**
```typescript
// When user signs up as Owner
createMasterWorkspace({
  name: "Acme Agency",
  owner_id: userId,
  parent_workspace_id: null  // ← Master workspace
})
```

**2. Admin Sub-Account Creation:**
```typescript
// Owner creates sub-account for Admin
createSubAccountWorkspace({
  name: "Client XYZ Account",
  owner_id: adminUserId,
  parent_workspace_id: masterWorkspaceId  // ← Links to master
})

// Add Admin as owner of their sub-account
addWorkspaceMember({
  workspace_id: subAccountId,
  user_id: adminUserId,
  role: 'owner'  // Admin is "owner" of their sub-account
})

// Also add Owner to sub-account (for visibility)
addWorkspaceMember({
  workspace_id: subAccountId,
  user_id: ownerUserId,
  role: 'owner'  // Master owner can see everything
})
```

**3. Data Access:**
- **Owner**: Member of master workspace + ALL sub-accounts → sees everything
- **Admin**: Owner of their sub-account workspace → sees only their data
- **Members**: Member of specific sub-account → sees only that sub-account's data

**4. Theme/Appearance:**
- Each workspace (master + sub-accounts) has its own `theme_config`
- Owner customizes master workspace theme
- Each admin customizes their sub-account workspace theme

#### **UI Changes**:

**Dashboard for Owner:**
```
Master Workspace: Acme Agency
├── Sub-Accounts (3)
│   ├── Client XYZ Account (Admin: John)
│   ├── Client ABC Account (Admin: Jane)
│   └── Client 123 Account (Admin: Bob)
├── All Users (12 total)
└── Settings → Switch between master/sub-account views
```

**Dashboard for Admin:**
```
My Account: Client XYZ Account
├── My Team (2 members)
├── My Contacts (45)
├── My Deals (23)
└── Appearance Settings (my theme)
```

---

## 📋 Implementation Checklist (Option 1)

### **Phase 1: Database** (1 migration)
- [ ] Add `parent_workspace_id` column to workspaces
- [ ] Add index on `parent_workspace_id`
- [ ] Add helper function to create sub-account workspace

### **Phase 2: API/Hooks** (2-3 days)
- [ ] Create `useSubAccounts(masterWorkspaceId)` hook
- [ ] Create `useCreateSubAccount()` hook
- [ ] Create `useDeleteSubAccount()` hook
- [ ] Modify `useWorkspaces()` to filter by parent_workspace_id
- [ ] Create `useMasterWorkspace()` hook (finds where parent_workspace_id IS NULL)

### **Phase 3: Permissions Update** (1 day)
- [ ] Update `canChangeTheme()` to allow admins who are owners of their workspace
- [ ] Test that sub-account admins can change their own theme
- [ ] Ensure master owner can still change master workspace theme

### **Phase 4: UI Updates** (3-4 days)
- [ ] Add "Sub-Accounts" page for Owner
- [ ] Add "Create Sub-Account" form
- [ ] Add workspace hierarchy display
- [ ] Modify workspace selector to show tree structure
- [ ] Add "Switch Account" feature for Owner
- [ ] Verify theme settings work per workspace

### **Phase 5: Business Logic** (2-3 days)
- [ ] Ensure Owner is added to all sub-accounts on creation
- [ ] Update workspace switching logic
- [ ] Add guards to prevent Admins from seeing other sub-accounts
- [ ] Test data isolation thoroughly

### **Phase 6: Testing** (2 days)
- [ ] Test Owner can see all sub-accounts
- [ ] Test Admin can only see their sub-account
- [ ] Test Members can only see their sub-account
- [ ] Test theme customization per sub-account
- [ ] Test contact/deal isolation

**Total Estimated Time: 1.5-2 weeks**

---

## 🔍 Option 2 Comparison

If you choose Option 2 (explicit sub_accounts table):

### **Additional Work Required**:
- [ ] Create `sub_accounts` table
- [ ] Add `sub_account_id` to workspace_members
- [ ] Add `sub_account_id` to contacts, deals, meetings, pipelines, activities, etc. (10+ tables)
- [ ] Rewrite ALL RLS policies (20+ policies)
- [ ] Create migration to assign existing data
- [ ] Update ALL API functions
- [ ] Update ALL React Query hooks
- [ ] Update ALL UI components

**Total Estimated Time: 4-6 weeks**

---

## 💬 Decision Point

**I strongly recommend Option 1** because:

1. ✅ You already have 80% of the architecture
2. ✅ Can be implemented in ~2 weeks vs. 6 weeks
3. ✅ Less risky (smaller changes)
4. ✅ Easier to test and debug
5. ✅ Achieves your requirements perfectly

**Your requirements mapping to Option 1:**

| Requirement | How Option 1 Solves It |
|-------------|------------------------|
| Owner sees all data | Owner is member of all sub-account workspaces |
| Admin manages sub-account | Admin is owner of their workspace |
| Admin customizes appearance | Each workspace has theme_config |
| Data isolation per sub-account | Separate workspaces = separate data (RLS already works) |
| Owner creates/deletes sub-accounts | Create/delete child workspaces |
| Members isolated per sub-account | Members added to specific workspace only |

---

## 🤔 Your Turn

**Questions for you:**

1. **Does Option 1 make sense for your use case?**
2. **Any concerns about using workspaces as sub-accounts?**
3. **Should we proceed with Option 1 implementation?**

If yes, I can start with the database migration right away! 🚀
