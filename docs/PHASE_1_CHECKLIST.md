# Phase 1 Checklist

Use this checklist to track your progress through Phase 1 setup.

## Setup Checklist

### Prerequisites
- [ ] Node.js 20.19+ or 22.12+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Supabase Setup
- [ ] Created Supabase account
- [ ] Created new project named `m2f-crm`
- [ ] Saved database password securely
- [ ] Copied Project URL
- [ ] Copied anon public key

### Project Configuration
- [ ] Ran `./scripts/setup.sh` OR created `.env` manually
- [ ] Pasted Supabase URL into `.env`
- [ ] Pasted Supabase anon key into `.env`
- [ ] Saved `.env` file

### Database Migration
- [ ] Opened Supabase SQL Editor
- [ ] Copied content from `supabase/migrations/001_initial_schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Ran the migration successfully
- [ ] Verified 4 tables were created:
  - [ ] `profiles`
  - [ ] `workspaces`
  - [ ] `workspace_members`
  - [ ] `invitations`
- [ ] Confirmed RLS is enabled (🔒 icon on each table)

### Verification
- [ ] Ran `npm run dev` successfully
- [ ] Opened `http://localhost:5173` in browser
- [ ] App loads without Supabase errors
- [ ] Browser console shows no errors

### Ready for Next Phase!
- [ ] Confirmed all above steps are complete
- [ ] Ready to proceed with Phase 2 (Authentication UI)

---

## Notes

**Migration Success Indicators:**
- SQL Editor shows: "Success. No rows returned"
- Table Editor shows 4 new tables
- Each table has RLS enabled (lock icon)

**Common Issues:**
- ❌ "Cannot find module" → Already fixed in code
- ❌ "Invalid credentials" → Check `.env` values
- ❌ "Table already exists" → Migration already ran (OK!)

**Need Help?**
See `docs/PHASE_1_ACTION_ITEMS.md` for detailed troubleshooting.

---

**Once complete, you can proceed to Phase 2!** 🎉
