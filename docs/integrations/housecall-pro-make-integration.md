# Housecall Pro Integration via Make.com

Integration: **Official Make.com integration**

## Review Request Trigger Options

When should we send a review request? Here are your options:

| Trigger | When It Fires | Best For | Considerations |
|---------|---------------|----------|----------------|
| **Watch Updated Jobs (status=completed)** | Job marked complete | Most contractors | Standard approach |
| **Watch Updated Jobs (status=paid)** | Job is paid | Payment-first | Wait for payment before asking |
| **Watch New Jobs + delay** | New job created | Scheduled follow-up | Requires adding delay module |
| **Watch Updated Estimates (approved)** | Estimate approved | Quote-to-job flow | Early in the process |

### Recommended: Job Completed Status

Filter "Watch Updated Jobs" for `status = completed`:
- Fires when tech marks job done in the field
- Customer experience is fresh
- Natural "we're done" moment

### Alternative: Job Paid Status

Filter for `status = paid`:
- Ensures positive interaction (they paid)
- Avoids awkward timing if payment disputes
- May have 1-7 day delay after service

---

## Available Triggers (Watch Modules)

| Module | Description | Type |
|--------|-------------|------|
| **Watch New Jobs** | Detects jobs reaching specified statuses | Polling |
| **Watch Updated Jobs** | Monitors job updates with specific statuses | Polling |
| **Watch Customers** | Triggers when new customer added | Polling |
| **Watch Estimates** | Activates when new estimates generated | Polling |
| **Watch Updated Estimates** | Fires when estimates modified | Polling |
| **Watch Leads** | Triggers when new leads added | Polling |

### Job Status Values for Filtering

When using "Watch Updated Jobs", filter by status:

| Status | Description |
|--------|-------------|
| `scheduled` | Job is scheduled |
| `in_progress` | Tech is working on job |
| `completed` | Job marked complete |
| `paid` | Payment received |
| `canceled` | Job canceled |

---

## Available Actions

### Customers

| Action | Description |
|--------|-------------|
| Create a Customer | Add new customer |
| Update a Customer | Modify customer info |
| Get a Customer | Retrieve customer details |
| Search Customers | Find customers by criteria |
| Create a Customer Address | Add address to customer |
| Get a Customer Address | Retrieve address |
| List Customer Addresses | Get all addresses for customer |

### Jobs

| Action | Description |
|--------|-------------|
| Create a Job | Create new job |
| Get a Job | Retrieve job details |
| Search Jobs | Find jobs by criteria |
| Add a Job Line Item | Add service/product to job |
| Add a Job Note | Add note to job |
| Add a Job Tag | Tag a job |
| Add an Attachment to a Job | Attach file to job |
| Delete a Job Note | Remove note |
| Delete a Job Tag | Remove tag |
| Create a Job Appointment | Schedule appointment |
| Update a Job Appointment | Modify appointment |
| Delete a Job Appointment | Remove appointment |
| Create a Job Link | Add link to job |
| List Job Appointments | Get all appointments |
| List Job Invoices | Get invoices for job |

### Estimates

| Action | Description |
|--------|-------------|
| Create an Estimate | Create new estimate |
| Get an Estimate | Retrieve estimate details |
| Search Estimates | Find estimates |
| Add an Estimate Attachment | Attach file |
| Create an Estimate Option Link | Add option link |
| Create an Estimate Option Note | Add note to option |
| Delete an Estimate Option Note | Remove note |

### Leads

| Action | Description |
|--------|-------------|
| Create a Lead | Add new lead |
| Get a Lead | Retrieve lead details |
| Search Leads | Find leads |

### Other

| Action | Description |
|--------|-------------|
| Search Checklists | Find checklists |
| List Employees | Get all employees/techs |
| List Schedule Windows | Get scheduling windows |
| **Make an API Call** | Custom API request |

---

## Data Available from Housecall Pro

When a job completes, you can access:

```json
{
  "job": {
    "id": "job_abc123",
    "name": "AC Repair",
    "status": "completed",
    "scheduled_start": "2025-01-24T09:00:00Z",
    "completed_at": "2025-01-24T11:30:00Z"
  },
  "customer": {
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "+15559876543",
    "email": "jane@example.com"
  },
  "address": {
    "street": "456 Oak Ave",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "assigned_employee": {
    "name": "Carlos",
    "id": "emp_789"
  },
  "invoice": {
    "total": 350.00,
    "balance_due": 0.00
  },
  "tags": ["residential", "hvac", "repair"]
}
```

Personalized review request:
> "Hi Jane! How was your AC Repair with Carlos today?"

---

## Setup Checklist for Contractors

- [ ] Contractor has Housecall Pro account (Pro plan or higher)
- [ ] Connect Housecall Pro to Make via OAuth
- [ ] Add "Watch Updated Jobs" trigger
- [ ] Set filter: status = "completed"
- [ ] Map fields: customer name, phone, employee name, job type
- [ ] Add HTTP module pointing to webhook
- [ ] Test with a sample job

---

## Housecall Pro Plan Requirements

| Plan | Make Integration | API Access |
|------|------------------|------------|
| Basic | Limited | No |
| Essentials | Yes | Yes |
| MAX | Yes | Yes |

Contractors need **Essentials** or **MAX** plan for full integration access.

---

## Comparison: Jobber vs Housecall Pro

| Feature | Jobber | Housecall Pro |
|---------|--------|---------------|
| Instant webhooks | Yes (Watch Events) | No (polling only) |
| Job completion trigger | Yes | Yes |
| Tech/employee data | Yes | Yes |
| Invoice data | Yes | Yes |
| Customer phone | Yes | Yes |
| Make integration quality | Excellent (40+ modules) | Good (30+ modules) |
| Typical user | Plumbers, electricians | HVAC, general contractors |

Both work well for review automation. Jobber's instant webhooks are slightly faster, but Housecall Pro's polling triggers work fine for review requests (a few minutes delay doesn't matter).
