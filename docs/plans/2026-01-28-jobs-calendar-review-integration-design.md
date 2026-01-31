no# Jobs, Calendar & Review Integration System

## Overview

A system that enables automated Google review requests for all contractors, regardless of whether they use existing job management software.

**Two paths to the same outcome:**

| Contractor Type | How Reviews Get Triggered |
|----------------|---------------------------|
| Uses Jobber/HCP/etc | Zapier integration → your webhook |
| Uses nothing | Built-in Jobs feature → auto-trigger on complete |

Both paths result in: Job done → Review request sent automatically.

---

## Part 1: Zapier Integration (For Contractors With Existing Tools)

### Architecture

```
Contractor's Tool          Zapier              Your App
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Jobber     │      │              │     │   Webhook    │
│   HCP        │─────▶│  Your Zap    │────▶│   Endpoint   │
│   ServiceTitan│      │              │     │              │
│   QuickBooks │      │              │     │  /api/webhooks/trigger-review/[contractorId]
└──────────────┘      └──────────────┘     └──────────────┘
```

### How It Works

1. **You** own a single Zapier account ($50-100/month)
2. During onboarding Zoom, you create a Zap for each contractor
3. Contractor connects THEIR tool (Jobber, etc.) via OAuth in the Zap
4. Zap triggers on "Job Completed" (or similar event)
5. Zap sends POST to your existing webhook with customer data

### Supported Triggers by Tool

| Tool | Recommended Trigger | Alternative Triggers |
|------|--------------------|--------------------|
| Jobber | Job Completed | Invoice Created, Visit Completed |
| Housecall Pro | Job Completed | Invoice Sent |
| ServiceTitan | Job Completed | Invoice Finalized |
| QuickBooks | Invoice Paid | Payment Received |

### Webhook Payload (Already Built)

```json
POST /api/webhooks/trigger-review/[contractorId]
{
  "contact_phone": "+15551234567",
  "contact_name": "John Smith",
  "contact_email": "john@example.com",
  "job_type": "AC Repair",
  "tech_name": "Carlos",
  "source": "jobber"
}
```

### Onboarding Flow

1. Contractor books onboarding call
2. On Zoom, you share your screen
3. Open Zapier, create new Zap
4. Select their tool (Jobber, etc.) as trigger
5. Contractor clicks "Connect" and logs into their account
6. Configure trigger: "Job Completed"
7. Add action: Webhooks by Zapier → POST to their webhook URL
8. Map fields: customer name, phone from their tool
9. Test and activate
10. Done - takes 10-15 minutes

---

## Part 2: Built-in Jobs & Calendar (For Contractors Without Existing Tools)

### Feature Set

For contractors who don't use Jobber/HCP/etc, provide:

1. **Leads** - Capture incoming leads from website
2. **Jobs** - Schedule and track work
3. **Calendar** - Visual scheduling with drag-drop
4. **Customer Notifications** - Automated SMS for appointments
5. **Review Trigger** - Auto-send on job completion

### 2.1 Customer Leads

> **Note:** Table named `customer_leads` to distinguish from `leads_raw` (sales leads for contractor acquisition).

**Purpose:** Capture leads from chat widget, contact forms, or manual entry.

**Lead Fields:**
- Name (required)
- Phone (required)
- Email (optional)
- Service needed (optional)
- Source (chat, form, manual, referral)
- Notes
- Status: New → Contacted → Booked → Lost

**Actions:**
- Call (opens dialer)
- Text (opens conversation)
- Convert to Job (creates job, links contact)
- Mark Lost

**List View:**
- Filter by status
- Sort by date, name
- Search by name/phone
- Bulk actions (mark contacted, etc.)

### 2.2 Jobs

**Purpose:** Track scheduled work. When completed, triggers review request.

**Job Fields:**
- Contact (linked)
- Service type
- Scheduled date
- Time type:
  - Window (e.g., 2pm - 4pm)
  - Time of day (Morning 8-12, Afternoon 12-5, All day)
  - Exact time (e.g., 2:00 PM)
- Estimated duration (optional): 30min, 1hr, 2hr, 3hr, 4hr, half day, full day
- Status: Scheduled → En Route → In Progress → Completed / Cancelled
- Address (from contact or override)
- Notes
- Assigned tech (future - for multi-tech companies)

**Status Flow:**

```
┌───────────┐     ┌───────────┐     ┌─────────────┐     ┌───────────┐
│ Scheduled │────▶│ En Route  │────▶│ In Progress │────▶│ Completed │
└───────────┘     └───────────┘     └─────────────┘     └───────────┘
                        │                                      │
                        │            ┌───────────┐             │
                        └───────────▶│ Cancelled │◀────────────┘
                                     └───────────┘
```

**On Status Change:**
- En Route → SMS to customer: "Your technician is on the way"
- Completed → Trigger review request (after configurable delay, default 2 hours)
- Cancelled → SMS to customer (optional): "Your appointment has been cancelled"

### 2.3 Calendar View

**Views:**
- Week view (default)
- Day view
- Month view (overview only, not for scheduling)

**Interactions:**
- Click empty slot → Quick-add job modal
- Click job block → Job detail popover
- Drag job → Reschedule (updates date/time)
- Drag job edge → Adjust time window

**Job Block Display:**
```
┌─────────────────┐
│ 2-4pm           │
│ John Smith      │
│ AC Repair       │
│ ● Scheduled     │
└─────────────────┘
```

Status indicated by color:
- Scheduled: Neutral (slate)
- En Route: Blue
- In Progress: Amber
- Completed: Green
- Cancelled: Red (or hidden)

**Mobile Calendar:**
- Day view default (week too cramped)
- Swipe between days
- Pull down to refresh
- FAB for quick-add

### 2.4 Customer Notifications

**Automated SMS Messages:**

| Trigger | Message | Configurable |
|---------|---------|--------------|
| Job Scheduled | "Your [service] with [business] is confirmed for [date] between [time window]." | Yes |
| Day Before | "Reminder: [business] is coming tomorrow between [time window] for your [service]." | Yes, can disable |
| En Route | "Your technician from [business] is on the way!" | Yes |
| Rescheduled | "Your appointment with [business] has been rescheduled to [new date/time]." | Yes |
| Cancelled | "Your appointment with [business] has been cancelled." | Optional |

**Template Variables:**
- {{contact_name}} - Customer first name
- {{business_name}} - Contractor business name
- {{service_type}} - Job service type
- {{date}} - Scheduled date (formatted)
- {{time_window}} - e.g., "between 2-4pm"
- {{tech_name}} - Technician name (if assigned)

### 2.5 Review Trigger

When job marked "Completed":
1. Wait configurable delay (default: 2 hours)
2. Check contact not opted out
3. Check no pending review request for this contact
4. Check 90-day cooldown
5. Send review request SMS
6. Create review_request record linked to job

---

## Part 3: Settings & Configuration

### Integration Settings

```
Job Management
─────────────────────────────────────────
How do you manage your jobs?

○ Jobber
○ Housecall Pro
○ ServiceTitan
○ QuickBooks
○ Other (Zapier webhook)
○ I'll use the built-in scheduler

[ ] Integration connected ✓
    Webhook URL: https://app.example.com/api/webhooks/trigger-review/abc123
    Last received: Jan 28, 2026 at 3:42 PM
```

### Feature Visibility Based on Setting

| Setting | Leads | Jobs | Calendar | Inbox | Reviews |
|---------|-------|------|----------|-------|---------|
| External tool (Jobber, etc.) | Hidden | Hidden | Hidden | Show | Show |
| Built-in scheduler | Show | Show | Show | Show | Show |

### Notification Settings

```
Customer Notifications
─────────────────────────────────────────
☑ Send confirmation when job scheduled
☑ Send reminder day before appointment
☑ Send "on the way" when marked en route
☐ Send cancellation notice

Review Request Timing
─────────────────────────────────────────
Send review request: [ 2 hours ▼ ] after job completed
```

---

## Part 4: Data Model

### New Tables

```sql
-- Customer leads table (distinct from leads_raw which is for sales leads)
CREATE TABLE customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,

  -- Contact info
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Lead details
  service_type TEXT,
  source TEXT, -- 'chat', 'form', 'manual', 'referral'
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'booked', 'lost'

  -- Conversion tracking
  converted_to_contact_id UUID REFERENCES contacts(id),
  converted_to_job_id UUID REFERENCES jobs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  customer_lead_id UUID REFERENCES customer_leads(id), -- if converted from lead

  -- Job details
  service_type TEXT,
  notes TEXT,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  time_type TEXT DEFAULT 'window', -- 'window', 'timeofday', 'exact'
  window_start TIME, -- for 'window' or 'exact'
  window_end TIME,   -- for 'window'
  time_of_day TEXT,  -- for 'timeofday': 'morning', 'afternoon', 'allday'
  estimated_duration TEXT, -- '30min', '1hr', '2hr', '3hr', '4hr', 'half_day', 'full_day'

  -- Address (optional override from contact)
  address_override TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'en_route', 'in_progress', 'completed', 'cancelled'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  en_route_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Review tracking
  review_request_id UUID REFERENCES review_requests(id),
  review_requested_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_customer_leads_contractor_status ON customer_leads(contractor_id, status);
CREATE INDEX idx_jobs_contractor_date ON jobs(contractor_id, scheduled_date);
CREATE INDEX idx_jobs_contractor_status ON jobs(contractor_id, status);
```

### Contractors Table Additions

```sql
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS job_management_type TEXT DEFAULT 'builtin';
-- Values: 'jobber', 'housecallpro', 'servicetitan', 'quickbooks', 'other_zapier', 'builtin'

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS job_settings JSONB DEFAULT '{
  "notifications": {
    "send_confirmation": true,
    "send_day_before_reminder": true,
    "send_en_route": true,
    "send_cancellation": false
  },
  "review_delay_hours": 2
}';
```

---

## Part 5: UI Views Required

### New Pages

| Route | Purpose |
|-------|---------|
| /leads | Customer leads list with filters |
| /jobs | Jobs list view |
| /calendar | Calendar view (week/day/month) |

### New Components

| Component | Purpose |
|-----------|---------|
| LeadsList | Filterable, searchable lead list |
| LeadDetail | Lead detail panel/modal |
| LeadQuickAdd | Quick-add lead form |
| JobsList | Jobs list with status filters |
| JobDetail | Job detail panel with status actions |
| JobQuickAdd | Quick-add job from calendar |
| CalendarView | Main calendar with week/day toggle |
| CalendarJobBlock | Job block on calendar |
| CalendarJobPopover | Quick actions on job click |
| JobStatusButton | Mobile-friendly status change button |

### Settings Additions

| Route | Addition |
|-------|----------|
| /settings | Job management type selector |
| /settings | Customer notification toggles |
| /settings | Review timing setting |
| /settings/templates | Job notification templates |

---

## Part 6: Implementation Phases

### Phase 1: Core Jobs & Calendar
- Jobs table and API routes
- Job CRUD operations
- Basic calendar view (week/day)
- Job status transitions
- Review trigger on completion

### Phase 2: Customer Notifications
- Job confirmation SMS
- Day-before reminder (cron job)
- En route notification
- Template customization

### Phase 3: Leads
- Leads table and API routes
- Leads list UI
- Lead → Job conversion
- Lead sources tracking

### Phase 4: Calendar Polish
- Drag-drop rescheduling
- Mobile optimization
- Month overview
- Quick-add from calendar

### Phase 5: Integration Setup
- Settings UI for job management type
- Feature visibility toggling
- Zapier connection status display
- Webhook testing tools

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Jobs created per active contractor | 10+ per week |
| Review requests sent (from jobs) | 80%+ of completed jobs |
| No-show reduction | 30% fewer (via reminders) |
| Time to schedule job (mobile) | Under 30 seconds |

---

## Design Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Multi-technician support | Later | Most early users are solo operators |
| Job duration | Yes, optional field | Improves calendar display without adding complexity |
| Recurring jobs | No (for now) | Scope creep, not core to review automation |
| Customer self-scheduling | Later, as upsell | Significant complexity, separate product area |

## Future Considerations

- Multi-tech assignment when demand emerges
- Recurring jobs for maintenance contracts
- Customer booking portal as premium add-on
