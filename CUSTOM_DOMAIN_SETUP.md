# Custom Domain Setup Guide

This guide explains how to set up custom domains and subdomains for your multi-tenant CRM sub-accounts.

## Overview

Your CRM now supports three types of URL access:

1. **Master Workspace**: `yourcrm.com` or `app.yourcrm.com`
2. **Subdomain Access**: `client-slug.yourcrm.com` (automatic for each sub-account)
3. **Custom Domain**: `crm.clientdomain.com` (client's own domain)

## For Your Main Domain (Master Workspace)

### DNS Configuration

Your main domain needs to point to your hosting provider. Example for Vercel:

```
A     yourcrm.com          76.76.21.21
AAAA  yourcrm.com          2606:4700:10::6816:xxxx
```

### Wildcard Subdomain

To enable automatic subdomain routing for all sub-accounts:

```
CNAME  *.yourcrm.com       yourcrm.com
```

This allows any subdomain like `client-abc.yourcrm.com` to work automatically.

### SSL Certificate

Make sure to configure a **wildcard SSL certificate** for `*.yourcrm.com` to support all subdomains.

**Options:**
- **Cloudflare**: Automatic wildcard SSL (recommended)
- **Let's Encrypt**: Use certbot with wildcard option
- **AWS Certificate Manager (ACM)**: Request wildcard certificate
- **Vercel**: Configure wildcard domain in project settings

## For Client Custom Domains

When a client wants to use their own domain (e.g., `crm.clientdomain.com`):

### Step 1: Configure Custom Domain in CRM

1. Go to **Settings → Sub-Accounts**
2. Click **Create Sub-Account** (or edit existing)
3. Enter the custom domain in the **Custom Domain** field
4. Example: `crm.clientdomain.com`

### Step 2: Client DNS Configuration

The client needs to add a CNAME record in their DNS settings:

```
CNAME  crm.clientdomain.com    yourcrm.com
```

Or if using Cloudflare or similar:

```
CNAME  crm    yourcrm.com
```

### Step 3: SSL Certificate

**Option A: Let Vercel Handle It** (Recommended)
- Add the custom domain to your Vercel project
- Vercel will automatically provision SSL

**Option B: Use Cloudflare**
- Client uses Cloudflare for their domain
- Cloudflare automatically handles SSL
- Set DNS to "Proxied" (orange cloud)

**Option C: Manual SSL**
- You'll need to provision SSL for each custom domain
- Use Let's Encrypt or your hosting provider's SSL

### Step 4: Verification

1. Wait for DNS propagation (5-60 minutes)
2. Visit `https://crm.clientdomain.com`
3. Should automatically load the correct sub-account

## Environment Configuration

### Development

The system automatically detects `localhost` and skips hostname detection.

Access via:
- `http://localhost:5173` - Main development server
- Use workspace switcher to change workspaces

### Production

Set your base domain in `.env`:

```env
VITE_APP_URL=https://yourcrm.com
```

The system will automatically:
1. Extract base domain from URL
2. Detect subdomains: `client.yourcrm.com`
3. Match custom domains: `crm.client.com`
4. Fall back to workspace switcher if no match

## Testing

### Test Subdomain Routing (Local)

1. Edit `/etc/hosts`:
   ```
   127.0.0.1  test-client.localhost
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Access `http://test-client.localhost:5173`
4. Should auto-load workspace with slug `test-client`

### Test Custom Domain (Staging)

1. Create a test sub-account with custom domain: `test.yourdomain.com`
2. Add CNAME in your DNS: `test.yourdomain.com` → `your-staging-url.vercel.app`
3. Wait for DNS propagation
4. Visit `https://test.yourdomain.com`

## Troubleshooting

### Subdomain Not Working

**Check:**
1. Wildcard DNS: `*.yourcrm.com` CNAME to `yourcrm.com`
2. SSL certificate covers `*.yourcrm.com`
3. Slug matches exactly (case-sensitive)
4. Check browser console for errors

**Debug:**
Open browser console, look for:
```
[WorkspaceFromHostname] Extracted subdomain: client-abc
[WorkspaceFromHostname] Found workspace by slug: {...}
```

### Custom Domain Not Working

**Check:**
1. CNAME record: `crm.clientdomain.com` → `yourcrm.com`
2. DNS propagation: Use `dig crm.clientdomain.com` or `nslookup`
3. SSL certificate for custom domain
4. Custom domain matches exactly in database

**Debug:**
```bash
# Check DNS
dig crm.clientdomain.com

# Should show:
# crm.clientdomain.com. 300 IN CNAME yourcrm.com.
```

### Workspace Switcher Not Appearing

The workspace switcher is hidden when:
- URL matches a subdomain (auto-loads workspace)
- URL matches a custom domain (auto-loads workspace)

If you need to switch workspaces, go to the main domain:
- `https://yourcrm.com` or `https://app.yourcrm.com`

## Architecture Notes

### How It Works

1. **Hostname Detection** (`useWorkspaceFromHostname` hook)
   - Runs on app initialization
   - Reads `window.location.hostname`
   - Tries exact match on `custom_domain` column first
   - Falls back to subdomain extraction + slug match
   - Auto-loads matched workspace

2. **Fallback Behavior**
   - Main domain (`yourcrm.com`, `app.yourcrm.com`) → workspace switcher
   - Localhost → workspace switcher
   - No match → workspace switcher

3. **Database Structure**
   - `workspaces.custom_domain` - Stores client's custom domain
   - `workspaces.slug` - Used for subdomain routing
   - `workspaces.parent_workspace_id` - Links to master workspace

### Security

- RLS (Row Level Security) ensures data isolation
- Each sub-account admin only sees their workspace
- Master owner sees all workspaces
- Custom domains are validated on insert/update

## DNS Propagation Times

- **Cloudflare**: Usually instant to 5 minutes
- **Standard DNS**: 5-60 minutes (depends on TTL)
- **Maximum**: 24-48 hours (rare)

Check propagation status:
- https://www.whatsmydns.net/
- Enter your custom domain
- Should resolve to your main domain

## Support Checklist for Clients

When setting up a client's custom domain:

- [ ] Client provides custom domain (e.g., `crm.clientdomain.com`)
- [ ] Add custom domain to sub-account in CRM
- [ ] Send DNS instructions to client
- [ ] Client adds CNAME record
- [ ] Wait for DNS propagation (check with `dig`)
- [ ] Add custom domain to Vercel project (if using Vercel)
- [ ] Verify SSL certificate is issued
- [ ] Test access: `https://crm.clientdomain.com`
- [ ] Confirm client can log in and see their workspace

## Advanced: Multiple Environments

If you have staging/production:

**Staging**: `staging.yourcrm.com`
```env
VITE_APP_URL=https://staging.yourcrm.com
```
Subdomains: `client.staging.yourcrm.com`

**Production**: `yourcrm.com`
```env
VITE_APP_URL=https://yourcrm.com
```
Subdomains: `client.yourcrm.com`

Each environment needs its own wildcard DNS and SSL.

## Summary

**For Agency (Master Owner):**
- Set up wildcard DNS and SSL for your main domain
- Create sub-accounts with custom domains as needed
- Provide DNS instructions to clients

**For Clients:**
- Receive custom domain instructions from agency
- Add CNAME record in DNS settings
- Wait for propagation
- Access CRM via custom domain

**System Handles:**
- Automatic workspace detection from hostname
- Subdomain routing (slug-based)
- Custom domain routing (exact match)
- SSL (via hosting provider)
- Data isolation and security
