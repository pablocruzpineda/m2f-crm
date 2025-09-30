/**
 * Quick database connectivity test
 * Run with: npx tsx scripts/test-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Database } from '../src/shared/lib/supabase/types.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connectivity...\n');

  // Test 1: Check if profiles table exists
  console.log('1. Checking profiles table...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profilesError) {
    console.error('❌ Profiles table error:', profilesError.message);
  } else {
    console.log('✅ Profiles table exists');
  }

  // Test 2: Check if workspaces table exists
  console.log('\n2. Checking workspaces table...');
  const { data: workspaces, error: workspacesError } = await supabase
    .from('workspaces')
    .select('*')
    .limit(1);

  if (workspacesError) {
    console.error('❌ Workspaces table error:', workspacesError.message);
  } else {
    console.log('✅ Workspaces table exists');
  }

  // Test 3: Check if workspace_members table exists
  console.log('\n3. Checking workspace_members table...');
  const { data: members, error: membersError } = await supabase
    .from('workspace_members')
    .select('*')
    .limit(1);

  if (membersError) {
    console.error('❌ Workspace members table error:', membersError.message);
  } else {
    console.log('✅ Workspace members table exists');
  }

  // Test 4: Check if create_workspace_with_owner function exists
  console.log('\n4. Testing create_workspace_with_owner RPC...');
  const { error: rpcError } = await supabase.rpc('create_workspace_with_owner', {
    workspace_name: 'Test',
    workspace_slug: 'test-' + Date.now(),
    user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
  });

  if (rpcError) {
    console.error('❌ RPC function error:', rpcError.message);
    console.log('   (This is expected if you\'re not authenticated)');
  } else {
    console.log('✅ RPC function exists');
  }

  console.log('\n✅ Database connectivity test complete!');
}

testDatabase().catch(console.error);
