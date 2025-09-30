# Contact Management - Quick Reference Guide

**Version**: 1.0  
**Last Updated**: September 29, 2025  

---

## 🎯 Quick Access

| Feature | Route | Shortcut |
|---------|-------|----------|
| Contact List | `/contacts` | Click "Contacts" in sidebar |
| Create Contact | `/contacts/new` | Click "Add Contact" button |
| View Contact | `/contacts/:id` | Click any contact card |
| Edit Contact | `/contacts/:id/edit` | Click "Edit" in detail view |

---

## 📝 Creating a Contact

### Required Fields
- **First Name** (required)

### Optional Fields
**Basic Information**:
- Last Name
- Email
- Phone
- Company
- Job Title
- Status (Active, Inactive, Lead, Customer)
- Source (e.g., Website, Referral, Event)

**Address**:
- Address Line 1
- Address Line 2
- City
- State
- Postal Code
- Country

**Web & Social**:
- Website
- LinkedIn URL
- Twitter URL

**Additional**:
- Notes (free-form text)

### Validation Rules
- **Email**: Must be valid format (e.g., `user@example.com`)
- **URLs**: Must be valid URLs (e.g., `https://example.com`)
- **First Name**: Cannot be empty

---

## 🔍 Searching Contacts

### Search Bar
Type in the search bar to find contacts by:
- First Name
- Last Name
- Email
- Company

**Note**: Search is debounced (300ms delay) for better performance.

### Filters

**Status Filter**:
- All Contacts
- Active
- Inactive
- Lead
- Customer

**Sort Options**:
- Recently Added (newest first)
- Recently Updated (most recently edited)
- Name A-Z (alphabetical)

**Sort Order**:
- Ascending ↑
- Descending ↓

### Clear Filters
Click "Clear Filters" to reset all filters and search to defaults.

---

## 📊 Contact List

### Layout
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

### Card Information
Each contact card shows:
- Avatar (initials)
- Full Name
- Job Title
- Status Badge
- Email
- Phone
- Company
- Tags (first 3, then "+X more")

### Pagination
- **Items per page**: 20
- **Navigation**: 
  - Desktop: Page numbers + Prev/Next
  - Mobile: Prev/Next only
- **Stats**: "Showing X to Y of Z contacts"

---

## 👤 Contact Detail View

### Information Sections

**Contact Information**:
- Email (clickable `mailto:` link)
- Phone (clickable `tel:` link)
- Company

**Address**:
- Full formatted address (if available)

**Web & Social**:
- Website (opens in new tab)
- LinkedIn (opens in new tab)
- Twitter (opens in new tab)

**Notes**:
- Full notes displayed with line breaks

**Sidebar**:
- Status badge
- Source
- Created date
- Last updated date
- Tags (color-coded)

### Actions
- **Edit**: Opens edit form
- **Delete**: Shows confirmation modal
- **Back**: Returns to contact list

---

## ✏️ Editing a Contact

1. Click **Edit** button in detail view
2. Form appears pre-filled with current data
3. Modify any fields
4. Click **Save Contact** to update
5. Click **Cancel** to discard changes

**Note**: Same validation rules as creating a contact.

---

## 🗑️ Deleting a Contact

1. Click **Delete** button in detail view
2. Confirmation modal appears with contact name
3. Click **Delete** to confirm (or **Cancel** to abort)
4. Redirected to contact list after deletion

**⚠️ Warning**: Deletion is permanent and cannot be undone!

---

## 🏷️ Tags

### Viewing Tags
- Tags appear on contact cards (max 3 visible)
- Full tag list in contact detail sidebar
- Color-coded based on tag settings

### Managing Tags (API Ready)
The tag API is ready, but UI for creating/assigning tags is coming in a future update.

**Available via API**:
- Create tags
- Assign tags to contacts
- Remove tags from contacts
- Update tag colors

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus search | `/` (when on contacts page) |
| Navigate forms | `Tab` / `Shift+Tab` |
| Submit form | `Enter` (when in input) |
| Cancel/Close | `Esc` |

---

## 💡 Tips & Best Practices

### Data Entry
- **Use consistent naming**: First name + Last name format
- **Add tags early**: Makes filtering easier later
- **Include source**: Track where leads come from
- **Keep notes updated**: Document all interactions

### Organization
- **Regular cleanup**: Update statuses (Lead → Customer)
- **Use search**: Faster than scrolling
- **Set filters**: Focus on specific contact types
- **Sort by updated**: Find recently modified contacts

### Performance
- **Search is smart**: Searches across multiple fields
- **Pagination**: Only loads 20 at a time for speed
- **Real-time updates**: Changes appear immediately

---

## 🔧 Troubleshooting

### Contact not appearing in list
- **Check filters**: Make sure status filter includes the contact
- **Check search**: Clear search bar
- **Refresh page**: Force reload if needed

### Form validation errors
- **First name required**: Cannot be empty
- **Invalid email**: Must be `user@domain.com` format
- **Invalid URL**: Must start with `http://` or `https://`

### Cannot delete contact
- **Check permissions**: Must be workspace member
- **Try refreshing**: Session may have expired

---

## 📈 Understanding Contact Data

### Status Types

**Active**: Current customers or engaged contacts  
**Inactive**: Past customers or dormant contacts  
**Lead**: Potential customers being nurtured  
**Customer**: Paying customers or clients  

### Custom Fields (Coming Soon)
The database supports custom fields via JSONB, but the UI is not yet available. This will be added in a future update.

---

## 🔐 Security & Privacy

### Access Control
- **Workspace isolation**: Only see contacts in your workspace
- **Row Level Security**: Enforced at database level
- **Member permissions**: Controlled via workspace membership

### Data Protection
- **Encrypted**: All data encrypted at rest and in transit
- **Secure URLs**: HTTPS only
- **Auth required**: Must be logged in to access

---

## 📱 Mobile Experience

### Optimizations
- **Touch-friendly**: Large tap targets
- **Responsive**: Adapts to screen size
- **Fast**: Optimized queries and caching
- **Offline-ready**: Coming in future update

### Mobile Tips
- **Swipe**: Navigate pagination with gestures
- **Pull to refresh**: Coming soon
- **Voice input**: Use device keyboard features

---

## 🚀 What's Next?

### Upcoming Features
- **Tag management UI**: Create and assign tags visually
- **Bulk operations**: Select and update multiple contacts
- **Import/Export**: CSV import and export
- **Contact relationships**: Link to deals and tasks
- **Activity timeline**: Track all interactions
- **Avatar upload**: Custom profile pictures
- **Advanced search**: Complex filters and saved searches

---

## 📞 Need Help?

### Resources
- **Documentation**: See `docs/` folder
- **API Reference**: Contact entity layer in `src/entities/contact/`
- **Testing Guide**: `docs/PHASE_4_TESTING.md`

### Common Questions

**Q: How many contacts can I have?**  
A: No hard limit, but performance is optimized for thousands of contacts.

**Q: Can I import contacts from CSV?**  
A: Not yet, coming in Phase 15.

**Q: How do I add custom fields?**  
A: Custom fields UI coming in Phase 17. Database supports it now via API.

**Q: Can I export my contacts?**  
A: Not yet, coming in Phase 15.

---

**Last Updated**: September 29, 2025  
**Version**: 1.0 (Phase 4 Complete)
