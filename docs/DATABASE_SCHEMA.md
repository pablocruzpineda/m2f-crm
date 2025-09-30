# Database Schema Overview

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
│─────────────────│
│ id (PK)         │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────┐
│    profiles     │
│─────────────────│
│ id (PK, FK)     │◄──────────┐
│ email           │           │
│ full_name       │           │
│ avatar_url      │           │
│ created_at      │           │
│ updated_at      │           │
└─────────────────┘           │
                              │
                              │
┌─────────────────────────────┴──┐
│         workspaces             │
│────────────────────────────────│
│ id (PK)                        │
│ name                           │
│ slug (unique)                  │
│ logo_url                       │
│ theme_config (JSONB)           │◄─────┐
│ owner_id (FK → auth.users)     │      │
│ created_at                     │      │
│ updated_at                     │      │
└─────────────────┬──────────────┘      │
                  │                     │
                  │ 1:N                 │
                  │                     │
                  ▼                     │
┌─────────────────────────────┐         │
│    workspace_members        │         │
│─────────────────────────────│         │
│ id (PK)                     │         │
│ workspace_id (FK)           │─────────┤
│ user_id (FK → auth.users)   │         │
│ role (owner/admin/member)   │         │
│ joined_at                   │         │
│ UNIQUE(workspace_id, user)  │         │
└─────────────────────────────┘         │
                                        │
                                        │
┌─────────────────────────────┐         │
│       invitations           │         │
│─────────────────────────────│         │
│ id (PK)                     │         │
│ workspace_id (FK)           │─────────┘
│ email                       │
│ role (member/admin)         │
│ status (pending/accepted)   │
│ token (unique)              │
│ invited_by (FK → auth.users)│
│ invited_at                  │
│ expires_at                  │
│ accepted_at                 │
│ accepted_by (FK)            │
└─────────────────────────────┘
```

## Tables Overview

### 1. **profiles**
- **Purpose**: Stores user profile information
- **Relationship**: 1:1 with `auth.users`
- **Auto-created**: Trigger creates profile when user signs up
- **RLS**: Users can only view/update their own profile

### 2. **workspaces**
- **Purpose**: Multi-tenant container (each customer = 1 workspace)
- **Key Features**:
  - `slug`: URL-friendly unique identifier
  - `theme_config`: JSON storing custom colors and branding
  - `owner_id`: User who created the workspace
- **RLS**: Users can only see workspaces they're members of

### 3. **workspace_members**
- **Purpose**: Many-to-many relationship between users and workspaces
- **Roles**:
  - `owner`: Full control (can delete workspace)
  - `admin`: Can manage members and settings
  - `member`: Basic access
- **RLS**: Users can see members of their workspaces

### 4. **invitations**
- **Purpose**: Pending invitations to join workspaces
- **Features**:
  - Unique token for secure invitation links
  - Expiration (7 days default)
  - Status tracking (pending/accepted/declined)
- **RLS**: Visible to workspace members and invitee

## Multi-Tenancy Implementation

### Row Level Security (RLS)

All data access is automatically filtered by workspace:

```sql
-- Example: Contacts table (future)
CREATE POLICY "workspace_isolation"
  ON contacts FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );
```

This ensures:
- ✅ Users can only see data from their workspaces
- ✅ No way to accidentally query another tenant's data
- ✅ Database-level security (can't be bypassed)

### Data Flow Example

**User Login → Workspace Selection → Data Access**

```
1. User logs in (Supabase Auth)
   ↓
2. Query: "What workspaces can I access?"
   SELECT * FROM workspaces 
   WHERE id IN (
     SELECT workspace_id FROM workspace_members 
     WHERE user_id = current_user
   )
   ↓
3. User selects workspace (stored in client state)
   ↓
4. All queries automatically filtered by selected workspace
   SELECT * FROM contacts WHERE workspace_id = selected_workspace
```

## Theme Customization Schema

The `theme_config` JSONB column stores:

```json
{
  "primaryColor": "hsl(222.2 47.4% 11.2%)",
  "accentColor": "hsl(210 40% 96.1%)",
  "backgroundColor": "hsl(0 0% 100%)",
  "borderRadius": "0.5rem",
  "fontFamily": "Inter"
}
```

This allows each workspace to have:
- Custom color palette
- Unique branding
- Personalized UI experience

## Future Tables (Coming in Later Phases)

```
workspaces
    ↓
    ├── contacts (Phase 4)
    ├── pipelines (Phase 6)
    │   └── pipeline_stages
    │       └── contacts_in_stage
    ├── messages (Phase 8)
    │   └── message_participants
    └── custom_fields (Phase 11)
```

All will follow the same multi-tenant pattern with RLS policies.
