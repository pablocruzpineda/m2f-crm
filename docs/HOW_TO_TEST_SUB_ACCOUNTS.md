# How to Create and Test Sub-Accounts 🚀

**Quick Start Guide**

---

## Prerequisites

✅ You have a master workspace (existing workspace)  
✅ You are the owner of the workspace  
✅ You have at least one team member added (admin, member, or viewer)

---

## Step 1: Add a Team Member (If You Don't Have One)

1. Go to **Settings → Team**
2. Click **"Invite Member"**
3. Enter email address
4. Select role: **Admin** (recommended for testing)
5. Send invitation
6. Have them accept the invitation

---

## Step 2: Create Your First Sub-Account

1. Go to **Settings → Sub-Accounts**
2. Click **"Create Sub-Account"** button
3. Fill in the form:
   - **Name:** "Test Client Company"
   - **Slug:** Will auto-generate as "test-client-company"
   - **Administrator:** Select the team member you added
4. Click **"Create Sub-Account"**

**✅ Success!** You should see:
- Toast notification: "Sub-account created successfully"
- New sub-account card appears
- Shows admin name and email

---

## Step 3: Test as the Admin User

### Option A: Use Incognito/Private Browser
1. Open incognito/private browser window
2. Log in with the admin user's credentials
3. You should see **two workspaces** in the workspace switcher:
   - Your master workspace
   - The new sub-account workspace

### Option B: Log Out and Back In
1. Log out of your owner account
2. Log in with the admin user's credentials

### What to Test:

#### ✅ **Test 1: Switch to Sub-Account Workspace**
1. Click on the workspace switcher (top-left)
2. Select the sub-account workspace
3. You are now in the admin's sub-account!

#### ✅ **Test 2: Change Appearance**
1. While in the sub-account workspace, go to **Settings → Appearance**
2. You should **NOT** see "Access Restricted" ❌
3. You **SHOULD** be able to change:
   - Primary color
   - Secondary color
   - Accent color
   - Theme mode (light/dark)
4. Click "Save Theme"
5. **Result:** Theme should change for this sub-account only!

#### ✅ **Test 3: Verify Data Isolation**
1. Go to **Contacts**
2. Create a new contact: "Client Contact ABC"
3. Switch back to master workspace (use workspace switcher)
4. Go to **Contacts**
5. **Result:** You should NOT see "Client Contact ABC" ❌
   - This proves data isolation works!

#### ✅ **Test 4: Admin Cannot See Other Sub-Accounts**
1. While logged in as admin, go to **Settings → Sub-Accounts**
2. **Result:** You should see "Access Restricted" ✅
3. **Why:** Only master workspace owner can manage sub-accounts

---

## Step 4: Test as Master Owner

1. Log back in as the master workspace owner
2. Go to **Settings → Sub-Accounts**
3. You should see your sub-account listed

### What to Test:

#### ✅ **Test 5: View Sub-Account Details**
1. Look at the sub-account card
2. Verify it shows:
   - Sub-account name
   - Admin name and email
   - Member count (should be 2: admin + you)
   - Created date

#### ✅ **Test 6: Delete Sub-Account** (Optional)
1. Click the trash icon on the sub-account card
2. Confirmation dialog appears with warning
3. Click "Delete Sub-Account"
4. **Result:** Sub-account disappears, toast notification shown
5. **Note:** This deletes ALL data in that sub-account!

---

## Common Issues & Solutions

### Issue 1: "Access Restricted" When Creating Sub-Account
**Cause:** You're not the owner of the master workspace  
**Solution:** Make sure you're logged in as the workspace owner

### Issue 2: "No Team Members Available" in Dialog
**Cause:** You haven't added any team members yet  
**Solution:** Go to Settings → Team → Invite Member first

### Issue 3: Admin Still Sees "Access Restricted" in Appearance
**Cause:** Admin is still in the master workspace, not the sub-account  
**Solution:** Use the workspace switcher to switch to the sub-account workspace

### Issue 4: Cannot Find Sub-Accounts Menu
**Cause:** You're in a sub-account workspace  
**Solution:** Switch back to the master workspace first

### Issue 5: TypeScript Error in IDE
**Cause:** IDE cache issue  
**Solution:** Restart TypeScript server or wait a moment

---

## Expected Results Summary

| User | Workspace | Appearance Access | Sub-Accounts Access | See Master Data | See Sub Data |
|------|-----------|-------------------|---------------------|-----------------|--------------|
| **Owner** | Master | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes (all) |
| **Owner** | Sub-Account A | ✅ Yes | ❌ No | ❌ No | ✅ Yes (A only) |
| **Admin** | Master | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Admin** | Sub-Account (theirs) | ✅ Yes | ❌ No | ❌ No | ✅ Yes (theirs) |
| **Member** | Master | ❌ No | ❌ No | ⚠️ Assigned only | ❌ No |
| **Member** | Sub-Account | ❌ No | ❌ No | ❌ No | ⚠️ Assigned only |

**Legend:**
- ✅ Full access
- ❌ No access / Restricted
- ⚠️ Limited access (assigned items only)

---

## What You've Accomplished! 🎉

After following this guide, you now have:

1. ✅ A **master workspace** (your agency)
2. ✅ A **sub-account workspace** (for a client)
3. ✅ An **admin user** who owns the sub-account
4. ✅ **Separate data** for master and sub-account
5. ✅ **Theme customization** per workspace
6. ✅ **Multi-tenant architecture** working!

---

## Next Steps

### For Production Use:

1. **Invite Real Clients:**
   - Add them as team members first
   - Create sub-accounts for each client
   - Each client becomes owner of their sub-account

2. **Customize Each Sub-Account:**
   - Each admin can set their own theme
   - Each admin can upload their own logo
   - Branding per client!

3. **Manage Multiple Clients:**
   - All your clients listed in Sub-Accounts page
   - Quick overview of member counts
   - Easy to create new clients

4. **Data Isolation:**
   - Each client sees only their data
   - You (master owner) see everything
   - Perfect for agency/SaaS model

---

## Troubleshooting Tips

### Can't Switch Workspaces?
- Make sure you're using the workspace switcher (top-left)
- Should show all workspaces you're a member of
- Click to switch instantly

### Still See Old Data After Switching?
- Refresh the page
- React Query cache might be stale
- Should auto-update, but refresh helps

### Admin Can't Change Theme?
- Verify they're in the **sub-account workspace**, not master
- Check workspace switcher shows correct workspace
- Only owners of a workspace can change theme

---

**Need Help?** Check the full documentation in:
- `docs/SUB_ACCOUNTS_UI_COMPLETE.md`
- `docs/MULTI_TENANT_IMPLEMENTATION_PROGRESS.md`
- `docs/MULTI_TENANT_ANALYSIS.md`

**Happy Testing! 🚀**
