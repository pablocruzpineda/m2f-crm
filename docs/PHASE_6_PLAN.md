# Phase 6: Calendar & Meeting Management - Implementation Plan

**Phase**: 6  
**Name**: Calendar & Meeting Management  
**Started**: October 6, 2025  
**Status**: 🚧 In Progress  
**Estimated Duration**: 4-5 weeks

---

## 🎯 Objectives

Build a complete calendar and meeting management system with:
- Multi-view calendar (Month/Week/Day)
- Meeting scheduling with participants
- Meeting notes (simple textarea)
- Dual notification system (browser + in-app toast)
- Availability management with calendar display
- Full timezone support
- Real-time updates
- Integration with contacts and deals

**Note**: Tasks feature excluded from this phase (meetings only)

---

## 📦 Technology Stack

### Calendar Library
- **react-big-calendar** - Main calendar component
- **date-fns** - Date manipulation (already in project)
- **date-fns-tz** - Timezone support

### Notifications
- **Browser Notification API** - System notifications
- **Sonner (toast)** - In-app notifications (already in project)

### UI Components
- **Radix UI** - Dialogs, dropdowns (already in project)
- **Tailwind CSS** - Styling (already in project)
- **Lucide React** - Icons (already in project)

---

## 🗄️ Database Schema

### Tables to Create (6 new tables)

#### 1. `meetings`
```sql
- id (UUID, PK)
- workspace_id (UUID, FK → workspaces)
- title (TEXT, required)
- description (TEXT)
- start_time (TIMESTAMPTZ, required)
- end_time (TIMESTAMPTZ, required)
- timezone (TEXT, required) -- 'America/New_York', 'UTC', etc.
- location (TEXT)
- meeting_url (TEXT) -- Zoom, Meet, Teams link
- status (TEXT) -- 'scheduled', 'completed', 'cancelled'
- created_by (UUID, FK → profiles)
- contact_id (UUID, FK → contacts, nullable)
- deal_id (UUID, FK → deals, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 2. `meeting_participants`
```sql
- id (UUID, PK)
- meeting_id (UUID, FK → meetings, CASCADE)
- user_id (UUID, FK → profiles, CASCADE, nullable)
- contact_id (UUID, FK → contacts, CASCADE, nullable)
- status (TEXT) -- 'pending', 'accepted', 'declined', 'tentative'
- created_at (TIMESTAMPTZ)
- CHECK: (user_id IS NOT NULL OR contact_id IS NOT NULL)
```

#### 3. `meeting_notes`
```sql
- id (UUID, PK)
- meeting_id (UUID, FK → meetings, CASCADE)
- content (TEXT, required)
- created_by (UUID, FK → profiles)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 4. `reminders`
```sql
- id (UUID, PK)
- workspace_id (UUID, FK → workspaces, CASCADE)
- user_id (UUID, FK → profiles, CASCADE)
- meeting_id (UUID, FK → meetings, CASCADE)
- remind_at (TIMESTAMPTZ, required)
- status (TEXT) -- 'pending', 'sent', 'dismissed'
- sent_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

#### 5. `availability_slots`
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles, CASCADE)
- workspace_id (UUID, FK → workspaces, CASCADE)
- day_of_week (INTEGER) -- 0-6 (Sunday-Saturday)
- start_time (TIME, required)
- end_time (TIME, required)
- timezone (TEXT, required)
- is_available (BOOLEAN, default true)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- UNIQUE(user_id, workspace_id, day_of_week, start_time)
```

#### 6. `time_off`
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles, CASCADE)
- workspace_id (UUID, FK → workspaces, CASCADE)
- start_date (DATE, required)
- end_date (DATE, required)
- reason (TEXT)
- status (TEXT) -- 'pending', 'approved', 'rejected'
- created_at (TIMESTAMPTZ)
- CHECK: (end_date >= start_date)
```

### Indexes to Create
```sql
-- Meetings
CREATE INDEX idx_meetings_workspace_id ON meetings(workspace_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_contact_id ON meetings(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_meetings_deal_id ON meetings(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_meetings_date_range ON meetings(workspace_id, start_time, end_time);

-- Participants
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_meeting_participants_contact_id ON meeting_participants(contact_id) WHERE contact_id IS NOT NULL;

-- Notes
CREATE INDEX idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);

-- Reminders
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX idx_reminders_status ON reminders(status) WHERE status = 'pending';

-- Availability
CREATE INDEX idx_availability_slots_user_id ON availability_slots(user_id, workspace_id);

-- Time Off
CREATE INDEX idx_time_off_user_id ON time_off(user_id, workspace_id);
CREATE INDEX idx_time_off_dates ON time_off(start_date, end_date);
```

### RLS Policies
All tables will have workspace-scoped RLS policies similar to existing entities.

---

## 🏗️ File Structure

### Entity Layer

```
src/entities/
├── meeting/
│   ├── api/
│   │   ├── meetingApi.ts
│   │   ├── meetingParticipantsApi.ts
│   │   └── meetingNotesApi.ts
│   ├── model/
│   │   ├── useMeetings.ts
│   │   ├── useMeeting.ts
│   │   ├── useCreateMeeting.ts
│   │   ├── useUpdateMeeting.ts
│   │   ├── useDeleteMeeting.ts
│   │   ├── useMeetingParticipants.ts
│   │   ├── useAddParticipant.ts
│   │   ├── useRemoveParticipant.ts
│   │   ├── useMeetingNotes.ts
│   │   ├── useCreateNote.ts
│   │   ├── useMeetingSubscription.ts
│   │   └── types.ts
│   └── index.ts
│
├── reminder/
│   ├── api/
│   │   └── reminderApi.ts
│   ├── model/
│   │   ├── useReminders.ts
│   │   ├── useCreateReminder.ts
│   │   ├── useDismissReminder.ts
│   │   ├── useReminderSubscription.ts
│   │   └── types.ts
│   └── index.ts
│
└── availability/
    ├── api/
    │   ├── availabilityApi.ts
    │   └── timeOffApi.ts
    ├── model/
    │   ├── useAvailability.ts
    │   ├── useUpdateAvailability.ts
    │   ├── useTimeOff.ts
    │   ├── useCreateTimeOff.ts
    │   ├── useDeleteTimeOff.ts
    │   └── types.ts
    └── index.ts
```

### Pages & Components

```
src/pages/
├── calendar/
│   ├── ui/
│   │   ├── CalendarPage.tsx
│   │   ├── MeetingDetailPage.tsx
│   │   ├── MeetingCreatePage.tsx
│   │   └── MeetingEditPage.tsx
│   ├── components/
│   │   ├── CalendarView.tsx        # react-big-calendar wrapper
│   │   ├── MeetingCard.tsx
│   │   ├── MeetingForm.tsx
│   │   ├── ParticipantSelector.tsx
│   │   ├── MeetingNotesList.tsx
│   │   ├── MeetingNoteForm.tsx
│   │   ├── ViewSwitcher.tsx        # Month/Week/Day tabs
│   │   ├── AvailabilityOverlay.tsx # Show busy/free blocks
│   │   └── TimezoneSelector.tsx
│   └── index.ts
│
└── availability/
    ├── ui/
    │   └── AvailabilitySettingsPage.tsx
    ├── components/
    │   ├── WeeklyScheduleEditor.tsx
    │   ├── TimeSlotEditor.tsx
    │   ├── TimeOffCalendar.tsx
    │   └── TimeOffForm.tsx
    └── index.ts
```

### Shared Components

```
src/shared/ui/
├── calendar/
│   └── DateTimePicker.tsx      # With timezone support
├── notifications/
│   ├── NotificationCenter.tsx  # Dropdown bell icon
│   └── NotificationItem.tsx
└── timezone/
    └── TimezoneUtils.ts        # Helper functions
```

### Widgets

```
src/widgets/
└── notification-center/
    ├── ui/
    │   └── NotificationCenter.tsx
    └── index.ts
```

---

## 🚀 Implementation Phases

### **Phase 6.1: Database Foundation** (Week 1)
**Goal**: Complete database schema and migrations

- [ ] Migration 044: Create meetings table
- [ ] Migration 045: Create meeting_participants table
- [ ] Migration 046: Create meeting_notes table
- [ ] Migration 047: Create reminders table
- [ ] Migration 048: Create availability_slots table
- [ ] Migration 049: Create time_off table
- [ ] Add all indexes
- [ ] Add RLS policies for all tables
- [ ] Enable Realtime for meetings table
- [ ] Test migrations locally

**Deliverables**: 6 new migrations, complete database schema

---

### **Phase 6.2: Entity Layer - Meetings** (Week 1-2)
**Goal**: Build meeting entity with full CRUD

- [ ] Install dependencies (react-big-calendar, date-fns-tz)
- [ ] Create TypeScript types (Meeting, MeetingParticipant, MeetingNote)
- [ ] Build meetingApi.ts (CRUD operations)
- [ ] Build meetingParticipantsApi.ts
- [ ] Build meetingNotesApi.ts
- [ ] Create useMeetings hook (with date range filter)
- [ ] Create useMeeting hook (single meeting)
- [ ] Create useCreateMeeting hook
- [ ] Create useUpdateMeeting hook
- [ ] Create useDeleteMeeting hook
- [ ] Create useMeetingParticipants hook
- [ ] Create useAddParticipant hook
- [ ] Create useRemoveParticipant hook
- [ ] Create useMeetingNotes hook
- [ ] Create useCreateNote hook
- [ ] Create useMeetingSubscription hook (real-time)
- [ ] Add activity logging for meeting actions

**Deliverables**: Complete meeting entity (~15 files)

---

### **Phase 6.3: Calendar Views** (Week 2)
**Goal**: Implement calendar with month/week/day views

- [ ] Setup react-big-calendar
- [ ] Create CalendarView component
- [ ] Implement month view
- [ ] Implement week view
- [ ] Implement day view
- [ ] Add ViewSwitcher (tabs)
- [ ] Add date navigation (prev/next/today)
- [ ] Add timezone selector
- [ ] Display meetings on calendar
- [ ] Color-code meeting types
- [ ] Handle click to open meeting details
- [ ] Handle double-click to create meeting
- [ ] Add loading states
- [ ] Responsive design

**Deliverables**: Fully functional calendar page

---

### **Phase 6.4: Meeting Management** (Week 2-3) ✅ COMPLETE
**Goal**: Complete meeting CRUD UI

- [x] Create MeetingForm component
  - [x] Title, description fields
  - [x] DateTime picker with timezone
  - [x] Duration selector
  - [x] Location field
  - [x] Meeting URL field
  - [x] Participant selector (team + contacts)
  - [x] Contact/Deal linking
  - [x] Form validation
- [x] Create MeetingCreatePage
- [x] Create MeetingEditPage
- [x] Create MeetingDetailPage
  - [x] Meeting info display
  - [x] Participant list with RSVP status
  - [x] Meeting notes section (with rich text!)
  - [x] Add note form (Tiptap editor)
  - [x] Edit/Delete actions
  - [x] Join meeting button (if URL exists)
- [x] Create MeetingCard component
- [x] Add delete confirmation dialog
- [x] Add toast notifications for actions
- [x] Link to contacts/deals from meeting

**Deliverables**: Complete meeting UI (~8 components) ✅
**Extra**: Rich text notes with Tiptap editor (formatting, lists, links, code blocks, etc.)

---

### **Phase 6.5: Availability Management** (Week 3)
**Goal**: Working hours and time off management

- [ ] Create availability entity (API + hooks)
- [ ] Create time off entity (API + hooks)
- [ ] Build AvailabilitySettingsPage
- [ ] Build WeeklyScheduleEditor component
  - [ ] 7-day grid
  - [ ] Time slot editor
  - [ ] Timezone display
  - [ ] Save/Reset buttons
- [ ] Build TimeOffCalendar component
- [ ] Build TimeOffForm component
- [ ] Create AvailabilityOverlay for calendar
  - [ ] Show busy/free blocks
  - [ ] Show time off periods
  - [ ] Visual distinction (colors/patterns)
- [ ] Display availability on calendar view
- [ ] Conflict detection when scheduling

**Deliverables**: Availability system (~10 files)

---

### **Phase 6.6: Reminders & Notifications** (Week 4)
**Goal**: Dual notification system

- [ ] Create reminder entity (API + hooks)
- [ ] Build reminderApi.ts
- [ ] Create useReminders hook
- [ ] Create useCreateReminder hook
- [ ] Create useDismissReminder hook
- [ ] Create useReminderSubscription hook
- [ ] Build NotificationCenter component
  - [ ] Bell icon in header
  - [ ] Dropdown with reminders
  - [ ] Mark as read
  - [ ] Dismiss functionality
- [ ] Implement browser notifications
  - [ ] Request permission
  - [ ] Send at remind_at time
  - [ ] Click to open meeting
- [ ] Implement toast notifications
  - [ ] Show for upcoming meetings
  - [ ] Snooze functionality
- [ ] Auto-create reminders on meeting creation
- [ ] Reminder settings (15 min, 1 hour, 1 day before)
- [ ] Background worker for checking reminders

**Deliverables**: Complete notification system (~8 files)

---

### **Phase 6.7: Integration & Polish** (Week 4-5)
**Goal**: Connect everything and refine

- [ ] Add "Schedule Meeting" button to contact detail page
- [ ] Add "Schedule Meeting" button to deal detail page
- [ ] Show upcoming meetings on dashboard
- [ ] Add meetings to activity feed
- [ ] Add Calendar link to sidebar navigation
- [ ] Add meeting count badge (if upcoming today)
- [ ] Implement real-time calendar updates
- [ ] Add meeting search/filters
- [ ] Export meeting to calendar file (.ics)
- [ ] Responsive design improvements
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Accessibility improvements

**Deliverables**: Fully integrated feature

---

### **Phase 6.8: Testing & Documentation** (Week 5)
**Goal**: Ensure quality and document

- [ ] Test all CRUD operations
- [ ] Test real-time updates
- [ ] Test notifications (browser + toast)
- [ ] Test timezone handling
- [ ] Test availability display
- [ ] Test conflict detection
- [ ] Test with multiple users
- [ ] Test mobile responsiveness
- [ ] Create user documentation
- [ ] Update PROGRESS.md
- [ ] Create PHASE_6_COMPLETE.md
- [ ] Document API endpoints
- [ ] Document component usage

**Deliverables**: Complete documentation

---

## 🎨 UI/UX Design

### Calendar Page Layout
```
┌─────────────────────────────────────────────┐
│ Calendar                      [Month|Week|Day]│
│                                               │
│  ← September 2025 →        [Today] [+ New]   │
│                                               │
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat          │
│  ┌───┬───┬───┬───┬───┬───┬───┐              │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │              │
│  ├───┼───┼───┼───┼───┼───┼───┤              │
│  │ 8 │ 9 │10 │11 │12 │13 │14 │              │
│  │   │  ╔═══════════╗  │   │   │            │
│  │   │  ║Meeting    ║  │   │   │            │
│  │   │  ║10am-11am  ║  │   │   │            │
│  │   │  ╚═══════════╝  │   │   │            │
│  └───┴───┴───┴───┴───┴───┴───┘              │
│  [Availability: Busy blocks shown in gray]   │
└─────────────────────────────────────────────┘
```

### Meeting Detail Page Layout
```
┌─────────────────────────────────────────────┐
│ ← Back to Calendar                [Edit] [⋮] │
│                                               │
│ Team Standup Meeting                         │
│ Monday, October 9, 2025                      │
│ 10:00 AM - 11:00 AM (America/New_York)      │
│                                               │
│ 📍 Conference Room A                         │
│ 🔗 https://zoom.us/j/123456789               │
│                                               │
│ ┌─ Participants ──────────────────────┐      │
│ │ ✓ John Doe (Accepted)               │      │
│ │ ? Jane Smith (Pending)              │      │
│ │ 📧 client@example.com (Contact)     │      │
│ └────────────────────────────────────┘       │
│                                               │
│ ┌─ Notes ─────────────────────────────┐      │
│ │ • Discussed Q4 goals                │      │
│ │ • Action items assigned             │      │
│ │                                     │      │
│ │ [+ Add Note]                        │      │
│ └────────────────────────────────────┘       │
│                                               │
│ Linked to: Deal #123, Contact: John Doe     │
└─────────────────────────────────────────────┘
```

---

## 📋 Key Features

### Calendar Features
- ✅ Month/Week/Day views
- ✅ Drag to select time slot (create meeting)
- ✅ Click meeting to view details
- ✅ Color-coded meetings by type
- ✅ Timezone display and conversion
- ✅ Availability overlay (busy/free blocks)
- ✅ Time off periods shown
- ✅ Real-time updates
- ✅ Today indicator
- ✅ Responsive design

### Meeting Features
- ✅ Title, description, time range
- ✅ Location (physical or virtual)
- ✅ Meeting URL (Zoom, Teams, Meet)
- ✅ Multiple participants (team + contacts)
- ✅ RSVP status tracking
- ✅ Meeting notes (multiple per meeting)
- ✅ Link to contacts/deals
- ✅ Status: scheduled/completed/cancelled
- ✅ Timezone support
- ✅ Conflict detection

### Reminder Features
- ✅ Browser notifications
- ✅ In-app toast notifications
- ✅ Auto-reminders (15 min, 1 hour, 1 day before)
- ✅ Manual reminder creation
- ✅ Snooze functionality
- ✅ Dismiss reminders
- ✅ Notification center (bell icon)
- ✅ Badge count for unread

### Availability Features
- ✅ Weekly schedule editor
- ✅ Different hours per day
- ✅ Timezone-aware
- ✅ Time off management
- ✅ Display on calendar
- ✅ Conflict detection
- ✅ Override for specific dates

---

## 🔒 Permissions

All features will respect existing role-based permissions:

- **Owner/Admin**: Full access to all meetings, can manage all
- **Member**: Can view workspace meetings, create own meetings, edit own meetings
- **Viewer**: Can view workspace meetings, cannot create/edit

Availability is always user-specific (private).

---

## 📊 Success Metrics

- [ ] All 6 database tables created with RLS
- [ ] Zero TypeScript compilation errors
- [ ] All CRUD operations working
- [ ] Real-time updates functional
- [ ] Calendar displays meetings correctly
- [ ] Notifications working (browser + toast)
- [ ] Availability displayed on calendar
- [ ] Timezone conversions accurate
- [ ] Mobile responsive
- [ ] Activity logging integrated
- [ ] ~60+ new files created
- [ ] Complete documentation

---

## 🚧 Known Limitations (MVP)

### Will Implement:
- ✅ Basic meeting scheduling
- ✅ Simple notes (textarea)
- ✅ Browser + toast notifications
- ✅ Availability management
- ✅ Timezone support

### Won't Implement (Future):
- ❌ Recurring meetings
- ❌ Rich text notes
- ❌ Email invitations
- ❌ Calendar sync (Google/Outlook)
- ❌ Video call integration (beyond links)
- ❌ Meeting recording
- ❌ AI meeting summaries
- ❌ Automatic transcription

---

## 📦 Dependencies to Install

```json
{
  "dependencies": {
    "react-big-calendar": "^1.8.5",
    "date-fns-tz": "^2.0.0"
  }
}
```

Note: Other dependencies already in project (date-fns, sonner, radix-ui, etc.)

---

## 🎯 Next Steps

1. ✅ Review and approve this plan
2. ⏳ Install dependencies
3. ⏳ Start Phase 6.1: Database migrations
4. ⏳ Continue with entity layer
5. ⏳ Build UI components
6. ⏳ Integrate and test
7. ⏳ Document and complete

---

**Plan Created**: October 6, 2025  
**Estimated Completion**: Early November 2025  
**Total Estimated Time**: 4-5 weeks
