# Jobber Integration via Make.com

Integration provider: **StartIntegrate** (official Make partner)

## Review Request Trigger Options

When should we send a review request? Here are your options:

| Trigger | When It Fires | Best For | Considerations |
|---------|---------------|----------|----------------|
| **Job Completed** | Job status changes to "completed" | Most contractors | Standard approach, fires once per job |
| **Visit Completed** | Individual visit marked complete | Multi-visit jobs | May fire multiple times per job |
| **Invoice Created** | Invoice is generated | Payment-focused | Customer already received service |
| **Invoice Paid** | Payment received | Premium timing | Delay between service and review ask |

### Recommended: Job Completed

For most contractors, trigger on **job completion**:
- Fires at the natural "we're done" moment
- Customer experience is fresh
- One request per job (not per visit)

### Alternative: Invoice Paid

For contractors who want to wait until paid:
- Ensures no awkward "please review us" before payment disputes
- Slight delay may reduce response rate
- Good for high-ticket jobs

---

## Available Triggers (Watch Modules)

### Instant Triggers (Webhooks)

| Module | Description | Use Case |
|--------|-------------|----------|
| **Watch Events** | Fires immediately when events occur in Jobber | Real-time automation, review requests |

### Polling Triggers

| Module | Description | Polling Interval |
|--------|-------------|------------------|
| **Watch Job Updates** | Detects job status changes | Configurable |
| **Watch Updated Clients** | Fires when client records change | Configurable |

---

## Available Actions

### Jobs

| Action | Description |
|--------|-------------|
| Search Jobs | Find jobs by criteria |
| Get Job Details | Retrieve full job information |
| Create a Job | Create new job |
| Update a Job | Modify existing job |
| Close a Job | Mark job as closed |
| Reopen a Job | Reopen a closed job |

### Visits

| Action | Description |
|--------|-------------|
| Create a Visit | Schedule a new visit |
| Update a Visit | Modify visit details |
| Delete a Visit | Remove a visit |
| **Complete a Visit** | Mark visit as done |
| Mark Visit as Incomplete | Undo completion |
| Create a Visit Line Item | Add line item to visit |

### Clients

| Action | Description |
|--------|-------------|
| Search Clients | Find clients by criteria |
| Create a Client | Add new client |
| Update a Client | Modify client info |
| Archive a Client | Archive client record |

### Invoices

| Action | Description |
|--------|-------------|
| Search Invoices | Find invoices |
| Get an Invoice | Retrieve invoice details |
| Update an Invoice | Modify invoice |

### Quotes

| Action | Description |
|--------|-------------|
| Search Quotes | Find quotes |
| Get a Quote | Retrieve quote details |
| Create a Quote | Create new quote |
| Update a Quote | Modify quote |
| Close a Quote | Close/complete quote |
| Create a Quote Note | Add note to quote |
| Update a Quote Note | Modify quote note |

### Properties

| Action | Description |
|--------|-------------|
| Search Properties | Find properties |
| Get a Property | Retrieve property details |
| Create a Property | Add new property |
| Update a Property | Modify property |

### Tasks

| Action | Description |
|--------|-------------|
| Get a Task | Retrieve task details |
| Create a Task | Create new task |
| Update a Task | Modify task |
| Delete a Task | Remove task |
| Archive a Task | Archive task |

### Users

| Action | Description |
|--------|-------------|
| Search Users | Find users/technicians |
| Create a User | Add new user |

### Expenses

| Action | Description |
|--------|-------------|
| Create an Expense | Log expense |
| Update an Expense | Modify expense |
| Delete an Expense | Remove expense |

### Requests

| Action | Description |
|--------|-------------|
| Create a Request | Create service request |
| Archive a Request | Archive request |

### Universal

| Action | Description |
|--------|-------------|
| **Make an API Call** | Custom GraphQL query for anything not covered |

---

## Data Available from Jobber

When a job completes, you can pull:

```json
{
  "job": {
    "id": "job_123",
    "title": "Water Heater Installation",
    "status": "completed",
    "completed_at": "2025-01-24T15:30:00Z"
  },
  "client": {
    "name": "John Smith",
    "phone": "+15551234567",
    "email": "john@example.com"
  },
  "property": {
    "address": "123 Main St"
  },
  "assigned_users": [
    {
      "name": "Mike (Technician)",
      "id": "user_456"
    }
  ],
  "invoice": {
    "total": 2500.00,
    "status": "awaiting_payment"
  }
}
```

This data can be passed to your review request webhook to personalize the message:
> "Hi John! How was your Water Heater Installation with Mike?"

---

## Setup Checklist for Contractors

- [ ] Contractor has Jobber account (Connect or Grow plan)
- [ ] Connect Jobber to Make via OAuth
- [ ] Choose trigger: Job Completed or Invoice Paid
- [ ] Map fields: customer name, phone, tech name, job type
- [ ] Point to webhook: `POST /api/webhooks/trigger-review`
- [ ] Test with a sample job

---

## Jobber Plan Requirements

| Plan | Make Integration | API Access |
|------|------------------|------------|
| Core | No | No |
| Connect | Yes | Yes |
| Grow | Yes | Yes |

Contractors need **Connect** or **Grow** plan for Make integration.
