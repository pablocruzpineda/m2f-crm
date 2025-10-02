# Activity Logging System - Complete Guide

## Overview

The activity logging system automatically tracks user actions in the CRM and displays them in a real-time activity feed. This document explains how it works and what gets tracked.

## How It Works

### 1. Automatic Activity Logging (Not User-Selected)

Activities are **automatically logged by the code** whenever certain actions happen. Users don't need to "select" which activities to track - the system tracks everything important by default.

**Currently Tracked Activities:**

#### Contact Activities ✅ IMPLEMENTED
- **Created**: When a new contact is created
- **Updated**: When a contact is edited (includes which fields changed)
- **Deleted**: When a contact is removed
- **Assigned**: When a contact is assigned to a team member

#### Deal Activities ✅ IMPLEMENTED
- **Created**: When a new deal is created
- **Updated**: When a deal is edited
- **Status Changed**: When a deal status changes OR when moved through pipeline stages
- **Deleted**: When a deal is removed
- **Assigned**: When a deal is assigned to a team member

#### Team Activities ✅ IMPLEMENTED
- **Member Added**: When someone joins the workspace
- **Member Removed**: When someone leaves the workspace
- **Role Changed**: When a member's permissions change

#### Settings Activities (TODO - Future)
- **WhatsApp Updated**: When WhatsApp settings change
- **Theme Updated**: When workspace theme changes

### 2. Real-Time Updates

The activity feed updates automatically without refreshing the page:

- ✅ **Real-time subscriptions enabled** (via Supabase Realtime)
- ✅ **Auto-refresh when new activities are created**
- ✅ **No page refresh required**

### 3. Filtering & Search

Users can filter activities by:
- **Search**: Find specific activities by text
- **User**: See activities by specific team members
- **Entity Type**: Filter by contact, deal, member, etc.
- **Action**: Filter by created, updated, deleted, etc.

## Code Architecture

### Where Activity Logging Happens

Activities are logged in the API layer when actions occur:

```typescript
// Example from contactApi.ts
export async function updateContact(id: string, input: UpdateContactInput) {
  // 1. Perform the update
  const { data, error } = await supabase
    .from('contacts')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 2. Log the activity automatically
  await logActivity({
    workspace_id: data.workspace_id,
    user_id: currentUserId,
    action: 'updated',
    entity_type: 'contact',
    entity_id: id,
    details: {
      name: contact.name,
      updated_fields: Object.keys(input)
    }
  });

  return data;
}
```

### Activity Log Helper Function

Each API file has a `logActivity()` helper function:

```typescript
async function logActivity(params: {
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      workspace_id: params.workspace_id,
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      details: params.details as never,
    });
  } catch (error) {
    // Don't throw - activity logging is non-critical
    console.error('Failed to log activity:', error);
  }
}
```

**Important**: Logging failures don't break the main operation - they just log an error to the console.

## Testing the Activity Feed

### 1. Test Automatic Logging (Now Working!)

1. Go to Contacts page
2. **Create a contact** → Check activity feed, should see "created" activity
3. **Edit the contact** → Should see "updated" activity
4. **Delete the contact** → Should see "deleted" activity
5. Activities should appear **immediately without page refresh**

### 2. Test Real-Time Updates

1. Open activity feed in one browser tab
2. Open contacts in another tab
3. Create/edit a contact in the second tab
4. Watch the activity feed in the first tab - it should update automatically!

### 3. Test Filters

1. Create multiple activities
2. Use search to find specific contacts
3. Filter by user to see your own activities
4. Filter by entity type (contact, deal, etc.)
5. Filter by action (created, updated, etc.)
6. Clear filters to see everything again

## Implementation Status

### ✅ Completed
- [x] Database schema (`activity_log` table)
- [x] API layer (7 functions)
- [x] React hooks (useActivityLog, useActivitySubscription)
- [x] Activity Feed UI with filtering
- [x] Real-time subscriptions
- [x] **Contact activity logging** (create, update, delete, assign)
- [x] **Team activity logging** (add member, remove member, role change)
- [x] **Deal activity logging** (create, update, delete, status/stage change, assign) ✅ NEW!
- [x] Real-time enabled on database

### 🚧 To Be Implemented (Future Enhancements)

#### Settings Activity Logging
Add to `src/entities/chat-settings/api/chatSettingsApi.ts` and `src/pages/settings/ui/AppearanceSettingsPage.tsx`:
- Log when WhatsApp settings change
- Log when theme is updated

#### Message Activity Logging (Future Phase)
- Log when messages are sent
- Log when messages are received

#### Advanced Features
- Activity detail modal (click to see full details)
- Activity export (CSV/PDF)
- Activity notifications
- Activity grouping by day/week
- Undo last action from activity feed

## Database Schema

```sql
activity_log:
  id UUID PRIMARY KEY
  workspace_id UUID (FK to workspaces)
  user_id UUID (FK to profiles)
  action TEXT (created/updated/deleted/assigned/etc.)
  entity_type TEXT (contact/deal/member/settings/etc.)
  entity_id UUID (nullable - references the entity)
  details JSONB (flexible additional info)
  created_at TIMESTAMPTZ
```

**Constraints:**
- Valid actions: created, updated, deleted, status_changed, assigned, member_added, member_removed, role_changed, note_added
- Valid entity_types: contact, deal, message, member, workspace, settings, note

**Indexes:**
- workspace_id + created_at (for feed queries)
- user_id (for user filter)
- entity_type (for type filter)
- entity_id (for entity lookup)
- action (for action filter)

## Adding Activity Logging to New Features

When you add new features, follow this pattern:

```typescript
// 1. Import the activity log at the top of your API file
// (or create a logActivity helper at the bottom)

// 2. After performing the main operation, log the activity
export async function myNewAction(params) {
  // Do the main operation
  const result = await supabase.from('table').insert(data);
  
  // Log the activity
  await logActivity({
    workspace_id: workspaceId,
    user_id: currentUserId,
    action: 'created', // or 'updated', 'deleted', etc.
    entity_type: 'my_entity', // contact, deal, etc.
    entity_id: result.id,
    details: {
      // Any relevant info
      name: data.name,
      custom_field: data.custom
    }
  });
  
  return result;
}
```

## Troubleshooting

### Activities not appearing in feed
1. Check browser console for errors
2. Verify real-time is enabled: Run `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
3. Check if activities are in database: `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10;`
4. Verify RLS policies allow reading activities

### Real-time not working
1. Confirm migration 028 was applied
2. Check Supabase dashboard → Database → Replication → Ensure activity_log is enabled
3. Check browser console for WebSocket errors
4. Try hard refresh (Cmd+Shift+R)

### Activities created but with wrong data
1. Check the `details` JSONB field in the database
2. Verify the `logActivity` calls are passing correct parameters
3. Check user_id is correctly set (should be from session)

## Summary

**"Manually" means**: The code automatically logs activities when actions happen. There's no user interface for "selecting which activities to track" - the system tracks everything important by default.

**Real-time**: Now enabled! Activities appear instantly without refreshing the page.

**What's tracked now**:
- ✅ Contact operations (create, update, delete, assign)
- ✅ Team operations (add/remove members, role changes)
- ✅ **Deal operations** (create, update, delete, status/stage change, assign) ✅ NEW!

**What to add next**:
- 🚧 Settings changes (WhatsApp, theme)
- 🚧 Message activities (future)
- 🚧 Custom activities/notes
