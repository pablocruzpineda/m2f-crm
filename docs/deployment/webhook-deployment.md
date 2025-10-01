# Webhook Deployment Guide

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked**
   ```bash
   # If not already linked
   supabase link --project-ref your-project-ref
   ```

3. **Docker installed** (for local testing)

---

## Local Development & Testing

### 1. Start Supabase Locally

```bash
# From project root
supabase start
```

This will start:
- PostgreSQL database
- Supabase Studio (http://localhost:54323)
- Edge Functions runtime
- Realtime server

### 2. Serve Function Locally

```bash
# Serve the chat-webhook function
supabase functions serve chat-webhook --env-file supabase/.env.local
```

### 3. Test Locally

Get your local workspace ID:
```bash
# Open Supabase Studio
open http://localhost:54323

# Or query directly
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT id, name FROM workspaces LIMIT 5;"
```

Test the webhook:
```bash
curl -X POST \
  'http://localhost:54321/functions/v1/chat-webhook?workspace=YOUR_LOCAL_WORKSPACE_ID' \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "Test",
      "last_name": "User"
    },
    "message": {
      "content": "Hello from local testing!"
    }
  }'
```

### 4. View Local Logs

```bash
# In another terminal
supabase functions logs chat-webhook --local
```

---

## Production Deployment

### 1. Verify Environment Variables

The function uses these environment variables (automatically provided by Supabase):
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (full access)

These are automatically available in Supabase Edge Functions.

### 2. Deploy Function

```bash
# Deploy to production
supabase functions deploy chat-webhook

# If you have custom secrets (optional)
supabase secrets set MY_SECRET_KEY=value
```

Expected output:
```
Deploying Function chat-webhook...
Function deployed: chat-webhook
URL: https://your-project.supabase.co/functions/v1/chat-webhook
```

### 3. Verify Deployment

```bash
# Get function details
supabase functions list

# View production logs
supabase functions logs chat-webhook --tail
```

### 4. Test Production Webhook

Get your production workspace ID:
```bash
# Query your production database
psql YOUR_DATABASE_CONNECTION_STRING -c "SELECT id, name FROM workspaces LIMIT 5;"
```

Test the webhook:
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/chat-webhook?workspace=YOUR_WORKSPACE_ID' \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "Production",
      "last_name": "Test"
    },
    "message": {
      "content": "Hello from production!"
    }
  }'
```

---

## Integration with Mind2Flow

### 1. Enable Chat Integration

In your CRM:
1. Go to `/chat/settings`
2. Fill in Mind2Flow API credentials
3. Toggle "Enable Integration" ON
4. Toggle "Auto-create Contacts" ON (recommended)
5. Click "Save Settings"

### 2. Copy Webhook URL

The webhook URL is displayed in the settings page:
```
https://your-project.supabase.co/functions/v1/chat-webhook?workspace=YOUR_WORKSPACE_ID
```

### 3. Configure Mind2Flow

1. Log in to your Mind2Flow account
2. Go to Settings → Webhooks
3. Add new webhook:
   - **URL**: Paste the webhook URL from your CRM
   - **Events**: Select "New Message Received"
   - **Method**: POST
   - **Content-Type**: application/json

4. Configure payload mapping (if needed):
   ```json
   {
     "contact": {
       "phone": "{{contact.phone}}",
       "email": "{{contact.email}}",
       "first_name": "{{contact.firstName}}",
       "last_name": "{{contact.lastName}}"
     },
     "message": {
       "content": "{{message.text}}",
       "message_type": "{{message.type}}",
       "media_url": "{{message.mediaUrl}}"
     },
     "timestamp": "{{message.timestamp}}"
   }
   ```

5. Test the webhook from Mind2Flow
6. Check your CRM chat interface - message should appear!

---

## Troubleshooting

### Function Not Deploying

**Error**: "Function already exists"
```bash
# Delete and redeploy
supabase functions delete chat-webhook
supabase functions deploy chat-webhook
```

**Error**: "Not linked to a project"
```bash
# Link to your project
supabase link --project-ref your-project-ref
```

### Messages Not Appearing

1. **Check function logs**:
   ```bash
   supabase functions logs chat-webhook --tail
   ```

2. **Verify integration is active**:
   ```sql
   SELECT * FROM chat_settings WHERE workspace_id = 'YOUR_WORKSPACE_ID';
   ```
   - `is_active` should be `true`

3. **Test webhook directly**:
   Use the curl command above to bypass Mind2Flow

4. **Check database**:
   ```sql
   -- Check if message was created
   SELECT * FROM messages 
   WHERE workspace_id = 'YOUR_WORKSPACE_ID'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Contact Not Created

1. **Check auto_create_contacts setting**:
   ```sql
   SELECT auto_create_contacts FROM chat_settings 
   WHERE workspace_id = 'YOUR_WORKSPACE_ID';
   ```

2. **Verify contact data**:
   - Phone or email must be provided
   - Check if contact already exists

3. **Check function logs for errors**

### Webhook Returns 403

**Error**: "Chat integration is not active"

Solution:
1. Go to `/chat/settings`
2. Toggle "Enable Integration" ON
3. Click "Save Settings"

---

## Monitoring

### View Function Metrics

In Supabase Dashboard:
1. Go to Edge Functions
2. Click on `chat-webhook`
3. View:
   - Invocations count
   - Error rate
   - Average execution time
   - Logs

### Set Up Alerts (Optional)

1. Go to Project Settings → Alerts
2. Create alert for:
   - High error rate on chat-webhook
   - Slow execution time
   - Too many invocations (potential spam)

---

## Security Best Practices

### 1. Add Webhook Authentication (Recommended)

Update function to validate signature:
```typescript
// Add to webhook function
const signature = req.headers.get('x-webhook-signature')
const isValid = verifySignature(payload, signature, WEBHOOK_SECRET)

if (!isValid) {
  return new Response(
    JSON.stringify({ error: 'Invalid signature' }),
    { status: 401 }
  )
}
```

### 2. Rate Limiting

Add rate limiting to prevent abuse:
```typescript
// Check rate limit
const rateLimitKey = `webhook:${workspaceId}`
const requestCount = await redis.incr(rateLimitKey)

if (requestCount > 100) { // 100 requests per minute
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429 }
  )
}

await redis.expire(rateLimitKey, 60) // 1 minute TTL
```

### 3. IP Whitelisting

Configure Supabase Network Restrictions:
1. Go to Project Settings → Network Restrictions
2. Add Mind2Flow IP addresses to allowlist

---

## Performance Optimization

### Current Performance
- Cold start: 100-300ms
- Warm execution: 50-150ms
- Database queries: 2-3 per request

### Optimization Tips

1. **Keep function warm**:
   ```bash
   # Set up a cron job to ping every 5 minutes
   */5 * * * * curl -X OPTIONS https://your-project.supabase.co/functions/v1/chat-webhook
   ```

2. **Batch processing** (for high volume):
   ```typescript
   // Accept multiple messages
   interface WebhookPayload {
     messages: Array<{contact, message}>
   }
   ```

3. **Use database connection pooling**:
   Already handled by Supabase

---

## Updating the Function

### 1. Make Changes Locally

Edit `supabase/functions/chat-webhook/index.ts`

### 2. Test Locally

```bash
supabase functions serve chat-webhook
# Test with curl
```

### 3. Deploy Update

```bash
supabase functions deploy chat-webhook
```

### 4. Verify Update

```bash
# Check logs
supabase functions logs chat-webhook --tail

# Test production
curl -X POST 'https://your-project.supabase.co/functions/v1/chat-webhook?workspace=...' \
  -d '{"contact": {...}, "message": {...}}'
```

---

## Rollback

If something goes wrong:

1. **View previous versions**:
   ```bash
   supabase functions list-versions chat-webhook
   ```

2. **Rollback to previous version**:
   ```bash
   supabase functions rollback chat-webhook --version VERSION_NUMBER
   ```

3. **Or redeploy from git**:
   ```bash
   git checkout previous-commit
   supabase functions deploy chat-webhook
   git checkout main
   ```

---

## Next Steps

After successful deployment:

1. ✅ Test with Mind2Flow integration
2. ✅ Monitor function logs for first few days
3. ✅ Set up alerts for errors
4. ✅ Document any Mind2Flow-specific payload format
5. ✅ Add webhook signature verification (security)
6. ✅ Implement rate limiting if needed
