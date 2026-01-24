# QuickBooks Online Integration via Make.com

Integration: **Official Make.com integration**

## Review Request Trigger Options

QuickBooks is accounting software, not job management — so triggers are **invoice/payment-based**, not "job completed."

| Trigger | When It Fires | Best For | Considerations |
|---------|---------------|----------|----------------|
| **New Event → Invoice Created** | Invoice generated | Contractors who invoice on completion | May be before payment |
| **Watch Payments** | Payment received | Wait-for-payment approach | Delay after service |
| **New Event → Sales Receipt** | Cash sale recorded | Immediate payment jobs | Same-day service |

### Recommended: Invoice Created or Payment

**Invoice Created** — Good for contractors who invoice when job is done
- Fires when they create the invoice in QuickBooks
- Customer just received service (assuming same-day invoicing)

**Watch Payments** — Good for contractors who want to wait
- Fires when payment is recorded
- Ensures positive transaction before asking for review

---

## Available Triggers

| Module | Type | Description |
|--------|------|-------------|
| **New Event** | Instant (webhook) | Fires when events happen - filter by type (invoice, estimate, payment, etc.) |
| **Watch Payments** | Instant | Fires when new payment is created |

### New Event - Object Types

The "New Event" trigger can watch for:
- Invoice (created/updated/deleted)
- Estimate
- Payment
- Customer
- Sales Receipt
- Bill
- Purchase Order
- Vendor
- And more...

---

## Available Actions

### Invoices

| Action | Description |
|--------|-------------|
| Create Invoice | Create new invoice |
| Update Invoice | Modify existing invoice |
| Delete Invoice | Remove invoice |
| Get Invoice | Retrieve invoice details |
| Search for Invoices | Find invoices by criteria |
| Download an Invoice | Get PDF |
| Send an Invoice | Email to customer |

### Bills

| Action | Description |
|--------|-------------|
| Create a Bill | Create new bill |
| Update a Bill | Modify bill |
| Delete a Bill | Remove bill |
| Get a Bill | Retrieve bill details |
| Search for Bills | Find bills by criteria |

### Sales Receipts

| Action | Description |
|--------|-------------|
| Create a Sales Receipt | Create new receipt |
| Update a Sales Receipt | Modify receipt |
| Delete a Sales Receipt | Remove receipt |
| Get a Sales Receipt | Retrieve details |
| Search for Sales Receipts | Find receipts |
| Download a Sales Receipt | Get PDF |
| Send a Sales Receipt | Email to customer |

### Estimates

| Action | Description |
|--------|-------------|
| Create an Estimate | Create new estimate |
| Update an Estimate | Modify estimate |
| Delete an Estimate | Remove estimate |
| Get an Estimate | Retrieve details |
| Search for Estimates | Find estimates |
| Download an Estimate | Get PDF |
| Send an Estimate | Email to customer |

### Journal Entries

| Action | Description |
|--------|-------------|
| Create a Journal Entry | Create entry |
| Update a Journal Entry | Modify entry |
| Delete a Journal Entry | Remove entry |
| Get a Journal Entry | Retrieve details |
| Search for Journal Entries | Find entries |

### Payments

| Action | Description |
|--------|-------------|
| Create a Payment | Record payment |
| Update a Payment | Modify payment |
| Delete a Payment | Remove payment |
| Get a Payment | Retrieve details |
| Search for Payments | Find payments |
| Download a Payment | Get PDF |
| Create a Credit Card Payment | Record CC payment |

### Deposits

| Action | Description |
|--------|-------------|
| Create a Deposit | Create deposit |
| Update a Deposit | Modify deposit |
| Delete a Deposit | Remove deposit |
| Get a Deposit | Retrieve details |
| Search for Deposits | Find deposits |

### Credit Memos

| Action | Description |
|--------|-------------|
| Create a Credit Memo | Create credit |
| Update a Credit Memo | Modify credit |
| Delete a Credit Memo | Remove credit |
| Get a Credit Memo | Retrieve details |
| Search for Credit Memos | Find credits |

### Purchase Orders

| Action | Description |
|--------|-------------|
| Create a Purchase Order | Create PO |
| Update a Purchase Order | Modify PO |
| Delete a Purchase Order | Remove PO |
| Get a Purchase Order | Retrieve details |
| Search for Purchase Orders | Find POs |

### Customers

| Action | Description |
|--------|-------------|
| Create a Customer | Add new customer |
| Update a Customer | Modify customer |
| Get a Customer | Retrieve details |
| Search for Customers | Find customers |

### Items

| Action | Description |
|--------|-------------|
| Create an Item | Add product/service |
| Update an Item | Modify item |
| Get an Item | Retrieve details |
| Search for Items | Find items |

### Vendors

| Action | Description |
|--------|-------------|
| Create a Vendor | Add vendor |
| Update a Vendor | Modify vendor |
| Search for Vendors | Find vendors |

### Attachments / Files

| Action | Description |
|--------|-------------|
| Create Text Attachment | Add text attachment |
| Upload a File | Upload file |
| Download a File | Get file |
| Delete an Attachment | Remove attachment |
| Search for Attachments | Find attachments |

### Accounts

| Action | Description |
|--------|-------------|
| Create an Account | Create chart of accounts entry |
| Update an Account | Modify account |
| Get an Account | Retrieve details |
| Search for Accounts | Find accounts |

### Purchases

| Action | Description |
|--------|-------------|
| Create a Purchase | Record purchase |
| Update a Purchase | Modify purchase |
| Delete a Purchase | Remove purchase |
| Get a Purchase | Retrieve details |
| Search for Purchases | Find purchases |

### Time Activities

| Action | Description |
|--------|-------------|
| Create a Time Activity | Log time |
| Update a Time Activity | Modify time entry |
| Delete a Time Activity | Remove entry |
| Get a Time Activity | Retrieve details |
| Search for Time Activities | Find entries |

### Refund Receipts

| Action | Description |
|--------|-------------|
| Create a Refund Receipt | Create refund |
| Update a Refund Receipt | Modify refund |
| Delete a Refund Receipt | Remove refund |
| Get a Refund Receipt | Retrieve details |
| Search for Refund Receipts | Find refunds |

### Other

| Action | Description |
|--------|-------------|
| Get My Company | Retrieve company info |
| Make API Call | Custom API request |

---

## Data Available from QuickBooks

When an invoice is created, you can access:

```json
{
  "invoice": {
    "id": "inv_123",
    "doc_number": "1042",
    "total": 450.00,
    "balance": 450.00,
    "due_date": "2025-02-07",
    "created_at": "2025-01-24T14:00:00Z"
  },
  "customer": {
    "id": "cust_456",
    "display_name": "John Smith",
    "primary_phone": "+15551234567",
    "primary_email": "john@example.com"
  },
  "line_items": [
    {
      "description": "HVAC Repair - Compressor Replacement",
      "amount": 450.00
    }
  ],
  "company": {
    "name": "ABC Plumbing & HVAC"
  }
}
```

Personalized review request:
> "Hi John! Thanks for choosing ABC Plumbing & HVAC. How was your recent service? Reply 1-5 to rate your experience."

---

## QuickBooks vs Job Management Software

| Aspect | QuickBooks | Jobber/Housecall Pro |
|--------|------------|----------------------|
| **Primary purpose** | Accounting | Job scheduling |
| **"Job completed" trigger** | No | Yes |
| **Invoice trigger** | Yes | Yes |
| **Payment trigger** | Yes | Yes |
| **Tech/employee tracking** | Limited (time activities) | Full |
| **Job type/description** | Via line items | Native field |

### When QuickBooks Works for Review Requests

QuickBooks works well when:
- Contractor invoices immediately after completing work
- They want to trigger on payment (wait until paid)
- They don't use dedicated job management software
- Solo contractors who just use QuickBooks for everything

### When to Recommend Jobber/Housecall Pro Instead

If contractor wants to trigger on "job done" (before invoicing):
- Recommend connecting Jobber or Housecall Pro
- QuickBooks can stay as their accounting system
- Use job software for trigger, QuickBooks for financials

---

## Setup Checklist for Contractors

- [ ] Contractor has QuickBooks Online account
- [ ] Connect QuickBooks to Make via OAuth
- [ ] Choose trigger: New Event (Invoice) or Watch Payments
- [ ] Map fields: customer name, phone, line item description
- [ ] Point to webhook: `POST /api/webhooks/trigger-review`
- [ ] Test with a sample invoice

---

## QuickBooks Plan Requirements

| Plan | Make Integration |
|------|------------------|
| Simple Start | Yes |
| Essentials | Yes |
| Plus | Yes |
| Advanced | Yes |

All QuickBooks Online plans support the Make integration.

---

## Common QuickBooks Workflows

### 1. Review Request on Invoice Created

```
QuickBooks: New Event (Invoice Created)
    ↓
Make: Filter (only if customer has phone)
    ↓
Make: HTTP Request → Your webhook
    ↓
Your system: Send review SMS
```

### 2. Review Request on Payment Received

```
QuickBooks: Watch Payments
    ↓
Make: Get Invoice (to get line items/description)
    ↓
Make: Get Customer (to get phone number)
    ↓
Make: HTTP Request → Your webhook
    ↓
Your system: Send review SMS
```

### 3. Sync Customers to Contacts

```
QuickBooks: New Event (Customer Created)
    ↓
Make: HTTP Request → Your contacts webhook
    ↓
Your system: Create contact record
```

---

## Limitations

1. **No "job completed" concept** — Must use invoice/payment triggers
2. **Phone number may be missing** — QuickBooks doesn't require phone
3. **No technician assignment** — Can't personalize "How was service with Mike?"
4. **Line items for job description** — Less structured than job management software

For contractors who need tech tracking and job-based triggers, recommend adding Jobber or Housecall Pro alongside QuickBooks.
