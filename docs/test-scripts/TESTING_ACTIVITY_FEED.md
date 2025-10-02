# Testing the Activity Feed

## Overview

The Activity Feed displays real-time activities from your workspace. Currently, activities need to be logged manually (automatic triggers will be added in future phases).

## What Activities Are Tracked?

### Contact Activities
- ✅ **created** - New contact created
- ✅ **updated** - Contact details modified
- ✅ **deleted** - Contact removed
- ✅ **status_changed** - Contact status changed
- ✅ **assigned** - Contact assigned to team member

### Deal Activities
- ✅ **created** - New deal created
- ✅ **updated** - Deal details modified
- ✅ **deleted** - Deal removed
- ✅ **status_changed** - Deal moved between stages

### Team Member Activities
- ✅ **member_added** - New team member added
- ✅ **member_removed** - Team member removed
- ✅ **role_changed** - Member role changed

### Other Activities
- ✅ **updated** (settings) - Settings modified
- ✅ **note_added** - Note added to entity

## Quick Test Method

### Step 1: Get Your IDs

Run this in Supabase SQL Editor:

```sql
-- Get your workspace ID
SELECT id, name FROM workspaces;

-- Get your user ID
SELECT id, email FROM profiles;
```

Copy the UUIDs you need.

### Step 2: Create Sample Activities

Replace the UUIDs in this command and run it in Supabase SQL Editor:

```sql
-- Replace YOUR_WORKSPACE_ID and YOUR_USER_ID with actual values
INSERT INTO activity_log (workspace_id, user_id, action, entity_type, details)
VALUES 
  -- Contact created
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'created', 'contact', 
   '{"description": "Created new contact: John Doe"}'),
   
  -- Deal updated
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'updated', 'deal',
   '{"description": "Updated deal value to $50,000"}'),
   
  -- Team member added
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'member_added', 'member',
   '{"description": "Added jane@example.com as Admin"}'),
   
  -- Status changed
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'status_changed', 'contact',
   '{"description": "Changed status from lead to customer"}'),
   
  -- Settings updated
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'updated', 'settings',
   '{"description": "Updated WhatsApp API configuration"}');
```

### Step 3: View Activities

1. Go to your application
2. Click on **"Activity"** in the sidebar navigation
3. You should see all the activities you just created

## Test the Filters

Once you have activities, test the filtering features:

### 1. Search Filter
- Type keywords in the search box (e.g., "contact", "John", "updated")
- Activities matching the search term will appear

### 2. User Filter
- Select a specific user from the dropdown
- Only activities by that user will show

### 3. Entity Type Filter
- Select "Contacts", "Deals", "Team Members", etc.
- Only activities for that entity type will show

### 4. Action Filter
- Select "Created", "Updated", "Deleted", etc.
- Only activities with that action will show

### 5. Combined Filters
- Try multiple filters at once
- Click "Clear Filters" to reset

## Test Real-Time Updates

To test real-time functionality:

1. Keep the Activity Feed page open
2. In another browser tab, go to Supabase SQL Editor
3. Run this command to insert a new activity:

```sql
INSERT INTO activity_log (workspace_id, user_id, action, entity_type, details)
VALUES 
  ('YOUR_WORKSPACE_ID', 'YOUR_USER_ID', 'created', 'contact',
   '{"description": "Real-time test activity"}');
```

4. Switch back to the Activity Feed page
5. The new activity should appear automatically (without refresh)

## Test Pagination

To test pagination:

1. Create more than 50 activities (the page size)
2. Navigate to the Activity Feed
3. You should see "Next" and "Previous" buttons at the bottom
4. Click through the pages to verify pagination works

## Creating Activities Through the UI

The best way to populate activities naturally is to:

### Create Contacts
1. Go to Contacts page
2. Click "Add Contact"
3. Fill in details and save
4. ⚠️ Note: Auto-logging not yet implemented, activities must be created manually

### Create Deals
1. Go to Pipeline page
2. Click "Add Deal"
3. Fill in details and save
4. ⚠️ Note: Auto-logging not yet implemented

### Manage Team
1. Go to Settings → Team
2. Add a new team member
3. Change someone's role
4. Remove a team member
5. ⚠️ Note: Auto-logging not yet implemented

## Expected Activity Display

Each activity shows:

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] 👤 John Doe ✏️ updated contact                   │
│        "Changed status from 'lead' to 'customer'"       │
│        ID: ab12cd34...                          2h ago  │
└─────────────────────────────────────────────────────────┘
```

**Visual Elements:**
- Entity icon with colored background (Contact = blue, Deal = green, etc.)
- Action icon (Create = plus, Update = edit, Delete = trash)
- User avatar and name
- Formatted action text
- Details/description
- Entity ID badge
- Relative timestamp

## Troubleshooting

### No Activities Show Up
- Check that you're logged in
- Verify activities exist in your workspace:
  ```sql
  SELECT * FROM activity_log WHERE workspace_id = 'YOUR_WORKSPACE_ID';
  ```
- Check browser console for errors

### Activities Not Updating in Real-Time
- Verify Supabase Realtime is enabled for the `activity_log` table
- Check browser console for subscription errors
- Try refreshing the page

### Filters Not Working
- Clear all filters and try again
- Check that the filter values match actual data
- Verify debouncing (wait 300ms after typing in search)

## Next Steps: Automatic Activity Logging

For automatic activity logging, you'll need to add triggers or manual API calls. Here's an example for contacts:

```typescript
// In your contact creation function
async function createContact(data) {
  // Create the contact
  const contact = await supabase.from('contacts').insert(data);
  
  // Log the activity
  await supabase.from('activity_log').insert({
    workspace_id: currentWorkspace.id,
    user_id: session.user.id,
    action: 'created',
    entity_type: 'contact',
    entity_id: contact.id,
    details: {
      name: data.name,
      email: data.email,
      description: `Created new contact: ${data.name}`
    }
  });
  
  return contact;
}
```

## Summary

The Activity Feed is fully functional and ready to use. The only missing piece is automatic activity logging, which can be added through:

1. **Database triggers** (preferred for production)
2. **Manual API calls** after each CRUD operation
3. **Middleware** that intercepts all database operations

For now, use the SQL scripts provided to populate test data and verify the UI is working correctly.
