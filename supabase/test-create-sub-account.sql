-- TEST SCRIPT: Create a sub-account for testing multi-tenant feature
-- This will create a separate workspace for your admin user

-- ============================================
-- STEP 1: Get your current workspace info
-- ============================================
-- Run this first to get the IDs you need:

SELECT 
    w.id as master_workspace_id,
    w.name as master_workspace_name,
    w.owner_id as master_owner_id,
    w.parent_workspace_id,
    p.email as owner_email
FROM workspaces w
JOIN profiles p ON p.id = w.owner_id
WHERE w.parent_workspace_id IS NULL  -- Master workspaces only
ORDER BY w.created_at;

-- ============================================
-- STEP 2: Get your admin user info
-- ============================================
-- Find the admin user you want to give a sub-account:

SELECT 
    wm.user_id,
    p.email,
    p.full_name,
    wm.role,
    wm.workspace_id
FROM workspace_members wm
JOIN profiles p ON p.id = wm.user_id
WHERE wm.role = 'admin'
ORDER BY wm.created_at DESC;

-- ============================================
-- STEP 3: Create the sub-account
-- ============================================
-- Replace these values with the actual IDs from steps 1 and 2:
--
-- p_master_workspace_id: Your master workspace ID
-- p_sub_account_name: Name for the admin's client workspace (e.g., "Client ABC")
-- p_sub_account_slug: Unique slug (e.g., "client-abc")
-- p_admin_user_id: The admin's user ID
-- p_master_owner_id: Your user ID (the master owner)

SELECT create_sub_account_workspace(
    p_master_workspace_id := 'REPLACE_WITH_MASTER_WORKSPACE_ID',  -- From STEP 1
    p_sub_account_name := 'Test Client Workspace',  -- Change this name
    p_sub_account_slug := 'test-client-workspace',  -- Change this slug
    p_admin_user_id := 'REPLACE_WITH_ADMIN_USER_ID',  -- From STEP 2
    p_master_owner_id := 'REPLACE_WITH_YOUR_USER_ID'  -- From STEP 1
);

-- This will return the new sub-account workspace ID

-- ============================================
-- STEP 4: Verify the sub-account was created
-- ============================================

SELECT 
    w.id,
    w.name,
    w.slug,
    w.parent_workspace_id,
    w.owner_id,
    p.email as owner_email
FROM workspaces w
JOIN profiles p ON p.id = w.owner_id
WHERE w.parent_workspace_id IS NOT NULL  -- Sub-accounts only
ORDER BY w.created_at DESC;

-- ============================================
-- STEP 5: Verify the admin has owner role in their sub-account
-- ============================================

SELECT 
    w.name as workspace_name,
    w.parent_workspace_id,
    p.email as user_email,
    wm.role
FROM workspace_members wm
JOIN workspaces w ON w.id = wm.workspace_id
JOIN profiles p ON p.id = wm.user_id
WHERE w.parent_workspace_id IS NOT NULL
ORDER BY w.name, wm.role;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- After running STEP 3, you should see:
--   1. A new workspace with parent_workspace_id = your master workspace ID
--   2. The admin user has role = 'owner' in the sub-account workspace
--   3. You (master owner) also have role = 'owner' in the sub-account workspace
--   4. The admin can now log in and switch to their sub-account workspace
--   5. In their sub-account, they can change the theme (appearance settings)
--   6. Their data (contacts, deals, meetings) is separate from your master workspace data
