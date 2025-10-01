# Chat Webhook Edge Function

## Overview

This Supabase Edge Function receives incoming messages from Mind2Flow (or other chat providers) and processes them by:
1. Validating the workspace and integration status
2. Finding or creating the contact
3. Storing the incoming message
4. Triggering real-time updates via Supabase Realtime

## Endpoint

```
POST {SUPABASE_URL}/functions/v1/chat-webhook?workspace={WORKSPACE_ID}
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Query Parameters
- `workspace` (required): The workspace ID to associate the message with

### Body
```json
{
  "contact": {
    "phone": "+1234567890",
    "email": "contact@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe"
  },
  "message": {
    "content": "Hello! This is a test message.",
    "message_type": "text",
    "media_url": null
  },
  "timestamp": "2025-09-30T10:30:00Z"
}
```

### Required Fields
- `contact.phone` OR `contact.email` (at least one)
- `message.content` (required)

### Optional Fields
- `contact.first_name` (falls back to `contact.name` or "Unknown")
- `contact.last_name`
- `message.message_type` (default: "text", options: "text", "image", "file", "audio")
- `message.media_url` (for non-text messages)
- `timestamp` (defaults to current time)

## Response Format

### Success (200)
```json
{
  "success": true,
  "message": "Message received and stored",
  "data": {
    "message_id": "uuid-here",
    "contact_id": "uuid-here"
  }
}
```

### Errors

#### 400 - Bad Request
```json
{
  "error": "Missing required fields: contact and message.content"
}
```

#### 403 - Forbidden
```json
{
  "error": "Chat integration is not active for this workspace"
}
```

#### 404 - Not Found
```json
{
  "error": "Contact not found and auto-create is disabled"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Error message here"
}
```

## Behavior

### Contact Handling
1. **Existing Contact**: If a contact with matching phone or email exists, use that contact
2. **New Contact + Auto-create Enabled**: Create new contact automatically
3. **New Contact + Auto-create Disabled**: Return 404 error

### Message Creation
- All incoming messages are created with `sender_type='contact'`
- Status is set to `'delivered'`
- Messages trigger real-time updates via Supabase Realtime
- Users viewing the chat will automatically see new messages and mark them as read

## Deployment

### Deploy to Supabase
```bash
# From project root
supabase functions deploy chat-webhook
```

### Set Environment Variables
The function automatically uses these Supabase environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (has full database access)

### Test Deployment
```bash
# Test with curl
curl -X POST \
  'https://your-project.supabase.co/functions/v1/chat-webhook?workspace=YOUR_WORKSPACE_ID' \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "Test",
      "last_name": "Contact"
    },
    "message": {
      "content": "Hello from webhook!"
    }
  }'
```

## Security

### Authentication
The webhook uses the workspace_id as a basic security mechanism. For production:
1. Consider adding API key validation
2. Validate request signature from Mind2Flow
3. Rate limiting
4. IP whitelisting

### Row Level Security (RLS)
The function uses the service role key which bypasses RLS. This is necessary to:
- Create contacts and messages on behalf of the system
- Query workspace settings

## Integration with Mind2Flow

### Configure Webhook URL
1. Go to your Mind2Flow account settings
2. Navigate to webhook configuration
3. Enter the webhook URL: `{SUPABASE_URL}/functions/v1/chat-webhook?workspace={WORKSPACE_ID}`
4. Configure the payload format to match the request format above
5. Save and test

### Testing Integration
1. Send a test message through Mind2Flow
2. Check your CRM chat interface - message should appear
3. Check Supabase logs: `supabase functions logs chat-webhook`

## Troubleshooting

### Messages Not Appearing
1. Check function logs: `supabase functions logs chat-webhook`
2. Verify workspace_id is correct
3. Ensure integration is active in chat settings
4. Check that contact exists or auto-create is enabled

### Contact Creation Failing
1. Verify workspace_id exists in workspaces table
2. Check if contact has phone or email
3. Ensure auto_create_contacts is enabled in chat_settings

### Permission Errors
1. Verify service role key is set correctly
2. Check RLS policies on messages and contacts tables
3. Ensure workspace_id is valid

## Local Development

### Run Locally
```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve chat-webhook

# Test locally
curl -X POST \
  'http://localhost:54321/functions/v1/chat-webhook?workspace=YOUR_WORKSPACE_ID' \
  -H 'Content-Type: application/json' \
  -d '{"contact": {"phone": "+1234567890"}, "message": {"content": "Test"}}'
```

### View Logs
```bash
# Local logs
supabase functions logs chat-webhook --local

# Production logs
supabase functions logs chat-webhook
```

## Performance

- **Cold Start**: ~100-300ms (first request after idle)
- **Warm**: ~50-150ms
- **Database Operations**: 2-3 queries (settings check, contact lookup/create, message insert)

## Future Enhancements

- [ ] Add webhook signature verification
- [ ] Implement rate limiting
- [ ] Add support for message attachments
- [ ] Queue processing for high volume
- [ ] Retry logic for failed operations
- [ ] Webhook delivery confirmation back to Mind2Flow
