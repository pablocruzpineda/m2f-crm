# Database Migrations

This folder contains SQL migration files for the M2F CRM database.

## Migrations

### 001_initial_schema.sql

**Purpose:** Initial multi-tenant database schema

**Creates:**
- `profiles` - User profile information
- `workspaces` - Tenant containers with theme customization
- `workspace_members` - User-workspace relationships with roles
- `invitations` - Workspace invitation system

**Features:**
- Row Level Security (RLS) on all tables
- Automatic profile creation on user signup
- Workspace creation function with owner
- Role-based permissions (owner, admin, member)
- Theme customization support (JSONB)

**How to Run:**

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy/paste the SQL
   - Run it

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

## Migration Best Practices

1. **Never edit existing migrations** - Create new ones instead
2. **Test locally first** - Use Supabase local development
3. **Backup before production** - Always backup before running in prod
4. **Version control** - All migrations are tracked in Git

## Future Migrations

When adding new features, create numbered migration files:
- `002_add_contacts.sql`
- `003_add_pipelines.sql`
- `004_add_messages.sql`

Each migration should be:
- ✅ Idempotent (safe to run multiple times)
- ✅ Well-commented
- ✅ Include rollback instructions if needed
