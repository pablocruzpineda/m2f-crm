# M2F CRM Architecture

## Overview

M2F CRM follows **Feature-Sliced Design (FSD)** architecture with clean architecture principles, functional programming as the primary paradigm, and strict TypeScript type safety.

## Architecture Principles

### 1. Feature-Sliced Design (FSD)

The project is organized into horizontal layers and vertical slices:

```
src/
├── app/        # Application initialization & setup
├── pages/      # Route-level pages
├── widgets/    # Complex composite UI blocks
├── features/   # Business features & user interactions
├── entities/   # Business entities & domain models
└── shared/     # Reusable code & utilities
```

### 2. Dependency Rule

**Lower layers cannot import from upper layers:**

```
app → pages → widgets → features → entities → shared
```

- `shared` is the foundation (no dependencies on other layers)
- `entities` can only use `shared`
- `features` can use `entities` and `shared`
- `widgets` can use `features`, `entities`, and `shared`
- `pages` compose everything below them
- `app` orchestrates the entire application

### 3. Public API Pattern

Each module exports through `index.ts`:

```typescript
// features/contact-create/index.ts
export { CreateContactDialog } from './components/CreateContactDialog';
export { useCreateContact } from './hooks/useCreateContact';
export type { CreateContactInput } from './types';
```

**Usage:**
```typescript
import { CreateContactDialog, useCreateContact } from '@/features/contact-create';
```

## Layer Details

### App Layer (`/app`)

**Purpose:** Application initialization, global providers, routing

**Contains:**
- `providers/` - React context providers
- `router/` - Route configuration
- `main.tsx` - Application entry point

**Example:**
```typescript
// app/providers/AppProvider.tsx
export function AppProvider({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

### Pages Layer (`/pages`)

**Purpose:** Route-level components (thin, composition only)

**Contains:**
- `dashboard/` - Dashboard page
- `contacts/` - Contacts page
- `pipelines/` - Pipelines page
- `chat/` - Chat page
- `settings/` - Settings pages

**Example:**
```typescript
// pages/contacts/ContactsPage.tsx
export function ContactsPage() {
  return (
    <MainLayout>
      <ContactsHeader />
      <ContactsFilters />
      <ContactsList />
    </MainLayout>
  );
}
```

### Widgets Layer (`/widgets`)

**Purpose:** Complex UI blocks composed of multiple features

**Contains:**
- `ContactCard/` - Contact display card
- `PipelineBoard/` - Kanban board widget
- `ChatSidebar/` - Chat interface widget

**Example:**
```typescript
// widgets/PipelineBoard/PipelineBoard.tsx
import { Pipeline } from '@/entities/pipeline';
import { ContactMove } from '@/features/contact-move';
import { ContactCard } from '@/widgets/ContactCard';

export function PipelineBoard({ pipelineId }: Props) {
  // Composes multiple features into complex widget
}
```

### Features Layer (`/features`)

**Purpose:** Business logic and user interactions

**Naming:** Action-based (verb + noun)
- `contact-create/`
- `contact-edit/`
- `pipeline-manage/`
- `message-send/`

**Structure:**
```
features/contact-create/
├── api/                    # API calls
│   └── createContact.ts
├── components/             # Feature UI
│   └── CreateContactDialog.tsx
├── hooks/                  # Feature hooks
│   └── useCreateContact.ts
├── types.ts               # Feature types
└── index.ts               # Public API
```

**Example:**
```typescript
// features/contact-create/hooks/useCreateContact.ts
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    }
  });
};
```

### Entities Layer (`/entities`)

**Purpose:** Business entities and domain models

**Naming:** Noun-based (domain objects)
- `contact/`
- `pipeline/`
- `message/`
- `workspace/`

**Structure:**
```
entities/contact/
├── model/                  # Data models
│   ├── types.ts           # TypeScript types
│   ├── schema.ts          # Zod schemas
│   └── utils.ts           # Entity utilities
├── api/                    # CRUD operations
│   └── contactApi.ts
├── ui/                     # Entity display components
│   ├── ContactAvatar/
│   └── ContactBadge/
└── index.ts               # Public API
```

**Example:**
```typescript
// entities/contact/model/types.ts
export interface Contact {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
  createdAt: Date;
}

// entities/contact/api/contactApi.ts
export const getContacts = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId);
  
  if (error) throw error;
  return data;
};
```

### Shared Layer (`/shared`)

**Purpose:** Reusable code with no business logic

**Contains:**
- `ui/` - Shadcn UI components
- `lib/` - External libraries (Supabase, utils)
- `hooks/` - Generic React hooks
- `config/` - Configuration
- `types/` - Shared TypeScript types
- `api/` - Base API client

**Example:**
```typescript
// shared/lib/utils/cn.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// shared/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  // Generic debounce hook
}
```

## Programming Paradigms

### Functional Programming (90%)

**Default approach for:**
- React components
- Hooks
- Utilities
- API calls
- Data transformations

**Example:**
```typescript
// Functional approach
export const formatContactName = (contact: Contact): string => {
  return contact.name.trim() || contact.email;
};

export const filterActiveContacts = (contacts: Contact[]): Contact[] => {
  return contacts.filter(c => c.status === 'active');
};
```

### Object-Oriented Programming (10%)

**Use when:**
- Complex domain logic with invariants
- State machines
- Builder patterns

**Example:**
```typescript
// OOP for complex domain model
export class Pipeline {
  private constructor(
    public readonly id: string,
    private stages: PipelineStage[]
  ) {}

  addStage(stage: CreateStageInput): Pipeline {
    // Business logic with validation
    const newStages = [...this.stages, newStage];
    return new Pipeline(this.id, newStages);
  }

  validate(): ValidationResult {
    // Complex validation logic
  }
}
```

## Type Safety

### Strict TypeScript Configuration

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
}
```

### Runtime Validation with Zod

```typescript
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

## State Management

### Server State - React Query

```typescript
// For server data
const { data: contacts } = useQuery({
  queryKey: ['contacts', workspaceId],
  queryFn: () => getContacts(workspaceId)
});
```

### Client State - Zustand

```typescript
// For UI state
export const useContactStore = create<ContactStore>((set) => ({
  selectedContact: null,
  setSelectedContact: (contact) => set({ selectedContact: contact }),
}));
```

## Multi-Tenancy

### Row-Level Security (RLS)

All database tables use RLS policies:

```sql
CREATE POLICY "workspace_isolation"
  ON contacts
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Workspace Context

```typescript
export const useWorkspace = () => {
  const { data: workspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: fetchCurrentWorkspace
  });
  
  return workspace;
};
```

## Code Organization Best Practices

### 1. File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `types.ts` or `TypeName.ts`

### 2. Import Order
```typescript
// 1. External libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports
import { Button } from '@/shared/ui/button';
import { Contact } from '@/entities/contact';
import { useCreateContact } from '@/features/contact-create';

// 3. Relative imports
import { ContactForm } from './ContactForm';
import type { Props } from './types';
```

### 3. Component Structure
```typescript
// 1. Imports
import type { ComponentProps } from './types';

// 2. Types/Interfaces
interface Props extends ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop1, prop2 }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Testing Strategy

### Unit Tests
- Pure functions
- Utilities
- Hooks (with React Testing Library)

### Integration Tests
- Features (user interactions)
- API calls (with MSW)

### E2E Tests
- Critical user flows
- Full application scenarios

## Next Steps

1. Read [Feature-Sliced Design documentation](https://feature-sliced.design/)
2. Review the [Contributing Guide](../CONTRIBUTING.md)
3. Start with Phase 1: Supabase Setup

---

**Questions?** Open a discussion or ask in Discord!
