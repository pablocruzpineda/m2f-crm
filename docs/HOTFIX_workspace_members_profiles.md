# Fixing the workspace_members Profiles Join Error

## Problem
When editing a contact, you're seeing this error:
```
GET .../workspace_members?select=user_id,role,joined_at,profiles:user_id(email,full_name)&workspace_id=eq.... 400 (Bad Request)
```

## Root Cause
The `workspace_members` table has a foreign key to `auth.users(id)` but not to `profiles(id)`. While both tables use the same ID, PostgREST needs an explicit foreign key relationship to enable the join syntax `profiles:user_id(...)`.

## Solution

### Step 1: Apply the Migration
Run the new migration file in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/027_fix_workspace_members_profiles_fk.sql`
4. Paste and run it

**Or** if you have Supabase CLI configured:
```bash
supabase db push
```

### Step 2: Verify the Fix
After applying the migration, refresh your app and try editing a contact again. The error should be resolved.

## What the Migration Does

The migration:
1. Drops the old foreign key to `auth.users(id)`
2. Adds a new foreign key to `profiles(id)` 
3. Uses `ON DELETE CASCADE` to maintain data integrity

This allows PostgREST to recognize the relationship and properly execute queries like:
```sql
SELECT 
  user_id,
  role,
  joined_at,
  profiles:user_id (
    email,
    full_name
  )
FROM workspace_members
WHERE workspace_id = '...'
```

## Why This Happened

The original schema created `workspace_members` with a reference to `auth.users(id)` (which is in Supabase's auth schema), but our application code queries `profiles` (in the public schema). Since `profiles.id` is also a foreign key to `auth.users(id)`, they share the same IDs, but PostgREST needs an explicit relationship to enable automatic joins.

## Prevention

Future tables that need to join with user information should reference `profiles(id)` directly instead of `auth.users(id)`.
