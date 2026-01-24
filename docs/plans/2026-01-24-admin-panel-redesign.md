# Admin Panel Redesign - Design Spec

## Overview

Complete rebuild of the admin panel to provide enterprise-grade contractor management capabilities.

## Core Requirements

### User Roles & Permissions
- **Admin**: Full control over all contractors and settings
- **Contractor**: Can toggle features unless admin-locked (shows "Locked - contact admin")

### Onboarding Flow
- Admin creates contractor account (with or without requiring payment)
- Admin searches and provisions phone number via TextGrid API (webhooks auto-configured)
- Manual step: Add number to TextGrid campaign (show reminder/checklist)

## Admin Panel Structure

### 1. Admin Dashboard (`/admin`)
- Platform stats: Total contractors, Active, Trialing, Churned
- MRR and revenue metrics
- Recent signups
- Needs attention (past due, issues)
- Quick actions

### 2. Contractors List (`/admin/contractors`)
- Full list with search and filters
- Status filter tabs: All | Active | Trialing | Past Due | Canceled
- Columns: Business, Email, Phone, Status, Joined, Actions
- Bulk actions (future)

### 3. Contractor Detail (`/admin/contractors/[id]`)

#### Layout: Tabbed with Command Header

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Contractors                                          │
│                                                                 │
│  [Avatar] Business Name                      [Status Badge]     │
│  email@example.com │ (504) 555-1234         [Actions ▼]        │
├─────────────────────────────────────────────────────────────────┤
│  Overview │ Settings │ Phone & SMS │ Billing │ Activity        │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab: Overview
- Account health summary
- Key metrics (messages, reviews, response rate)
- Recent activity feed
- Quick stats cards

#### Tab: Settings
**Business Info Section:**
- Business name (editable)
- Email (read-only, shows auth email)
- Timezone dropdown
- Business hours

**Feature Toggles Section:**
Each feature shows:
- Toggle switch
- Lock/Unlock button (admin only)
- Description

Features:
- Missed Call Auto-Text (basic)
- Review Automation (basic)
- Review Drip Reminders (basic)
- AI Responses (premium - locked by default)
- Campaigns (premium - locked by default)

**Templates Section:**
- View/edit all message templates
- Reset to defaults button

#### Tab: Phone & SMS
**Phone Number Section:**
- Current number display (or "Not assigned")
- If no number: Search & provision UI
  - Area code search
  - Available numbers list
  - "Purchase" button
- If has number:
  - Forwarding number config
  - Release number button (with confirmation)

**Conversations Section:**
- List of recent conversations
- Click to view full thread (read-only for admin)
- Link to impersonate for full inbox access

#### Tab: Billing
- Subscription status badge
- Plan info ($297/month)
- Stripe customer link (opens Stripe dashboard)
- Trial end date (if trialing)
- Actions:
  - Extend trial
  - Cancel subscription
  - Change status manually (for edge cases)

#### Tab: Activity
- Full audit log
- Filterable by type: All | Messages | Calls | Reviews | System
- Timestamp, event type, details
- Export button (future)

### Command Header Actions Dropdown
- **Impersonate** - Login as this contractor (opens new tab)
- **Send Password Reset** - Triggers Supabase password reset email
- **Suspend Account** - Disables login, shows "suspended" message
- **Delete Account** - With confirmation, removes all data

## New API Endpoints Needed

### Admin APIs (`/api/admin/...`)
- `GET /api/admin/contractors` - List all (bypass RLS)
- `GET /api/admin/contractors/[id]` - Full contractor details
- `PUT /api/admin/contractors/[id]` - Update contractor
- `POST /api/admin/contractors/[id]/provision-phone` - Search & buy number
- `DELETE /api/admin/contractors/[id]/phone` - Release number
- `POST /api/admin/contractors/[id]/extend-trial` - Extend trial period
- `POST /api/admin/contractors/[id]/impersonate` - Get impersonation token
- `POST /api/admin/contractors/[id]/suspend` - Suspend account
- `DELETE /api/admin/contractors/[id]` - Delete contractor

### Create Contractor API
- `POST /api/admin/contractors` - Create new contractor account
  - Body: { email, password, businessName, skipPayment: boolean }

## Database Changes

### Contractors Table Additions
```sql
-- Add admin control fields
ALTER TABLE contractors ADD COLUMN suspended_at TIMESTAMPTZ;
ALTER TABLE contractors ADD COLUMN suspended_reason TEXT;

-- Feature lock flags (admin controls access)
ALTER TABLE contractors ADD COLUMN feature_ai_responses_locked BOOLEAN DEFAULT true;
ALTER TABLE contractors ADD COLUMN feature_campaigns_locked BOOLEAN DEFAULT true;
```

## UI Components Needed

1. **AdminContractorHeader** - Top section with avatar, name, status, actions
2. **AdminContractorTabs** - Tab navigation
3. **FeatureToggleRow** - Toggle with lock button and description
4. **PhoneProvisionPanel** - Search, select, purchase flow
5. **ActivityFeed** - Filterable event list
6. **StatusBadge** - Colored status indicator
7. **ActionDropdown** - Dropdown menu for header actions

## Design System Notes

- Use existing Tailwind classes from globals.css
- Industrial-utilitarian aesthetic (slate + amber accent)
- Mobile-responsive (tabs become dropdown on mobile)
- Loading states for all async actions
- Confirmation modals for destructive actions

## Implementation Order

1. Fix RLS issue (show all contractors)
2. Build contractor detail page with tabs
3. Implement Overview tab
4. Implement Settings tab with feature toggles
5. Implement Phone & SMS tab with provisioning
6. Implement Billing tab
7. Implement Activity tab
8. Add header actions (impersonate, suspend, delete)
9. Build create contractor flow
10. Polish and test
