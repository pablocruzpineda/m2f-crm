# Phase 4: Contact Management - Implementation Plan

**Status:** Ready to Start  
**Estimated Duration:** ~4-5 hours  
**Dependencies:** Phase 3 (Layout & Navigation) ✅

## Overview

Build a complete contact management system with database schema, CRUD operations, list view with filters, detail view, and form validation.

## Goals

1. Design and implement contact database schema with RLS policies
2. Create contact entity layer (API + hooks)
3. Build contact list view with search and filters
4. Build contact detail view and edit form
5. Implement contact creation and deletion
6. Add contact tags and custom fields support

## Implementation Steps

### Step 1: Database Schema (60 min)

**Create Migration 009: Contact Tables**

```sql
-- contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Social & Web
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  
  -- CRM Data
  source TEXT, -- how they were acquired (e.g., 'website', 'referral', 'event')
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'lead', 'customer'
  notes TEXT,
  
  -- Custom Fields (JSONB for flexibility)
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'lead', 'customer'))
);

-- contact_tags table (many-to-many)
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6', -- hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, name)
);

-- contact_tag_assignments (junction table)
CREATE TABLE contact_tag_assignments (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES contact_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (contact_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contact_tags_workspace ON contact_tags(workspace_id);

-- Updated_at trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Contacts RLS
CREATE POLICY "Users can view contacts in their workspace"
  ON contacts FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create contacts in their workspace"
  ON contacts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update contacts in their workspace"
  ON contacts FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete contacts in their workspace"
  ON contacts FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- Contact Tags RLS (similar policies)
CREATE POLICY "Users can view tags in their workspace"
  ON contact_tags FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create tags in their workspace"
  ON contact_tags FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update tags in their workspace"
  ON contact_tags FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags in their workspace"
  ON contact_tags FOR DELETE
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));

-- Tag Assignments RLS
CREATE POLICY "Users can view tag assignments in their workspace"
  ON contact_tag_assignments FOR SELECT
  USING (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create tag assignments in their workspace"
  ON contact_tag_assignments FOR INSERT
  WITH CHECK (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete tag assignments in their workspace"
  ON contact_tag_assignments FOR DELETE
  USING (contact_id IN (
    SELECT id FROM contacts WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ));
```

### Step 2: Entity Layer - Contact API (45 min)

**Files to Create:**

1. `src/entities/contact/api/contactApi.ts` - Core API functions
2. `src/entities/contact/model/useContacts.ts` - List hook
3. `src/entities/contact/model/useContact.ts` - Single contact hook
4. `src/entities/contact/model/useCreateContact.ts` - Create mutation
5. `src/entities/contact/model/useUpdateContact.ts` - Update mutation
6. `src/entities/contact/model/useDeleteContact.ts` - Delete mutation
7. `src/entities/contact/index.ts` - Public exports

**API Functions:**
- `getContacts(workspaceId, filters)` - Get filtered list
- `getContact(id)` - Get single contact
- `createContact(data)` - Create new contact
- `updateContact(id, data)` - Update contact
- `deleteContact(id)` - Delete contact
- `searchContacts(workspaceId, query)` - Search by name/email

### Step 3: Entity Layer - Contact Tags API (30 min)

**Files to Create:**

1. `src/entities/contact-tag/api/contactTagApi.ts` - Tag API functions
2. `src/entities/contact-tag/model/useContactTags.ts` - Tags list hook
3. `src/entities/contact-tag/model/useCreateTag.ts` - Create tag mutation
4. `src/entities/contact-tag/model/useAssignTag.ts` - Assign tag mutation
5. `src/entities/contact-tag/model/useUnassignTag.ts` - Unassign tag mutation
6. `src/entities/contact-tag/index.ts` - Public exports

### Step 4: Contact List Page (75 min)

**Files to Create:**

1. `src/pages/contacts/ui/ContactsPage.tsx` - Main container
2. `src/pages/contacts/ui/ContactsHeader.tsx` - Header with search + create button
3. `src/pages/contacts/ui/ContactsFilters.tsx` - Status, tags, date filters
4. `src/pages/contacts/ui/ContactsList.tsx` - Table/grid of contacts
5. `src/pages/contacts/ui/ContactsListItem.tsx` - Individual contact card/row
6. `src/pages/contacts/ui/ContactsEmpty.tsx` - Empty state
7. `src/pages/contacts/index.ts` - Public exports

**Features:**
- Search by name, email, company
- Filter by status (active, inactive, lead, customer)
- Filter by tags
- Sort by name, created date, last updated
- Pagination (20 items per page)
- Grid/List view toggle
- Bulk actions (delete, assign tags)

### Step 5: Contact Detail/Edit Page (60 min)

**Files to Create:**

1. `src/pages/contacts/ui/ContactDetailPage.tsx` - Detail view container
2. `src/pages/contacts/ui/ContactInfo.tsx` - Display contact info
3. `src/pages/contacts/ui/ContactEditForm.tsx` - Edit form
4. `src/pages/contacts/ui/ContactTags.tsx` - Tag management
5. `src/pages/contacts/ui/ContactDeleteDialog.tsx` - Confirmation dialog

**Sections:**
- Contact header (name, status, tags)
- Basic information (email, phone, company)
- Address information
- Social links
- Notes section
- Activity timeline (placeholder for Phase 6)
- Edit/Delete actions

### Step 6: Contact Create/Edit Form Feature (60 min)

**Files to Create:**

1. `src/features/contact-form/ui/ContactForm.tsx` - Main form component
2. `src/features/contact-form/ui/BasicInfoSection.tsx` - Name, email, phone
3. `src/features/contact-form/ui/AddressSection.tsx` - Address fields
4. `src/features/contact-form/ui/SocialSection.tsx` - Social links
5. `src/features/contact-form/lib/validation.ts` - Form validation schema
6. `src/features/contact-form/index.ts` - Public exports

**Validation:**
- Required: first_name, workspace_id
- Email format validation
- Phone format validation (optional)
- URL format validation for social links

### Step 7: Routing & Testing (30 min)

**Update `src/App.tsx`:**
```tsx
// Add routes:
/contacts - ContactsPage (list)
/contacts/new - ContactForm (create)
/contacts/:id - ContactDetailPage (view)
/contacts/:id/edit - ContactEditForm (edit)
```

**Testing Checklist:**
- [ ] Create new contact
- [ ] View contact list
- [ ] Search contacts
- [ ] Filter by status
- [ ] View contact details
- [ ] Edit contact
- [ ] Delete contact
- [ ] Create tags
- [ ] Assign/unassign tags
- [ ] Pagination works
- [ ] Form validation works

## File Structure

```
src/
├── entities/
│   ├── contact/
│   │   ├── api/
│   │   │   └── contactApi.ts
│   │   ├── model/
│   │   │   ├── useContacts.ts
│   │   │   ├── useContact.ts
│   │   │   ├── useCreateContact.ts
│   │   │   ├── useUpdateContact.ts
│   │   │   └── useDeleteContact.ts
│   │   └── index.ts
│   └── contact-tag/
│       ├── api/
│       │   └── contactTagApi.ts
│       ├── model/
│       │   ├── useContactTags.ts
│       │   ├── useCreateTag.ts
│       │   ├── useAssignTag.ts
│       │   └── useUnassignTag.ts
│       └── index.ts
├── features/
│   └── contact-form/
│       ├── ui/
│       │   ├── ContactForm.tsx
│       │   ├── BasicInfoSection.tsx
│       │   ├── AddressSection.tsx
│       │   └── SocialSection.tsx
│       ├── lib/
│       │   └── validation.ts
│       └── index.ts
└── pages/
    └── contacts/
        ├── ui/
        │   ├── ContactsPage.tsx
        │   ├── ContactsHeader.tsx
        │   ├── ContactsFilters.tsx
        │   ├── ContactsList.tsx
        │   ├── ContactsListItem.tsx
        │   ├── ContactsEmpty.tsx
        │   ├── ContactDetailPage.tsx
        │   ├── ContactInfo.tsx
        │   ├── ContactEditForm.tsx
        │   ├── ContactTags.tsx
        │   └── ContactDeleteDialog.tsx
        └── index.ts
```

## Type Definitions

```typescript
// Contact types (will be in shared/lib/database/types.ts)
export interface Contact {
  id: string;
  workspace_id: string;
  
  // Basic Info
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  
  // Address
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  
  // Social
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  
  // CRM
  source: string | null;
  status: 'active' | 'inactive' | 'lead' | 'customer';
  notes: string | null;
  custom_fields: Record<string, any>;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContactTag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ContactWithTags extends Contact {
  tags: ContactTag[];
}

export interface ContactFilters {
  search?: string;
  status?: Contact['status'];
  tags?: string[];
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateContactInput {
  workspace_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: Contact['status'];
  notes?: string;
  // ... other optional fields
}

export interface UpdateContactInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: Contact['status'];
  // ... other fields
}
```

## Success Criteria

- [x] Database schema created with proper RLS policies
- [x] Contact CRUD operations working
- [x] Contact list view with search and filters
- [x] Contact detail view with all information
- [x] Contact form with validation
- [x] Tag system working (create, assign, unassign)
- [x] Pagination working
- [x] No TypeScript errors
- [x] Build passes successfully
- [x] All manual tests passing

## Technical Decisions

1. **Data Model:**
   - Use JSONB for custom_fields for flexibility
   - Many-to-many relationship for tags
   - Status enum for type safety
   
2. **UI/UX:**
   - Table view as default, grid view optional
   - Inline editing for quick updates
   - Modal for create/edit forms
   - Confirmation dialog for delete
   
3. **Performance:**
   - Pagination with 20 items per page
   - Debounced search (300ms)
   - Optimistic updates for better UX
   - React Query caching
   
4. **Validation:**
   - Client-side validation with Zod
   - Server-side validation in database constraints
   - Email format validation
   - Required fields: first_name only

## Next Phase Preview

**Phase 5: Pipeline System**
- Pipeline database schema
- Deal/opportunity management
- Kanban board view
- Pipeline stages and automation
- Deal progression tracking

---

**Phase 4 Ready!** Let's build a powerful contact management system! 🚀
