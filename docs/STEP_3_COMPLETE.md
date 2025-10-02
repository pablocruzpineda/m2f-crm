# Step 3: React Hooks for Invitation Management - COMPLETE ✅

## Overview
Created comprehensive React hooks that provide a clean, type-safe interface for managing team invitations throughout the application. These hooks wrap the API functions and integrate with React Query for caching, optimistic updates, and automatic refetching.

---

## What Was Built

### File Created
**`src/entities/team/model/useTeamInvitations.ts`** (155 lines)

### Hooks Provided

#### 1. **useTeamInvitations()** - Fetch Invitations
```typescript
const { data: invitations, isLoading, error } = useTeamInvitations();
```

**Features**:
- ✅ Fetches all invitations for current workspace
- ✅ Automatically enabled when workspace is selected
- ✅ Cached with React Query
- ✅ Auto-refetches on window focus
- ✅ Returns typed TeamInvitation array

**Query Key**: `['team-invitations', workspaceId]`

---

#### 2. **useSendInvitation()** - Send New Invitation
```typescript
const sendInvitation = useSendInvitation();

sendInvitation.mutate({
  email: 'john@example.com',
  full_name: 'John Doe',
  phone: '1234567890',
  country_code: '+1',
  role: 'member',
});
```

**Features**:
- ✅ Sends invitation with WhatsApp message
- ✅ Automatically adds workspace_id and invitedBy from context
- ✅ Invalidates invitations list on success
- ✅ Invalidates team members list (for pending count badges)
- ✅ Returns loading/error/success states

**Invalidates**: 
- `['team-invitations', workspaceId]`
- `['team-members', workspaceId]`

---

#### 3. **useResendInvitation()** - Resend Invitation
```typescript
const resendInvitation = useResendInvitation();

resendInvitation.mutate(invitationId);
```

**Features**:
- ✅ Resends WhatsApp message with same magic link
- ✅ Extends expiry if invitation expired
- ✅ Invalidates invitations list to show updated timestamp
- ✅ Logs activity

**Invalidates**: `['team-invitations', workspaceId]`

---

#### 4. **useCancelInvitation()** - Cancel Invitation
```typescript
const cancelInvitation = useCancelInvitation();

cancelInvitation.mutate(invitationId);
```

**Features**:
- ✅ Marks invitation as cancelled
- ✅ Prevents acceptance even if user has link
- ✅ Invalidates invitations list
- ✅ Logs activity

**Invalidates**: `['team-invitations', workspaceId]`

---

#### 5. **useInvitationStats()** - Get Statistics
```typescript
const stats = useInvitationStats();

// Returns:
// {
//   total: 10,
//   pending: 3,
//   accepted: 5,
//   expired: 1,
//   cancelled: 1
// }
```

**Features**:
- ✅ Calculates invitation statistics
- ✅ Counts by status (pending/accepted/expired/cancelled)
- ✅ Reactive - updates when invitations change
- ✅ Perfect for dashboard cards

---

#### 6. **useHasPendingInvitation()** - Check Pending
```typescript
const hasPending = useHasPendingInvitation('john@example.com');

// Returns: true if email has pending invitation
```

**Features**:
- ✅ Checks if email already has pending invitation
- ✅ Useful for form validation
- ✅ Prevents duplicate invitations
- ✅ Returns boolean

---

#### 7. **usePendingInvitations()** - Filter Pending Only
```typescript
const pendingInvitations = usePendingInvitations();

// Returns: TeamInvitation[] filtered by status='pending'
```

**Features**:
- ✅ Filters invitations to pending only
- ✅ Useful for "Pending Invitations" section
- ✅ Reactive filtering
- ✅ No extra API calls (uses cached data)

---

#### 8. **useIsInvitationExpired()** - Check Expiry
```typescript
const isExpired = useIsInvitationExpired(invitation);

// Returns: true if invitation.expires_at < now
```

**Features**:
- ✅ Checks if invitation is expired
- ✅ Compares expires_at with current time
- ✅ Returns boolean
- ✅ Use for conditional rendering

---

#### 9. **useTimeUntilExpiry()** - Time Remaining
```typescript
const timeLeft = useTimeUntilExpiry(invitation);

// Returns: "3d 12h" or "5h" or "30m" or "Expired"
```

**Features**:
- ✅ Calculates time until expiry
- ✅ Formats as human-readable string
- ✅ Returns "Expired" if past expiry
- ✅ Updates reactively
- ✅ Perfect for countdown displays

**Format Examples**:
- `"6d 23h"` - 6 days, 23 hours remaining
- `"12h"` - 12 hours remaining
- `"45m"` - 45 minutes remaining
- `"Expired"` - Past expiry date

---

## Integration with Existing Architecture

### Uses Existing Context Providers
```typescript
import { useCurrentWorkspace } from '@/entities/workspace';
import { useSession } from '@/entities/session';
```

- ✅ `useCurrentWorkspace()` - Gets workspace_id
- ✅ `useSession()` - Gets user.id (for invitedBy)

### React Query Integration
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
```

**Benefits**:
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Automatic retries on failure
- ✅ Loading/error states built-in

### Query Key Pattern
```typescript
['team-invitations', workspaceId]
['team-members', workspaceId]
```

**Invalidation Strategy**:
- Send invitation → Invalidates invitations + team members
- Resend invitation → Invalidates invitations
- Cancel invitation → Invalidates invitations

---

## Usage Examples

### Example 1: List Invitations with Stats
```tsx
import { useTeamInvitations, useInvitationStats } from '@/entities/team';

function InvitationsPage() {
  const { data: invitations, isLoading } = useTeamInvitations();
  const stats = useInvitationStats();

  return (
    <div>
      <h1>Team Invitations</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardTitle>Total</CardTitle>
          <CardContent>{stats.total}</CardContent>
        </Card>
        <Card>
          <CardTitle>Pending</CardTitle>
          <CardContent>{stats.pending}</CardContent>
        </Card>
        <Card>
          <CardTitle>Accepted</CardTitle>
          <CardContent>{stats.accepted}</CardContent>
        </Card>
        <Card>
          <CardTitle>Expired</CardTitle>
          <CardContent>{stats.expired}</CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <InvitationsList invitations={invitations} />
      )}
    </div>
  );
}
```

### Example 2: Send Invitation Form
```tsx
import { useSendInvitation, useHasPendingInvitation } from '@/entities/team';

function InviteForm() {
  const sendInvitation = useSendInvitation();
  const [email, setEmail] = useState('');
  const hasPending = useHasPendingInvitation(email);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (hasPending) {
      toast.error('This email already has a pending invitation');
      return;
    }

    sendInvitation.mutate({
      email,
      full_name: 'John Doe',
      phone: '1234567890',
      country_code: '+1',
      role: 'member',
    }, {
      onSuccess: () => {
        toast.success('Invitation sent via WhatsApp!');
        setEmail('');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {hasPending && (
        <Alert variant="warning">
          This email already has a pending invitation
        </Alert>
      )}
      <Button
        type="submit"
        disabled={sendInvitation.isPending || hasPending}
      >
        {sendInvitation.isPending ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          'Send Invitation'
        )}
      </Button>
    </form>
  );
}
```

### Example 3: Invitation Row with Actions
```tsx
import {
  useResendInvitation,
  useCancelInvitation,
  useTimeUntilExpiry,
  useIsInvitationExpired,
} from '@/entities/team';

function InvitationRow({ invitation }: { invitation: TeamInvitation }) {
  const resend = useResendInvitation();
  const cancel = useCancelInvitation();
  const timeLeft = useTimeUntilExpiry(invitation);
  const isExpired = useIsInvitationExpired(invitation);

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium">{invitation.full_name}</p>
        <p className="text-sm text-muted-foreground">{invitation.email}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <Badge variant={isExpired ? 'destructive' : 'default'}>
          {invitation.status}
        </Badge>

        {/* Time Left */}
        <span className="text-sm text-muted-foreground">
          {timeLeft}
        </span>

        {/* Actions */}
        {invitation.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resend.mutate(invitation.id)}
              disabled={resend.isPending}
            >
              {resend.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Resend'
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancel.mutate(invitation.id)}
              disabled={cancel.isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Example 4: Pending Invitations Section
```tsx
import { usePendingInvitations } from '@/entities/team';

function PendingInvitationsSection() {
  const pendingInvitations = usePendingInvitations();

  if (pendingInvitations.length === 0) {
    return (
      <Alert>
        <AlertDescription>No pending invitations</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h2>Pending Invitations ({pendingInvitations.length})</h2>
      {pendingInvitations.map((invitation) => (
        <InvitationRow key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
}
```

---

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
// API Function Type
export interface SendInvitationParams {
  workspace_id: string;
  email: string;
  full_name: string;
  phone: string;
  country_code: string;
  role: Role;
  invitedBy: string;
}

// Hook Input Type (workspace_id and invitedBy injected)
type SendParams = Omit<SendInvitationParams, 'workspace_id' | 'invitedBy'>;

// Return Type
TeamInvitation // From database types
```

---

## Error Handling

All hooks provide error states from React Query:

```tsx
const { data, isLoading, error } = useTeamInvitations();

if (error) {
  return <Alert variant="destructive">{error.message}</Alert>;
}
```

Mutation hooks:
```tsx
const sendInvitation = useSendInvitation();

sendInvitation.mutate(params, {
  onError: (error) => {
    console.error('Failed to send invitation:', error);
    toast.error(error.message);
  },
});
```

---

## Performance Optimizations

### 1. **React Query Caching**
- Invitations cached by workspace
- Automatic background refetching
- Stale-while-revalidate pattern

### 2. **Selective Invalidation**
- Only invalidate related queries
- Prevents unnecessary refetches
- Optimizes network usage

### 3. **Computed Values**
- `useInvitationStats()` computes from cached data
- `usePendingInvitations()` filters cached data
- No extra API calls for derived data

### 4. **Conditional Fetching**
- `enabled: !!currentWorkspace?.id`
- Only fetches when workspace selected
- Prevents unnecessary requests

---

## Export Configuration

Updated **`src/entities/team/model/index.ts`**:
```typescript
export * from './useTeamMembers'
export * from './useAddTeamMember'
export * from './useRemoveTeamMember'
export * from './useUpdateMemberRole'
export * from './useTeamInvitations' // ← NEW
```

All hooks now available via:
```typescript
import {
  useTeamInvitations,
  useSendInvitation,
  useResendInvitation,
  useCancelInvitation,
  useInvitationStats,
  useHasPendingInvitation,
  usePendingInvitations,
  useIsInvitationExpired,
  useTimeUntilExpiry,
} from '@/entities/team';
```

---

## Testing Checklist

### ✅ Hook Functionality
- [ ] useTeamInvitations fetches invitations for workspace
- [ ] useSendInvitation creates invitation and sends WhatsApp
- [ ] useResendInvitation resends WhatsApp and extends expiry
- [ ] useCancelInvitation marks as cancelled
- [ ] useInvitationStats calculates correct counts
- [ ] useHasPendingInvitation returns true/false correctly
- [ ] usePendingInvitations filters to pending only
- [ ] useIsInvitationExpired checks expiry correctly
- [ ] useTimeUntilExpiry formats time correctly

### ✅ React Query Integration
- [ ] Queries cached with correct key
- [ ] Invalidation triggers refetch
- [ ] Loading states work correctly
- [ ] Error states displayed properly
- [ ] Mutations update cache

### ✅ Context Integration
- [ ] Workspace context provides workspace_id
- [ ] Session context provides user.id
- [ ] Hooks disabled when no workspace
- [ ] Hooks handle unauthenticated state

---

## Files Modified

| File | Status | Lines |
|------|--------|-------|
| `src/entities/team/model/useTeamInvitations.ts` | ✅ Created | 155 |
| `src/entities/team/model/index.ts` | ✅ Modified | +1 |

**Total**: 2 files, 156 lines of code

---

## Compilation Status

✅ **No errors** - All TypeScript types resolved correctly  
✅ **Exports working** - All hooks available via team entity  
✅ **Context integration** - Using correct providers

---

## Step 3 Summary

**Status**: ✅ COMPLETE  
**Deliverables**: 9 React hooks for comprehensive invitation management  
**Integration**: React Query, Workspace Context, Session Context  
**Next**: Step 4 - Update AddMemberDialog with invitation form

---

## Next Steps

With Step 3 complete, we now have all the hooks ready. Step 4 will:

1. ✅ Update AddMemberDialog component
2. ✅ Add tab switcher: "Invite New" vs "Add Existing"
3. ✅ Create invitation form with name, email, phone, country code, role
4. ✅ Use useSendInvitation() hook
5. ✅ Add WhatsApp configuration check
6. ✅ Show success message with "Invitation sent via WhatsApp"

Ready to proceed? 🚀
