# Chat Settings Page - User Guide

## 🎯 How to Access

1. Open the **Chat** page (`/chat`)
2. Look for the **⚙️ Settings icon** in the top-right of the Messages panel
3. Click the settings icon
4. You'll be taken to `/chat/settings`

---

## 📋 Settings Page Sections

### 1. Webhook URL
```
┌─────────────────────────────────────────────────┐
│ Webhook URL                                     │
│ Configure this URL in your Mind2Flow account    │
│ to receive incoming messages                    │
│                                                 │
│ ┌───────────────────────────────────┬─────┐   │
│ │ https://...chat-webhook?workspace=...  │ 📋 │   │
│ └───────────────────────────────────┴─────┘   │
└─────────────────────────────────────────────────┘
```

**Purpose**: Copy this URL and configure it in Mind2Flow to receive messages

**Actions**:
- 📋 Click to copy URL to clipboard
- ✅ Shows checkmark when copied

---

### 2. Mind2Flow API Configuration
```
┌─────────────────────────────────────────────────┐
│ Mind2Flow API Configuration                     │
│ Enter your Mind2Flow API credentials            │
│                                                 │
│ API Endpoint URL                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://api.mind2flow.com                   │ │
│ └─────────────────────────────────────────────┘ │
│ The base URL for Mind2Flow API                  │
│                                                 │
│ API Key                                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ ••••••••••••••••                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ API Secret                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ ••••••••••••••••                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [🧪 Test Connection]                            │
│                                                 │
│ ✅ Connection successful                         │
└─────────────────────────────────────────────────┘
```

**Fields**:
1. **API Endpoint URL**: The Mind2Flow API base URL
2. **API Key**: Your API key (shows as dots for security)
3. **API Secret**: Your API secret (shows as dots for security)

**Actions**:
- **Test Connection**: Validates your credentials
- Shows ✅ green message on success
- Shows ❌ red message on failure

---

### 3. General Settings
```
┌─────────────────────────────────────────────────┐
│ General Settings                                 │
│ Configure how the chat integration behaves       │
│                                                 │
│ Enable Integration                         [ ✓ ] │
│ Activate Mind2Flow chat integration             │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Auto-create Contacts                       [ ✓ ] │
│ Automatically create new contacts from           │
│ incoming messages                               │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ Browser Notifications                      [ ✓ ] │
│ Show desktop notifications for new messages     │
└─────────────────────────────────────────────────┘
```

**Toggles**:
1. **Enable Integration**: Master switch for Mind2Flow
2. **Auto-create Contacts**: Create contacts from unknown senders
3. **Browser Notifications**: Show desktop notifications

---

### 4. Save Button
```
┌─────────────────────────────────────────────────┐
│                          [💾 Save Settings]      │
└─────────────────────────────────────────────────┘

✅ Settings saved successfully
```

**Behavior**:
- **Disabled** (gray) when no changes detected
- **Enabled** (primary color) when changes detected
- Shows **"Saving..."** with spinner during save
- Shows success/error message after save

---

## 🔄 Workflow

### Initial Setup (First Time)

1. **Get Your Mind2Flow Credentials**
   - Sign up for Mind2Flow account
   - Get API endpoint, key, and secret from their dashboard

2. **Configure in CRM**
   - Go to Chat Settings (`/chat/settings`)
   - Copy webhook URL
   - Enter API credentials
   - Click "Test Connection" to verify
   - Enable "Enable Integration" toggle
   - Configure other settings as needed
   - Click "Save Settings"

3. **Configure in Mind2Flow**
   - Go to Mind2Flow dashboard
   - Find webhook configuration
   - Paste the copied webhook URL
   - Save in Mind2Flow

4. **Test**
   - Send a test message via Mind2Flow
   - Check if it appears in your CRM chat

---

### Updating Settings

1. Go to Chat Settings
2. Settings will auto-load (if they exist)
3. Make desired changes
4. "Save Settings" button will enable
5. Click "Save Settings"
6. Wait for confirmation
7. Changes are saved!

---

## 🎨 Visual States

### Loading State
```
┌─────────────────────────────────────────────────┐
│ ⏳ Loading...                                   │
│ [Spinner animation]                             │
└─────────────────────────────────────────────────┘
```

### Empty State (No Settings Yet)
```
┌─────────────────────────────────────────────────┐
│ Webhook URL                                     │
│ ┌───────────────────────────────────┬─────┐   │
│ │ https://...chat-webhook?workspace=...  │ 📋 │   │
│ └───────────────────────────────────┴─────┘   │
│                                                 │
│ API Configuration                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ (Empty - Enter your credentials)            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [💾 Save Settings] ← Enabled (first time)      │
└─────────────────────────────────────────────────┘
```

### Saved State (No Changes)
```
┌─────────────────────────────────────────────────┐
│ API Configuration                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://api.mind2flow.com                   │ │
│ │ ••••••••••••••••                            │ │
│ │ ••••••••••••••••                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [💾 Save Settings] ← Disabled (gray)           │
└─────────────────────────────────────────────────┘
```

### Unsaved Changes
```
┌─────────────────────────────────────────────────┐
│ API Configuration                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://api.mind2flow.com/v2  ← Changed!   │ │
│ │ ••••••••••••••••                            │ │
│ │ ••••••••••••••••                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [💾 Save Settings] ← Enabled (primary color)   │
└─────────────────────────────────────────────────┘
```

### Success Message
```
┌─────────────────────────────────────────────────┐
│ ✅ Settings saved successfully                   │
│ (Green background)                              │
└─────────────────────────────────────────────────┘
```

### Error Message
```
┌─────────────────────────────────────────────────┐
│ ❌ Failed to save settings. Please try again.   │
│ (Red background)                                │
└─────────────────────────────────────────────────┘
```

---

## 💡 Tips

1. **Test Connection First**: Before saving, test your API credentials to ensure they work
2. **Copy Webhook Early**: Copy the webhook URL before doing anything else - you'll need it for Mind2Flow
3. **Enable Integration Last**: Configure everything first, then enable the integration toggle
4. **Auto-create Contacts**: Leave this ON unless you want to manually create all contacts
5. **Notifications**: Enable for desktop notifications (you'll need to grant browser permission)

---

## 🔒 Security

- API Key and Secret are displayed as dots (password fields)
- Values are stored securely in the database
- Only users with access to the workspace can view/edit settings
- Webhook URL includes workspace ID for isolation

---

## ⚠️ Troubleshooting

### "Failed to save settings"
- Check your internet connection
- Verify you have permission to edit workspace settings
- Try refreshing the page and saving again

### "Connection test failed"
- Verify API endpoint URL is correct (no trailing slash)
- Check API Key and Secret are correct
- Ensure Mind2Flow API is accessible
- Contact Mind2Flow support if issue persists

### Webhook URL not working
- Verify the webhook is configured in Mind2Flow
- Check that workspace ID in URL matches your current workspace
- Ensure Edge Function is deployed (Step 9)
- Check Supabase logs for errors

---

## 📚 Related Documentation

- [Step 8 Summary](/docs/phase-5.2/step8-summary.md) - Technical implementation details
- [Step 9: Webhook Handler](/docs/phase-5.2/step9-summary.md) - Receiving messages (coming next)
- [Chat Settings API](/src/entities/chat-settings/api/chatSettingsApi.ts) - API documentation

---

**Status**: ✅ Complete and ready for use!
