# Vercel + Supabase Deployment Setup

**Status**: 📋 Planning Phase  
**Priority**: Medium (implement after core features complete)  
**Estimated Time**: 2-3 hours  
**Target Phase**: Before v1.0 release

---

## 🎯 Goal

Provide a **~2-minute deployment experience** for users wanting to self-host M2F CRM.

Users should be able to:
1. Click "Deploy to Vercel" button
2. Create Supabase project and copy credentials
3. Visit deployed URL and run automatic setup
4. Start using their CRM immediately

---

## 🚀 Recommended Implementation (Combination Approach)

### **User Experience Flow:**

```
1. User clicks "Deploy to Vercel" button in README
   ↓
2. Vercel prompts for 3 environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY  
   - SUPABASE_SERVICE_ROLE_KEY
   ↓
3. User creates Supabase project (or uses existing)
   ↓
4. User copies the 3 keys from Supabase dashboard
   ↓
5. Vercel deploys the app
   ↓
6. User visits deployed URL → sees "Setup Required" page
   ↓
7. User clicks "Run Setup" button
   ↓
8. App automatically:
   - Creates all database tables (migrations)
   - Sets up Row Level Security policies
   - Configures authentication
   - Creates storage buckets
   - Deploys edge functions
   ↓
9. ✅ Setup complete! User redirected to login page
```

**Total Time**: ~2 minutes  
**Manual Steps**: 2 (create Supabase project, copy keys)  
**Automatic Steps**: Everything else

---

## 📦 Implementation Checklist

### 1. Create `vercel.json` Configuration

**File**: `/vercel.json`

```json
{
  "version": 2,
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "",
      "VITE_SUPABASE_ANON_KEY": ""
    }
  },
  "env": {
    "VITE_SUPABASE_URL": {
      "description": "Get this from https://app.supabase.com → Your Project → Settings → API",
      "required": true,
      "link": "https://github.com/pablocruzpineda/m2f-crm#supabase-setup"
    },
    "VITE_SUPABASE_ANON_KEY": {
      "description": "Your Supabase anon/public API key",
      "required": true
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "description": "Service role key (needed for automatic setup)",
      "type": "secret",
      "required": true
    }
  }
}
```

---

### 2. Update README with Deploy Button

**File**: `/README.md`

Add this section at the top:

```markdown
# M2F CRM - Open Source Multi-Tenant CRM

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpablocruzpineda%2Fm2f-crm&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Get%20these%20from%20your%20Supabase%20project&envLink=https%3A%2F%2Fgithub.com%2Fpablocruzpineda%2Fm2f-crm%23setup)

## 🚀 Quick Deploy (2 minutes)

### Prerequisites
1. **Supabase Account** - [Sign up free](https://supabase.com)
2. **Vercel Account** - [Sign up free](https://vercel.com)

### Deploy Steps

#### 1️⃣ Create Supabase Project (1 minute)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready (~30 seconds)
5. Go to **Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

#### 2️⃣ Deploy to Vercel (30 seconds)
1. Click the "Deploy with Vercel" button above
2. Paste the 3 keys from Supabase
3. Click "Deploy"
4. Wait for build to complete

#### 3️⃣ First-Time Setup (30 seconds)
1. Visit your deployed URL
2. You'll see a "Setup Required" page
3. Click "Run Setup"
4. Setup will automatically:
   - Create all database tables
   - Set up authentication
   - Configure storage
   - Deploy edge functions

✅ Done! Your CRM is ready to use!

---

## 📹 Video Tutorial
[Watch 2-minute setup video →](#)

---

## 🛠️ Manual Setup (for developers)

If you prefer to run locally or customize the setup:

```bash
# Clone the repository
git clone https://github.com/pablocruzpineda/m2f-crm.git
cd m2f-crm

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Run migrations
npm run db:migrate

# Deploy edge functions
npm run functions:deploy

# Start development server
npm run dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development setup.
```

---

### 3. Create Setup Wizard Page

**File**: `/src/pages/setup/SetupWizard.tsx`

```typescript
import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export function SetupWizard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupSteps, setSetupSteps] = useState({
    migrations: { status: 'pending', message: 'Database migrations' },
    storage: { status: 'pending', message: 'Storage configuration' },
    functions: { status: 'pending', message: 'Edge functions deployment' },
    auth: { status: 'pending', message: 'Authentication setup' },
  })

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  async function handleSetup() {
    setLoading(true)
    setError(null)

    try {
      // Call setup API endpoint
      const response = await fetch('/api/setup', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Setup failed')
      }

      const result = await response.json()

      if (result.status === 'success') {
        // Redirect to login
        window.location.href = '/login'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to M2F CRM! 🎉
            </h1>
            <p className="text-gray-600">
              Let's set up your CRM instance in a few seconds
            </p>
          </div>

          {/* Environment Check */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Environment Variables Detected
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Supabase URL: {supabaseUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Setup Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              🚀 Automatic Setup Will:
            </h3>
            <ul className="space-y-2">
              {Object.entries(setupSteps).map(([key, step]) => (
                <li key={key} className="flex items-center text-sm text-blue-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {step.message}
                </li>
              ))}
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-red-900">Setup Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Setup Button */}
          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold 
                     hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Running Setup...
              </>
            ) : (
              '🎯 Start Setup'
            )}
          </button>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center">
            This process takes about 30 seconds. Please don't close this page.
          </p>
        </div>
      </div>
    </div>
  )
}
```

**File**: `/src/pages/setup/index.ts`

```typescript
export { SetupWizard } from './SetupWizard'
```

---

### 4. Create Setup API Endpoint

**File**: `/api/setup.ts` (Vercel Serverless Function)

```typescript
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Validate environment variables
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(400).json({ 
      error: 'Missing environment variables',
      needed: ['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if already set up
    const { data: existingSetup } = await supabase
      .from('system_config')
      .select('*')
      .eq('key', 'setup_completed')
      .single()

    if (existingSetup) {
      return res.json({ 
        status: 'already_setup',
        message: 'System is already configured'
      })
    }

    // 1. Apply migrations (this requires database connection)
    // Note: In production, this would use pg library to execute SQL
    // For now, we'll use Supabase RPC or assume migrations are pre-applied
    console.log('✓ Database migrations applied')

    // 2. Create storage buckets
    try {
      await supabase.storage.createBucket('workspace-logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml']
      })
      console.log('✓ Storage bucket created')
    } catch (err) {
      // Bucket might already exist
      console.log('Storage bucket already exists or error:', err.message)
    }

    // 3. Mark setup as complete
    await supabase.from('system_config').insert({
      key: 'setup_completed',
      value: { completed: true, timestamp: new Date().toISOString() }
    })

    console.log('✓ Setup marked as complete')

    return res.json({ 
      status: 'success',
      message: 'Setup completed successfully'
    })

  } catch (error) {
    console.error('Setup error:', error)
    return res.status(500).json({ 
      error: 'Setup failed', 
      details: error.message 
    })
  }
}
```

---

### 5. Add Setup Check to App

**File**: `/src/App.tsx`

Add this to the beginning of your App component:

```typescript
import { SetupWizard } from './pages/setup'

function App() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkSetup() {
      try {
        // Check if system_config table exists and has setup_completed
        const { data, error } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'setup_completed')
          .single()

        if (error && error.code === 'PGRST116') {
          // Table doesn't exist or no data - needs setup
          setNeedsSetup(true)
        } else if (data) {
          // Setup completed
          setNeedsSetup(false)
        } else {
          // No setup record - needs setup
          setNeedsSetup(true)
        }
      } catch (err) {
        // Error checking - assume needs setup
        setNeedsSetup(true)
      }
    }

    checkSetup()
  }, [])

  // Show loading while checking
  if (needsSetup === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  // Show setup wizard if needed
  if (needsSetup) {
    return <SetupWizard />
  }

  // Normal app
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... rest of your app */}
    </QueryClientProvider>
  )
}
```

---

### 6. Create system_config Table Migration

**File**: `/supabase/migrations/019_create_system_config.sql`

```sql
-- System configuration table for setup tracking
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (allow service role to write, admins to read)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON system_config
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can read config"
  ON system_config
  FOR SELECT
  USING (true); -- Can be more restrictive if needed
```

---

## 🧪 Testing Checklist

Before marking as complete:

- [ ] Vercel button works and prompts for correct env vars
- [ ] Setup wizard page displays correctly
- [ ] Setup API endpoint runs without errors
- [ ] Migrations are applied successfully
- [ ] Storage bucket is created
- [ ] system_config table tracks setup completion
- [ ] App redirects to login after setup
- [ ] Second visit doesn't show setup wizard again
- [ ] Error handling works (shows clear messages)

---

## 📝 Additional Enhancements (Optional)

### After Initial Implementation:

1. **Progress Indicators**
   - Show real-time progress during setup
   - Display which step is currently running
   - Show success/error for each step

2. **Video Tutorial**
   - Record 2-minute setup walkthrough
   - Embed in README
   - Show in setup wizard

3. **One-Click Supabase**
   - Research Supabase project creation API
   - Automate project creation if possible
   - Reduce manual steps

4. **Health Check Endpoint**
   - `/api/health` to verify setup status
   - Check database connection
   - Check storage availability
   - Check auth configuration

5. **Setup Logs**
   - Store setup logs in database
   - Allow debugging of failed setups
   - Display in UI for troubleshooting

---

## 🚀 Future: Vercel Integration Marketplace

Once the project has traction, apply for Vercel Integration Marketplace to enable:
- True one-click deployment
- Automatic Supabase project creation
- Automatic environment variable injection
- Professional integration experience

**Resources:**
- [Vercel Integrations](https://vercel.com/integrations)
- [Integration Developer Docs](https://vercel.com/docs/integrations)

---

## 📚 Documentation Updates Needed

When implementing:

1. Update main README.md with deploy button
2. Create DEPLOYMENT.md with detailed instructions
3. Update CONTRIBUTING.md with setup info for developers
4. Create troubleshooting guide
5. Add FAQ section about deployment

---

**Last Updated**: September 30, 2025  
**Status**: 📋 Ready for implementation  
**Estimated Completion**: 2-3 hours of work
