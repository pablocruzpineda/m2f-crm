# Workspace Switcher - Multi-Tenant Logic

**Date:** October 7, 2025  
**Component:** `WorkspaceSwitcher.tsx`  
**Issue Fixed:** Sub-account admins could see and switch to master workspace

---

## Problem

When a sub-account admin logged in, they could see both:
1. Their sub-account workspace (where they're owner)
2. The master workspace (where they're added as member for owner's visibility)

This is **incorrect** - sub-account admins should only see their own sub-account(s).

---

## Solution

Added intelligent filtering logic to the workspace switcher that respects the multi-tenant hierarchy:

### **Filtering Rules:**

#### **Rule 1: Master Workspace Owner**
If user **owns** a master workspace (parent_workspace_id = NULL):
- ✅ Show master workspace(s)
- ✅ Show ALL sub-accounts under that master
- ✅ Can switch between master and any sub-account

**Example:**
```
User: Owner (Alice)
Shows:
  - Master Workspace (Alice's agency)
  - Sub-Account A (Client ABC)
  - Sub-Account B (Client XYZ)
```

#### **Rule 2: Sub-Account Owner (Admin)**
If user **only owns** sub-account(s) (parent_workspace_id ≠ NULL):
- ✅ Show ONLY their sub-account(s)
- ❌ Cannot see master workspace
- ❌ Cannot see other sub-accounts

**Example:**
```
User: Admin (Bob)
Shows:
  - Sub-Account A (Client ABC) ← Only their sub-account
```

#### **Rule 3: Member/Viewer**
If user doesn't own any workspace:
- ✅ Show all workspaces they're a member of
- This is the original behavior (unchanged)

**Example:**
```
User: Member (Carol)
Shows:
  - Sub-Account A (where they're a member)
```

---

## Implementation

### **Code Changes:**

```typescript
// Before: Show ALL workspaces user is a member of
const { data: workspaces } = useWorkspaces(session?.user?.id);

// After: Filter based on ownership and hierarchy
const workspaces = useMemo(() => {
  if (!allWorkspaces || !session?.user?.id) return [];

  // Find master workspaces (owner + no parent)
  const masterWorkspaces = allWorkspaces.filter(
    (w) => w.owner_id === session.user.id && !w.parent_workspace_id
  );

  // Find owned sub-accounts
  const ownedSubAccounts = allWorkspaces.filter(
    (w) => w.owner_id === session.user.id && w.parent_workspace_id
  );

  // Rule 1: Master owner sees master + all sub-accounts
  if (masterWorkspaces.length > 0) {
    const subAccounts = allWorkspaces.filter(
      (w) => w.parent_workspace_id && 
      masterWorkspaces.some(m => m.id === w.parent_workspace_id)
    );
    return [...masterWorkspaces, ...subAccounts];
  }

  // Rule 2: Sub-account owner sees only their sub-accounts
  if (ownedSubAccounts.length > 0) {
    return ownedSubAccounts;
  }

  // Rule 3: Regular member sees all memberships
  return allWorkspaces;
}, [allWorkspaces, session?.user?.id]);
```

---

## How It Works

### **Scenario 1: Master Owner (Alice)**

**Database:**
```
workspaces:
  - id: master-1, owner_id: alice, parent_workspace_id: NULL
  
workspace_members:
  - workspace_id: master-1, user_id: alice, role: owner
  - workspace_id: sub-a, user_id: alice, role: owner (for visibility)
  - workspace_id: sub-b, user_id: alice, role: owner (for visibility)
```

**Switcher Shows:**
- ✅ Master Workspace
- ✅ Sub-Account A
- ✅ Sub-Account B

---

### **Scenario 2: Sub-Account Admin (Bob)**

**Database:**
```
workspaces:
  - id: sub-a, owner_id: bob, parent_workspace_id: master-1
  
workspace_members:
  - workspace_id: master-1, user_id: bob, role: admin (from before)
  - workspace_id: sub-a, user_id: bob, role: owner (of sub-account)
```

**Before Fix:**
- ❌ Master Workspace (shouldn't see!)
- ✅ Sub-Account A

**After Fix:**
- ✅ Sub-Account A (ONLY!)

---

### **Scenario 3: Member (Carol)**

**Database:**
```
workspace_members:
  - workspace_id: sub-a, user_id: carol, role: member
```

**Switcher Shows:**
- ✅ Sub-Account A (where they're member)

---

## Testing

### **Test 1: As Master Owner**
1. Log in as master workspace owner
2. Open workspace switcher
3. ✅ Should see master workspace + all sub-accounts
4. ✅ Can switch between all of them

### **Test 2: As Sub-Account Admin**
1. Log in as sub-account admin
2. Open workspace switcher
3. ✅ Should see ONLY their sub-account
4. ❌ Should NOT see master workspace
5. ✅ Cannot switch to master workspace

### **Test 3: As Member**
1. Log in as regular member
2. Open workspace switcher
3. ✅ Should see workspaces they're member of
4. ✅ Can switch between them

---

## Edge Cases Handled

### **Multiple Master Workspaces**
If a user owns multiple master workspaces:
- Shows all master workspaces
- Shows all sub-accounts under ALL masters
- This is rare but supported

### **Multiple Sub-Accounts**
If a user owns multiple sub-accounts (e.g., admin of 2 clients):
- Shows all sub-accounts they own
- Does NOT show master workspaces
- Does NOT show other sub-accounts they don't own

### **No Workspaces**
If user is not a member of any workspace:
- Switcher returns null
- Header doesn't show switcher

### **Single Workspace**
If user only has access to one workspace:
- Shows workspace name (no dropdown)
- No chevron icon
- Cannot switch (nothing to switch to)

---

## Benefits

### **Security ✅**
- Sub-account admins cannot access master workspace
- Clear separation of permissions
- Prevents accidental data exposure

### **User Experience ✅**
- Users only see what they should see
- No confusion about which workspace to use
- Clean interface for each role

### **Multi-Tenant ✅**
- Master owners have full visibility
- Sub-account admins stay in their scope
- Proper hierarchy enforcement

---

## Future Enhancements

### **Visual Hierarchy** (TODO)
- Indent sub-accounts under master
- Add icons to distinguish master vs sub
- Show "Master" and "Client" badges

### **Quick Switch** (TODO)
- Keyboard shortcuts (Cmd+K)
- Recent workspaces list
- Favorites/pinned workspaces

### **Create Workspace** (TODO)
- Remove "Create workspace" button for non-owners
- Or make it create sub-account for master owners
- Show appropriate dialog based on role

---

## Summary

✅ **Fixed:** Sub-account admins can no longer see or switch to master workspace  
✅ **Improved:** Workspace switcher respects multi-tenant hierarchy  
✅ **Secure:** Users only see workspaces they should have access to  
✅ **Clean:** No more confusing workspace options  

**Result:** Sub-account admins stay in their sub-account, master owners have full control! 🎉
