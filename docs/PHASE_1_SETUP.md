# Phase 1: Supabase Setup Guide

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up or Log in**
3. **Click "New Project"**
   - Organization: Create or select existing
   - Name: `m2f-crm` (or your preference)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is perfect for development

4. **Wait for project to be created** (~2 minutes)

---

## Step 2: Get Your Credentials

Once your project is ready:

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API" section**
3. **Copy these values:**
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

4. **Create `.env` file** in project root:

```bash
# Copy from .env.example and fill in your values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Run the Migration

You have **two options**:

### Option A: Use Supabase Dashboard (Easiest)

1. **Go to SQL Editor** in Supabase dashboard
2. **Click "New Query"**
3. **Copy the entire content** of `supabase/migrations/001_initial_schema.sql`
4. **Paste it** into the SQL editor
5. **Click "Run"** (or press Cmd/Ctrl + Enter)
6. **Verify success** - you should see tables created

### Option B: Use Supabase CLI (Recommended for long-term)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get the project reference from dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 4: Verify the Schema

1. **Go to Table Editor** in Supabase dashboard
2. **You should see these tables:**
   - ✅ `profiles`
   - ✅ `workspaces`
   - ✅ `workspace_members`
   - ✅ `invitations`

3. **Check RLS is enabled:**
   - Each table should show a 🔒 (lock icon)
   - Click on a table → "RLS enabled" should be checked

---

## Step 5: Generate TypeScript Types

### Option A: Using Supabase CLI

```bash
# Generate types from your database
npx supabase gen types typescript --project-id your-project-ref > src/shared/lib/supabase/types.ts
```

### Option B: Manual (I'll help you)

Once you confirm the migration is complete, I'll generate the proper TypeScript types for you.

---

## Step 6: Test the Connection

After creating `.env` file, run:

```bash
npm run dev
```

The app should start without errors. If you see any Supabase connection errors, double-check your `.env` values.

---

## What We Just Built

### 🏢 **Multi-Tenant Architecture**

1. **Workspaces** - Each customer gets their own workspace (tenant)
2. **Workspace Members** - Users can belong to multiple workspaces
3. **Row Level Security (RLS)** - Automatic data isolation
   - Users can only see data from their workspaces
   - No way to accidentally access another tenant's data

### 🎨 **Theme Customization Ready**

The `workspaces` table has a `theme_config` JSONB column where users can store:
- Primary color
- Accent color
- Background color
- Logo URL

### 🔐 **Security First**

- All tables have RLS enabled
- Policies enforce workspace isolation
- Owner/Admin/Member roles for permissions
- Automatic profile creation on signup

---

## Next Steps

Once you've completed these steps:

1. **Confirm** the migration ran successfully
2. **Share** your `.env` values are set correctly
3. **Then I'll:**
   - Generate the TypeScript types
   - Update the Supabase client
   - Create helper functions for workspace operations
   - Move to Phase 2 (Authentication UI)

---

## Need Help?

If you get stuck on any step, just let me know:
- "Migration failed with error X"
- "Can't find my project URL"
- "Tables aren't showing up"

I'm here to help! 🚀
