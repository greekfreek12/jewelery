# ServiceTitan Integration via Make.com

Integration: **Official Make.com integration**

**Target Market:** Enterprise contractors ($1000+/mo ServiceTitan subscription), 25+ technicians

## Review Request Trigger Options

| Trigger | When It Fires | Best For | Considerations |
|---------|---------------|----------|----------------|
| **Watch Jobs** | New job created or updated | Review after job completion | Filter for completed status |

### Note on ServiceTitan

ServiceTitan is enterprise-level software. Their customers are typically larger operations (25+ techs). The Make integration is more limited than Jobber/Housecall Pro, but the "Watch Jobs" trigger works for review automation.

---

## Available Triggers

| Module | Type | Description |
|--------|------|-------------|
| **Watch Jobs** | Polling | Fires when jobs are created or updated |

### Filtering Watch Jobs

You'll need to filter for completed jobs in Make:
- Check job status field
- Only proceed if status = completed/closed

---

## Available Actions

### Jobs

| Action | Description |
|--------|-------------|
| Create a Job | Create new job in ServiceTitan |
| Create a Job Note | Add note to existing job |
| Upload an Attachment | Attach file to job |

### Tasks

| Action | Description |
|--------|-------------|
| Create a Task | Create task in task management |

---

## Available Searches

| Search | Description |
|--------|-------------|
| Search Customers | Find customers by criteria |
| Search Adjustments | Find adjustments |
| Search Receipts | Find receipts |

### Universal

| Action | Description |
|--------|-------------|
| Make an API Call | Custom API request for anything not covered |

---

## Data Available from ServiceTitan

When a job completes, you can access:

```json
{
  "job": {
    "id": "123456",
    "number": "J-2025-1042",
    "status": "Completed",
    "type": "Service Call",
    "summary": "AC not cooling",
    "completedOn": "2025-01-24T16:00:00Z"
  },
  "customer": {
    "id": "789",
    "name": "John Smith",
    "phones": [
      { "type": "Mobile", "number": "+15551234567" }
    ],
    "email": "john@example.com"
  },
  "location": {
    "address": "123 Main St",
    "city": "Phoenix",
    "state": "AZ"
  },
  "technician": {
    "id": "tech_456",
    "name": "Carlos Martinez"
  },
  "businessUnit": {
    "name": "HVAC Division"
  },
  "invoice": {
    "total": 850.00
  }
}
```

Personalized review request:
> "Hi John! How was your service with Carlos from ABC HVAC today? Reply 1-5 to rate your experience."

---

## Connection Requirements

ServiceTitan → Make connection requires:

1. **Customer Admin account** in ServiceTitan
2. **Make.com account**
3. **Tenant ID** — Must share with Make via their Tally form
4. **API access** — May require ServiceTitan support to enable

### Important: Partnership Approval

ServiceTitan has a more controlled API ecosystem. You may need to:
- Contact ServiceTitan support to enable API access
- Complete their integration partner process
- This is NOT instant like Jobber/Housecall Pro

---

## Setup Checklist for Contractors

- [ ] Contractor has ServiceTitan account (any tier with API access)
- [ ] API access enabled in ServiceTitan
- [ ] Tenant ID obtained
- [ ] Connect ServiceTitan to Make via OAuth
- [ ] Add "Watch Jobs" trigger
- [ ] Add filter for completed status
- [ ] Map fields: customer name, phone, tech name, job type
- [ ] Point to webhook: `POST /api/webhooks/trigger-review`
- [ ] Test with a sample completed job

---

## ServiceTitan vs Other Platforms

| Aspect | ServiceTitan | Jobber/Housecall Pro |
|--------|--------------|----------------------|
| **Target size** | 25+ techs | 1-25 techs |
| **Pricing** | $1000+/mo | $50-300/mo |
| **Make integration** | Limited (fewer modules) | Full (40+ modules) |
| **API access** | Requires approval | Self-service |
| **Your customer fit** | Less likely at $297/mo | Primary target |

### Recommendation

ServiceTitan customers are likely too large for your $297/mo product — they often have dedicated ops teams and custom integrations. However, having the integration available is good for:
- Credibility ("we integrate with ServiceTitan")
- Catching the occasional smaller ServiceTitan shop
- Future upsell to enterprise tier

---

## Limitations

1. **Limited triggers** — Only "Watch Jobs" (no invoice/payment triggers)
2. **Approval required** — Not instant self-service like other platforms
3. **Enterprise focus** — Their customers may be too big for your product
4. **Fewer modules** — Can't do as much as Jobber/HCP integrations

---

## Workflow Example

```
ServiceTitan: Watch Jobs
    ↓
Make: Filter (status = "Completed")
    ↓
Make: Search Customers (get phone number)
    ↓
Make: HTTP Request → Your webhook
    ↓
Your system: Send review SMS
```

---

## Resources

- [ServiceTitan on Make](https://www.make.com/en/integrations/service-titan)
- [ServiceTitan API Docs](https://developer.servicetitan.io/)
- [ServiceTitan Hacks Course](https://www.servicetitanhacks.com/products/courses/servicetitan-to-make)
