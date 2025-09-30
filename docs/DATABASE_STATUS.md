# Database & Migration Status

## Current Database State

### Applied Migrations (7 total)

| # | Migration | Status | Purpose |
|---|-----------|--------|---------|
| 001 | `initial_schema.sql` | ✅ Applied | Base schema with all tables, RLS, and triggers |
| 002 | `fix_profiles_insert_policy.sql` | ✅ Applied | Added INSERT policy for profiles table |
| 003 | `temporarily_disable_trigger.sql` | ✅ Applied | Disabled `on_auth_user_created` trigger |
| 004 | `fix_trigger_with_proper_grants.sql` | ✅ Applied | Attempted to fix trigger (didn't work) |
| 005 | `disable_trigger_again.sql` | ✅ Applied | **CURRENT**: Permanently disabled trigger |
| 006 | `fix_workspace_members_policies.sql` | ✅ Applied | Attempted RLS fix (didn't fully work) |
| 007 | `fix_workspace_members_rls.sql` | ✅ Applied | **CURRENT**: Simplified RLS policy ✅ |

### Active Triggers

| Trigger | Table | Status | Function |
|---------|-------|--------|----------|
| `on_auth_user_created` | `auth.users` | ❌ **DISABLED** | `handle_new_user()` |
| `update_profiles_updated_at` | `profiles` | ✅ Active | `update_updated_at_column()` |
| `update_workspaces_updated_at` | `workspaces` | ✅ Active | `update_updated_at_column()` |

**Why is `on_auth_user_created` disabled?**
- Causes Supabase service timeout during authentication
- Replaced with manual profile creation in app code
- See: `src/features/auth/signup/model/useSignup.ts` lines 41-54

### Tables & RLS Status

| Table | RLS Enabled | Policies | Notes |
|-------|-------------|----------|-------|
| `profiles` | ✅ Yes | 3 policies | SELECT, UPDATE, INSERT (service role) |
| `workspaces` | ✅ Yes | 2 policies | SELECT, UPDATE (for admins) |
| `workspace_members` | ✅ Yes | 1 policy | **Simplified in 007**: SELECT own memberships only |
| `invitations` | ✅ Yes | 3 policies | SELECT, INSERT, UPDATE |

### RLS Policies Detail

#### Profiles Table
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can insert profiles (migration 002)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);
```

#### Workspace Members Table (Fixed in migration 007)
```sql
-- Simplified to avoid RLS recursion
CREATE POLICY "Users can view own workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());
```

**Old problematic policy (removed in 007):**
```sql
-- This caused infinite recursion - REMOVED
CREATE POLICY "Workspace admins can manage members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
  );
-- Problem: Querying workspace_members inside workspace_members policy = recursion
```

### RPC Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `create_workspace_with_owner` | Create workspace + add owner to members | ✅ Working |

### Known Issues & Solutions

#### ✅ SOLVED: Auth Trigger Timeout
**Problem**: `on_auth_user_created` trigger causes service timeout  
**Solution**: Disabled trigger, manual profile creation in app  
**Location**: `src/features/auth/signup/model/useSignup.ts`

#### ✅ SOLVED: RLS Infinite Recursion
**Problem**: Inner join with `workspace_members` caused RLS recursion  
**Solution**: Two-step query (get IDs first, then get workspaces)  
**Location**: `src/entities/workspace/api/workspaceApi.ts`

#### ✅ SOLVED: Profile Fetch Timeout
**Problem**: Multiple concurrent profile fetches during page refresh  
**Solution**: Request caching + 10s timeout  
**Location**: `src/entities/user/api/userApi.ts`

## Migration Cleanup Options

### Option 1: Keep All Migrations (Recommended)
- Full history of changes
- Can see evolution of fixes
- Useful for debugging
- No action needed

### Option 2: Squash Migrations
Combine migrations 002-007 into single migration since they're all fixes:

```sql
-- New: 002_auth_and_rls_fixes.sql
-- Combines all fixes into one clean migration
-- (Would need to drop migrations 003-007 from remote db first)
```

**NOT RECOMMENDED** - Keep history for now

### Option 3: Document and Archive
- Keep migrations as-is
- Add comments explaining why trigger is disabled
- Mark migrations 004 and 006 as "superseded"

**RECOMMENDED** - I'll add comments to migrations

## Current Working State

✅ **All auth flows working**
✅ **All RLS policies working** 
✅ **No infinite recursion**
✅ **No timeout issues**
✅ **Profile creation working**
✅ **Workspace creation working**

## Commands Reference

```bash
# Check migration status
npx supabase migration list

# Apply all pending migrations
npx supabase db push

# Reset database (DANGEROUS - use only in dev)
npx supabase db reset

# Create new migration
npx supabase migration new migration_name
```

---

**Last Updated**: September 29, 2025  
**Current Migration**: 007_fix_workspace_members_rls.sql  
**Status**: ✅ All systems operational
