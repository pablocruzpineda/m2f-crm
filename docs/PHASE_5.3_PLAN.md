# Phase 5.3 Implementation Plan - Team Collaboration

**Phase**: 5.3 - Team Collaboration  
**Status**: 📋 Planning  
**Estimated Duration**: 8-10 hours  
**Started**: October 1, 2025

---

## 🎯 Phase Objectives

Enable multiple users to collaborate within a workspace with proper role-based permissions, contact assignment, and personalized WhatsApp integration.

### Primary Goals:
1. ✅ Role-based access control (Owner, Admin, Member, Viewer)
2. ✅ Contact and deal assignment system
3. ✅ Team member management (no email invitations)
4. ✅ Permission-based theme access
5. ✅ Per-user WhatsApp API endpoints with workspace fallback
6. ✅ Activity feed and tracking

### Success Criteria:
- [ ] Team members can only see their assigned contacts/deals
- [ ] Owners/Admins can see all contacts/deals
- [ ] Each team member can configure their own WhatsApp endpoint
- [ ] Fallback to workspace default if user hasn't configured
- [ ] Removing member reassigns their data to owner
- [ ] Activity feed shows team actions in real-time
- [ ] Theme settings restricted to owner only

---

## 📊 Current State Analysis

### What We Already Have:
- ✅ `workspace_members` table (from Phase 1)
- ✅ Multi-tenant architecture with RLS
- ✅ `chat_settings` table (from Phase 5.2)
- ✅ WhatsApp webhook handler
- ✅ Real-time subscriptions
- ✅ User authentication

### What's Missing:
- ❌ Role column in workspace_members
- ❌ assigned_to column in contacts/deals
- ❌ Per-user chat_settings
- ❌ RLS policies for assignment-based access
- ❌ Team member management UI
- ❌ Activity tracking system
- ❌ Permission checks in UI

---

## 🏗️ Architecture Design

### Role Hierarchy:
```
Owner (1 per workspace)
  ├─ Full control over workspace
  ├─ Can change theme
  ├─ Can manage all members
  └─ Sees all data

Admin (multiple)
  ├─ Can manage members
  ├─ Can configure workspace WhatsApp
  ├─ Sees all data
  └─ Cannot change theme

Member (multiple)
  ├─ Sees only assigned contacts/deals
  ├─ Can configure personal WhatsApp
  ├─ Can create contacts (auto-assigned to them)
  └─ Cannot manage other members

Viewer (optional for future)
  ├─ Read-only access
  └─ Cannot create/edit anything
```

### Data Assignment Model:
```
Contact/Deal Creation:
  - Created by Member → Assigned to Member
  - Created by Admin/Owner → Assigned to Owner (or manually assigned)

Contact/Deal Assignment:
  - Owner/Admin can assign to anyone
  - Member cannot reassign
  
Contact/Deal Visibility:
  - Owner/Admin: ALL contacts/deals
  - Member: Only ASSIGNED contacts/deals

Member Removal:
  - All assigned data → Reassigned to Owner
  - Activity history preserved
```

### WhatsApp Configuration Model:
```
Workspace Level (configured by Owner/Admin):
  - webhook_url (receiving messages)
  - api_endpoint (default for sending)
  - api_key, api_secret

User Level (optional, configured by each user):
  - api_endpoint (personal phone)
  - api_key, api_secret

Sending Logic:
  1. Check if user has personal settings
  2. If YES → Use user's endpoint
  3. If NO → Use workspace default
  4. If neither → Show error
```

---

## 📋 Step-by-Step Implementation Plan

### **Step 1: Database Schema Updates** (1 hour)

#### 1.1 Add Role System to workspace_members
```sql
-- File: supabase/migrations/019_add_roles_to_workspace_members.sql

-- Add role column
ALTER TABLE workspace_members 
  ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

-- Add role constraint
ALTER TABLE workspace_members 
  ADD CONSTRAINT valid_role 
  CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

-- Set existing workspace owners
UPDATE workspace_members 
SET role = 'owner'
WHERE workspace_id IN (
  SELECT id FROM workspaces 
  WHERE workspaces.owner_id = workspace_members.user_id
);

-- Create index for role queries
CREATE INDEX idx_workspace_members_role ON workspace_members(role);

-- Add comment
COMMENT ON COLUMN workspace_members.role IS 
  'User role: owner (1), admin (many), member (many), viewer (read-only)';
```

#### 1.2 Add Assignment to Contacts
```sql
-- File: supabase/migrations/020_add_assignment_to_contacts.sql

-- Add assignment columns
ALTER TABLE contacts 
  ADD COLUMN assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN assigned_by UUID REFERENCES profiles(id),
  ADD COLUMN assigned_at TIMESTAMPTZ;

-- Set default assigned_to for existing contacts (assign to creator)
UPDATE contacts 
SET assigned_to = created_by, 
    assigned_by = created_by,
    assigned_at = created_at
WHERE assigned_to IS NULL;

-- Create index for assignment queries
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contacts_workspace_assigned ON contacts(workspace_id, assigned_to);

-- Add comments
COMMENT ON COLUMN contacts.assigned_to IS 'User responsible for this contact';
COMMENT ON COLUMN contacts.assigned_by IS 'User who made the assignment';
COMMENT ON COLUMN contacts.assigned_at IS 'When the assignment was made';
```

#### 1.3 Add Assignment to Deals
```sql
-- File: supabase/migrations/021_add_assignment_to_deals.sql

-- Add assignment columns
ALTER TABLE deals 
  ADD COLUMN assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN assigned_by UUID REFERENCES profiles(id),
  ADD COLUMN assigned_at TIMESTAMPTZ;

-- Set default assigned_to for existing deals
UPDATE deals 
SET assigned_to = created_by, 
    assigned_by = created_by,
    assigned_at = created_at
WHERE assigned_to IS NULL;

-- Create index
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_workspace_assigned ON deals(workspace_id, assigned_to);
```

#### 1.4 Update Chat Settings for Per-User Configuration
```sql
-- File: supabase/migrations/022_update_chat_settings_per_user.sql

-- Make user_id nullable (NULL = workspace default)
ALTER TABLE chat_settings 
  ALTER COLUMN user_id DROP NOT NULL;

-- Update unique constraint
DROP CONSTRAINT IF EXISTS chat_settings_workspace_id_key;
ALTER TABLE chat_settings 
  ADD CONSTRAINT unique_workspace_user_settings 
  UNIQUE NULLS NOT DISTINCT (workspace_id, user_id);

-- Add comment
COMMENT ON COLUMN chat_settings.user_id IS 
  'NULL = workspace default settings, UUID = user personal settings';

-- Migrate existing settings to workspace-level (set user_id to NULL)
UPDATE chat_settings 
SET user_id = NULL 
WHERE user_id IS NOT NULL;
```

#### 1.5 Update RLS Policies for Contacts
```sql
-- File: supabase/migrations/023_update_contacts_rls_for_assignment.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts in their workspace" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their workspace" ON contacts;

-- New policy: Owners and admins see ALL contacts
CREATE POLICY "Owners and admins see all contacts"
  ON contacts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- New policy: Members see only assigned contacts
CREATE POLICY "Members see assigned contacts"
  ON contacts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'member'
    )
    AND (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

-- New policy: Users can create contacts (auto-assigned to them)
CREATE POLICY "Users can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- New policy: Users can update their assigned contacts
CREATE POLICY "Users can update assigned contacts"
  ON contacts FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      -- Owners/admins can update all
      auth.uid() IN (
        SELECT user_id FROM workspace_members 
        WHERE workspace_id = contacts.workspace_id 
        AND role IN ('owner', 'admin')
      )
      OR
      -- Members can update assigned
      assigned_to = auth.uid()
    )
  );

-- New policy: Only owners/admins can delete
CREATE POLICY "Owners and admins can delete contacts"
  ON contacts FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
```

#### 1.6 Update RLS Policies for Deals
```sql
-- File: supabase/migrations/024_update_deals_rls_for_assignment.sql

-- Similar structure to contacts RLS policies
-- (Full SQL similar to above, adapted for deals table)
```

#### 1.7 Update RLS Policies for Chat Settings
```sql
-- File: supabase/migrations/025_update_chat_settings_rls.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view chat settings in their workspace" ON chat_settings;
DROP POLICY IF EXISTS "Users can create chat settings in their workspace" ON chat_settings;
DROP POLICY IF EXISTS "Users can update chat settings in their workspace" ON chat_settings;

-- Users can manage their own settings
CREATE POLICY "Users manage their own chat settings"
  ON chat_settings FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid() OR user_id IS NULL
    )
  );

-- Owners/admins can see all settings (for status view)
CREATE POLICY "Owners and admins see all chat settings"
  ON chat_settings FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
```

#### 1.8 Create Activity Log Table
```sql
-- File: supabase/migrations/026_create_activity_log.sql

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Activity details
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'assigned', etc.
  entity_type TEXT NOT NULL, -- 'contact', 'deal', 'member', etc.
  entity_id UUID, -- ID of the affected entity
  
  -- Additional data
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'created', 'updated', 'deleted', 'assigned', 'status_changed',
    'member_added', 'member_removed', 'role_changed'
  )),
  CONSTRAINT valid_entity_type CHECK (entity_type IN (
    'contact', 'deal', 'message', 'member', 'workspace', 'settings'
  ))
);

-- Indexes
CREATE INDEX idx_activity_workspace ON activity_log(workspace_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity in their workspace"
  ON activity_log FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );
```

**Deliverables:**
- [ ] 8 migration files created
- [ ] All tables updated with new columns
- [ ] RLS policies updated for assignment-based access
- [ ] Indexes created for performance
- [ ] Activity log table created

---

### **Step 2: API Layer & Hooks** (2 hours)

#### 2.1 Role Utilities
```typescript
// File: src/shared/lib/permissions/roles.ts

export type Role = 'owner' | 'admin' | 'member' | 'viewer'

export function canManageMembers(role: Role): boolean {
  return ['owner', 'admin'].includes(role)
}

export function canSeeAllData(role: Role): boolean {
  return ['owner', 'admin'].includes(role)
}

export function canChangeTheme(role: Role): boolean {
  return role === 'owner'
}

export function canConfigureWorkspaceWhatsApp(role: Role): boolean {
  return ['owner', 'admin'].includes(role)
}

export function canDeleteEntity(role: Role): boolean {
  return ['owner', 'admin'].includes(role)
}

export function canAssignToOthers(role: Role): boolean {
  return ['owner', 'admin'].includes(role)
}
```

#### 2.2 Get User Role Hook
```typescript
// File: src/entities/workspace/model/useUserRole.ts

export function useUserRole() {
  const { user } = useAuth()
  const { currentWorkspace } = useCurrentWorkspace()
  
  const { data: member } = useQuery({
    queryKey: ['workspace-member-role', currentWorkspace?.id, user?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id || !user?.id) return null
      
      const { data } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', currentWorkspace.id)
        .eq('user_id', user.id)
        .single()
      
      return data?.role as Role || 'member'
    },
    enabled: !!currentWorkspace?.id && !!user?.id,
  })
  
  return {
    role: member || 'member',
    isOwner: member === 'owner',
    isAdmin: member === 'admin',
    isMember: member === 'member',
    canManageMembers: canManageMembers(member || 'member'),
    canSeeAllData: canSeeAllData(member || 'member'),
    canChangeTheme: canChangeTheme(member || 'member'),
  }
}
```

#### 2.3 Team Members API
```typescript
// File: src/entities/team/api/teamApi.ts

export interface TeamMember {
  id: string
  email: string
  role: Role
  joined_at: string
}

export async function getTeamMembers(workspaceId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      role,
      created_at,
      profiles (
        email,
        full_name
      )
    `)
    .eq('workspace_id', workspaceId)
  
  if (error) throw error
  
  return data.map(m => ({
    id: m.user_id,
    email: m.profiles.email,
    role: m.role,
    joined_at: m.created_at
  }))
}

export async function addTeamMember(
  workspaceId: string,
  email: string,
  role: Role
): Promise<void> {
  // 1. Find user by email
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()
  
  if (userError || !user) {
    throw new Error('User not found. They must register first.')
  }
  
  // 2. Check if already member
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()
  
  if (existing) {
    throw new Error('User is already a member of this workspace')
  }
  
  // 3. Add to workspace
  const { error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role: role
    })
  
  if (error) throw error
}

export async function removeTeamMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  // 1. Get workspace owner
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single()
  
  if (!workspace) throw new Error('Workspace not found')
  
  // 2. Reassign contacts
  await supabase
    .from('contacts')
    .update({ 
      assigned_to: workspace.owner_id,
      assigned_by: auth.uid(),
      assigned_at: new Date().toISOString()
    })
    .eq('workspace_id', workspaceId)
    .eq('assigned_to', userId)
  
  // 3. Reassign deals
  await supabase
    .from('deals')
    .update({ 
      assigned_to: workspace.owner_id,
      assigned_by: auth.uid(),
      assigned_at: new Date().toISOString()
    })
    .eq('workspace_id', workspaceId)
    .eq('assigned_to', userId)
  
  // 4. Remove member
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
  
  if (error) throw error
  
  // 5. Log activity
  await logActivity({
    workspace_id: workspaceId,
    action: 'member_removed',
    entity_type: 'member',
    entity_id: userId,
    details: { reassigned_to: workspace.owner_id }
  })
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  newRole: Role
): Promise<void> {
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
  
  if (error) throw error
  
  await logActivity({
    workspace_id: workspaceId,
    action: 'role_changed',
    entity_type: 'member',
    entity_id: userId,
    details: { new_role: newRole }
  })
}
```

#### 2.4 Team Hooks
```typescript
// File: src/entities/team/model/useTeamMembers.ts
// File: src/entities/team/model/useAddTeamMember.ts
// File: src/entities/team/model/useRemoveTeamMember.ts
// File: src/entities/team/model/useUpdateMemberRole.ts

// Standard React Query hooks wrapping the API functions
```

#### 2.5 Chat Settings with Fallback
```typescript
// File: src/entities/chat-settings/api/chatSettingsApi.ts

export async function getChatSettingsForSending(
  workspaceId: string,
  userId: string
) {
  // Try user settings first
  const { data: userSettings } = await supabase
    .from('chat_settings')
    .select('api_endpoint, api_key, api_secret')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle()
  
  if (userSettings) {
    return { settings: userSettings, source: 'user' as const }
  }
  
  // Fallback to workspace default
  const { data: workspaceSettings } = await supabase
    .from('chat_settings')
    .select('api_endpoint, api_key, api_secret')
    .eq('workspace_id', workspaceId)
    .is('user_id', null)
    .maybeSingle()
  
  if (!workspaceSettings) {
    throw new Error('WhatsApp not configured for this workspace')
  }
  
  return { settings: workspaceSettings, source: 'workspace' as const }
}
```

#### 2.6 Activity Log API
```typescript
// File: src/entities/activity/api/activityApi.ts

export interface Activity {
  id: string
  user_id: string
  user_email: string
  action: string
  entity_type: string
  entity_id?: string
  details: Record<string, any>
  created_at: string
}

export async function getActivities(
  workspaceId: string,
  filters?: {
    userId?: string
    entityType?: string
    limit?: number
  }
): Promise<Activity[]> {
  let query = supabase
    .from('activity_log')
    .select(`
      *,
      profiles (email)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  
  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  return data.map(a => ({
    ...a,
    user_email: a.profiles.email
  }))
}

export async function logActivity(params: {
  workspace_id: string
  action: string
  entity_type: string
  entity_id?: string
  details?: Record<string, any>
}) {
  const { error } = await supabase
    .from('activity_log')
    .insert({
      ...params,
      user_id: auth.uid()
    })
  
  if (error) throw error
}
```

**Deliverables:**
- [ ] Permission utilities created
- [ ] useUserRole hook created
- [ ] Team API functions created
- [ ] Team hooks created
- [ ] Chat settings fallback logic
- [ ] Activity API created

---

### **Step 3: Update Contact & Deal APIs** (1 hour)

#### 3.1 Update Contact Assignment
```typescript
// File: src/entities/contact/api/contactApi.ts

// Add to createContact
export async function createContact(data: ContactInput) {
  const { user } = useAuth()
  
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      ...data,
      created_by: user.id,
      assigned_to: data.assigned_to || user.id, // Auto-assign to creator
      assigned_by: user.id,
      assigned_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Log activity
  await logActivity({
    workspace_id: data.workspace_id,
    action: 'created',
    entity_type: 'contact',
    entity_id: contact.id
  })
  
  return contact
}

// New: Assign contact
export async function assignContact(
  contactId: string,
  assignToUserId: string,
  workspaceId: string
) {
  const { error } = await supabase
    .from('contacts')
    .update({
      assigned_to: assignToUserId,
      assigned_by: auth.uid(),
      assigned_at: new Date().toISOString()
    })
    .eq('id', contactId)
  
  if (error) throw error
  
  await logActivity({
    workspace_id: workspaceId,
    action: 'assigned',
    entity_type: 'contact',
    entity_id: contactId,
    details: { assigned_to: assignToUserId }
  })
}

// New: Bulk assign contacts
export async function bulkAssignContacts(
  contactIds: string[],
  assignToUserId: string,
  workspaceId: string
) {
  const { error } = await supabase
    .from('contacts')
    .update({
      assigned_to: assignToUserId,
      assigned_by: auth.uid(),
      assigned_at: new Date().toISOString()
    })
    .in('id', contactIds)
  
  if (error) throw error
  
  await logActivity({
    workspace_id: workspaceId,
    action: 'assigned',
    entity_type: 'contact',
    details: { 
      assigned_to: assignToUserId,
      count: contactIds.length 
    }
  })
}
```

#### 3.2 Similar Updates for Deals
```typescript
// File: src/entities/deal/api/dealApi.ts
// (Similar assignment functions for deals)
```

**Deliverables:**
- [ ] Contact assignment functions
- [ ] Deal assignment functions
- [ ] Bulk assignment functions
- [ ] Activity logging integrated

---

### **Step 4: Team Management UI** (2 hours)

#### 4.1 Team Members Page
```typescript
// File: src/pages/settings/team/TeamMembersPage.tsx

export function TeamMembersPage() {
  const { currentWorkspace } = useCurrentWorkspace()
  const { role, canManageMembers } = useUserRole()
  const { data: members } = useTeamMembers(currentWorkspace.id)
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  if (!canManageMembers) {
    return <PermissionDenied message="Only owners and admins can manage team members" />
  }
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage workspace members and their roles
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {members?.map(member => (
              <TeamMemberRow
                key={member.id}
                member={member}
                currentUserRole={role}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <AddMemberDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  )
}
```

#### 4.2 Add Member Dialog
```typescript
// File: src/pages/settings/team/AddMemberDialog.tsx

export function AddMemberDialog({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('member')
  const addMember = useAddTeamMember()
  
  const handleSubmit = async () => {
    try {
      await addMember.mutateAsync({ email, role })
      toast.success('Member added successfully')
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add an existing user to your workspace
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              User must already have an account
            </p>
          </div>
          
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!email}>
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### 4.3 Team Member Row Component
```typescript
// File: src/pages/settings/team/TeamMemberRow.tsx

export function TeamMemberRow({ member, currentUserRole }) {
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  
  const canEdit = currentUserRole === 'owner' || 
    (currentUserRole === 'admin' && member.role !== 'owner')
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            {member.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{member.email}</p>
          <p className="text-sm text-muted-foreground">
            Joined {formatDate(member.joined_at)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={getRoleBadgeVariant(member.role)}>
          {member.role}
        </Badge>
        
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
                Change Role
              </DropdownMenuItem>
              {member.role !== 'owner' && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Dialogs */}
    </div>
  )
}
```

**Deliverables:**
- [ ] TeamMembersPage created
- [ ] AddMemberDialog created
- [ ] TeamMemberRow component
- [ ] Change role dialog
- [ ] Remove member dialog with confirmation
- [ ] Route added to settings

---

### **Step 5: Contact/Deal Assignment UI** (2 hours)

#### 5.1 Add "Assigned To" Field to Forms
```typescript
// File: src/entities/contact/ui/ContactForm.tsx

export function ContactForm({ contact, onSubmit }) {
  const { role, canAssignToOthers } = useUserRole()
  const { data: teamMembers } = useTeamMembers(currentWorkspace.id)
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing fields ... */}
      
      {canAssignToOthers && (
        <div>
          <Label>Assign To</Label>
          <Select
            value={formData.assigned_to}
            onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers?.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.email} ({member.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* ... rest of form ... */}
    </form>
  )
}
```

#### 5.2 Add Filter for "My Contacts" vs "All Contacts"
```typescript
// File: src/pages/contacts/ContactListPage.tsx

export function ContactListPage() {
  const { role, canSeeAllData } = useUserRole()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all')
  
  // Fetch with filter
  const { data: contacts } = useContacts({
    workspaceId: currentWorkspace.id,
    assignedTo: viewMode === 'mine' ? user.id : undefined
  })
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1>Contacts</h1>
        
        {canSeeAllData && (
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="all">
                All Contacts ({contacts?.length})
              </TabsTrigger>
              <TabsTrigger value="mine">
                My Contacts ({myContactsCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      
      {/* ... contact list ... */}
    </div>
  )
}
```

#### 5.3 Bulk Assignment Feature
```typescript
// File: src/pages/contacts/components/BulkAssignDialog.tsx

export function BulkAssignDialog({ selectedIds, onClose }) {
  const [assignTo, setAssignTo] = useState<string>('')
  const { data: teamMembers } = useTeamMembers(currentWorkspace.id)
  const bulkAssign = useBulkAssignContacts()
  
  const handleAssign = async () => {
    await bulkAssign.mutateAsync({
      contactIds: selectedIds,
      assignTo
    })
    toast.success(`${selectedIds.length} contacts assigned`)
    onClose()
  }
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign {selectedIds.length} Contacts
          </DialogTitle>
        </DialogHeader>
        
        <div>
          <Label>Assign To</Label>
          <Select value={assignTo} onValueChange={setAssignTo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teamMembers?.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!assignTo}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Deliverables:**
- [ ] Assigned To field in contact form
- [ ] Assigned To field in deal form
- [ ] My Contacts / All Contacts filter
- [ ] Bulk assignment dialog
- [ ] Assignment history display

---

### **Step 6: WhatsApp Settings Update** (1.5 hours)

#### 6.1 Update Settings Page for Per-User Config
```typescript
// File: src/pages/chat/settings/ChatSettingsPage.tsx

export function ChatSettingsPage() {
  const { currentWorkspace } = useCurrentWorkspace()
  const { user } = useAuth()
  const { role, canConfigureWorkspaceWhatsApp } = useUserRole()
  
  // Workspace settings (NULL user_id)
  const { data: workspaceSettings } = useChatSettings(
    currentWorkspace.id,
    null
  )
  
  // User's personal settings
  const { data: mySettings } = useChatSettings(
    currentWorkspace.id,
    user.id
  )
  
  return (
    <div className="p-8 space-y-6">
      <h1>WhatsApp Settings</h1>
      
      {/* Workspace Default (Owner/Admin only) */}
      {canConfigureWorkspaceWhatsApp && (
        <>
          <WorkspaceWebhookCard />
          <WorkspaceDefaultAPICard settings={workspaceSettings} />
        </>
      )}
      
      {/* Personal API Config (Everyone) */}
      <PersonalAPICard 
        settings={mySettings}
        workspaceSettings={workspaceSettings}
      />
      
      {/* Team Status (Owner/Admin only) */}
      {canConfigureWorkspaceWhatsApp && (
        <TeamWhatsAppStatusCard />
      )}
    </div>
  )
}
```

#### 6.2 Update Message Sending with Fallback
```typescript
// File: src/entities/message/api/messageApi.ts

export async function sendMessage(params: SendMessageParams) {
  const { workspaceId, contactId, content, userId } = params
  
  // Get settings with fallback
  const { settings, source } = await getChatSettingsForSending(
    workspaceId,
    userId
  )
  
  console.log(`Sending via ${source} WhatsApp endpoint`)
  
  // Get contact phone
  const { data: contact } = await supabase
    .from('contacts')
    .select('phone')
    .eq('id', contactId)
    .single()
  
  // Send via API endpoint
  const response = await fetch(settings.api_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.api_key}`
    },
    body: JSON.stringify({
      phone: contact.phone,
      message: content
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to send message')
  }
  
  // Store in database
  const { data: message } = await supabase
    .from('messages')
    .insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      sender_type: 'user',
      sender_id: userId,
      content,
      status: 'sent'
    })
    .select()
    .single()
  
  return message
}
```

**Deliverables:**
- [ ] Updated settings page with workspace/personal sections
- [ ] Team WhatsApp status card
- [ ] Fallback logic in message sending
- [ ] Settings UI showing source (user/workspace)

---

### **Step 7: Theme Permission Check** (30 min)

#### 7.1 Update Appearance Page
```typescript
// File: src/pages/settings/appearance/AppearancePage.tsx

export function AppearancePage() {
  const { canChangeTheme } = useUserRole()
  
  if (!canChangeTheme) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Permission Required</AlertTitle>
          <AlertDescription>
            Only the workspace owner can modify appearance settings.
            Contact your workspace owner to change the theme.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  // ... rest of appearance settings ...
}
```

**Deliverables:**
- [ ] Permission check in AppearancePage
- [ ] Clear error message for non-owners

---

### **Step 8: Activity Feed** (2 hours)

#### 8.1 Activity Feed Page
```typescript
// File: src/pages/activity/ActivityFeedPage.tsx

export function ActivityFeedPage() {
  const { currentWorkspace } = useCurrentWorkspace()
  const [filters, setFilters] = useState({
    userId: undefined,
    entityType: undefined
  })
  
  const { data: activities } = useActivities(currentWorkspace.id, filters)
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <ActivityFilters filters={filters} onChange={setFilters} />
      </div>
      
      <div className="space-y-2">
        {activities?.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
```

#### 8.2 Activity Item Component
```typescript
// File: src/pages/activity/components/ActivityItem.tsx

export function ActivityItem({ activity }) {
  const icon = getActivityIcon(activity.action)
  const message = formatActivityMessage(activity)
  
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.user_email}</span>
          {' '}{message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.created_at))} ago
        </p>
      </div>
    </div>
  )
}

function formatActivityMessage(activity: Activity): string {
  switch (activity.action) {
    case 'created':
      return `created a ${activity.entity_type}`
    case 'updated':
      return `updated a ${activity.entity_type}`
    case 'deleted':
      return `deleted a ${activity.entity_type}`
    case 'assigned':
      return `assigned a ${activity.entity_type}`
    case 'member_added':
      return 'added a team member'
    case 'member_removed':
      return 'removed a team member'
    default:
      return activity.action
  }
}
```

#### 8.3 Real-time Activity Updates
```typescript
// File: src/pages/activity/hooks/useActivitySubscription.ts

export function useActivitySubscription(workspaceId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`activity:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `workspace_id=eq.${workspaceId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities', workspaceId] })
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [workspaceId, queryClient])
}
```

**Deliverables:**
- [ ] Activity feed page
- [ ] Activity item component
- [ ] Activity filters
- [ ] Real-time activity subscription
- [ ] Activity formatting utilities

---

## 🧪 Testing Checklist

### Database & RLS Testing
- [ ] Create contact as member → auto-assigned to member
- [ ] Member can only see assigned contacts
- [ ] Owner/Admin can see all contacts
- [ ] Removing member reassigns data to owner
- [ ] Role changes reflect immediately

### WhatsApp Testing
- [ ] Send message with personal config → uses personal endpoint
- [ ] Send message without personal config → uses workspace default
- [ ] Send message with no config → shows error
- [ ] Webhook receives message → assigns to owner
- [ ] Team status card shows correct configuration

### Permission Testing
- [ ] Member cannot access team management
- [ ] Member cannot change theme
- [ ] Member cannot see other's contacts
- [ ] Admin can manage members
- [ ] Owner can do everything

### Activity Feed Testing
- [ ] Activities log correctly
- [ ] Real-time updates work
- [ ] Filters work correctly
- [ ] Activity messages formatted properly

---

## 📊 Progress Tracking

### Estimated Time Breakdown:
- **Step 1**: Database Schema (1 hour)
- **Step 2**: API Layer & Hooks (2 hours)
- **Step 3**: Update Contact/Deal APIs (1 hour)
- **Step 4**: Team Management UI (2 hours)
- **Step 5**: Contact/Deal Assignment UI (2 hours)
- **Step 6**: WhatsApp Settings Update (1.5 hours)
- **Step 7**: Theme Permission Check (30 min)
- **Step 8**: Activity Feed (2 hours)

**Total: 12 hours**

### Milestone Checklist:
- [ ] All migrations created and applied
- [ ] All API functions created
- [ ] All hooks created
- [ ] Team management UI complete
- [ ] Assignment UI complete
- [ ] WhatsApp settings updated
- [ ] Theme permissions enforced
- [ ] Activity feed working
- [ ] All tests passing

---

## 🚀 Deployment Checklist

Before marking Phase 5.3 as complete:

- [ ] Run all migrations in production
- [ ] Test with multiple users
- [ ] Verify RLS policies work correctly
- [ ] Test member removal and reassignment
- [ ] Verify WhatsApp fallback logic
- [ ] Test activity feed real-time updates
- [ ] Update documentation
- [ ] Create user guide for team collaboration

---

## 📝 Documentation Updates

Create/Update:
- [ ] `docs/PHASE_5.3_COMPLETE.md` - Completion report
- [ ] `docs/PROGRESS.md` - Update progress
- [ ] `docs/features/TEAM_COLLABORATION.md` - Feature documentation
- [ ] `docs/features/PERMISSIONS.md` - Permission matrix

---

## 🎯 Success Metrics

Phase 5.3 is complete when:
- ✅ Multiple users can work in same workspace
- ✅ Members only see assigned data
- ✅ Owners/Admins see everything
- ✅ Member removal works correctly
- ✅ Each user can configure personal WhatsApp
- ✅ Fallback to workspace WhatsApp works
- ✅ Theme restricted to owner only
- ✅ Activity feed shows team actions
- ✅ All permissions enforced correctly

---

**Last Updated**: October 1, 2025  
**Status**: 📋 Ready to implement  
**Next Review**: During implementation
