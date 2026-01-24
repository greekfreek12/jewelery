# Make.com Setup Guide

Step-by-step guide for setting up review automations for contractors.

## Prerequisites

Before the onboarding call:
- You have a Make.com account (free tier works to start)
- Contractor has their contractor ID (UUID from your database)
- Contractor knows their Jobber/HCP/QuickBooks login

---

## Your Make.com Account Setup (One-Time)

### 1. Create Make Account
1. Go to [make.com](https://www.make.com)
2. Sign up for free account
3. Verify email

### 2. Organize with Folders
1. Click **Scenarios** in left sidebar
2. Create folder: **"Contractors"**
3. Inside that, create sub-folders by contractor name (optional)

---

## Per-Contractor Setup

### Step 1: Get Contractor ID

From your admin panel or database, get the contractor's UUID:
```
Example: 550e8400-e29b-41d4-a716-446655440000
```

### Step 2: Create New Scenario

1. Click **Create a new scenario**
2. Search for the source app (Jobber, Housecall Pro, or QuickBooks)
3. Search for **HTTP**

### Step 3: Configure Based on Platform

---

## Jobber Setup

### Module 1: Watch Events

1. Click the **+** to add first module
2. Search **Jobber** → Select **Watch Events**
3. Click **Add** to create connection
4. **On Zoom call:** Have contractor log into their Jobber account
5. Authorize the connection
6. Configure:
   - **Event Type:** Select events that include job updates

### Module 2: Filter (Only Completed)

1. Click **+** after Jobber module
2. Add **Filter**
3. Configure:
   - **Label:** "Only Completed Jobs"
   - **Condition:** `status` → `Equal to` → `completed`

### Module 3: HTTP Request

1. Click **+** after filter
2. Search **HTTP** → Select **Make a request**
3. Configure:
   - **URL:** `https://yourapp.com/api/webhooks/trigger-review/CONTRACTOR_ID`
     - Replace `yourapp.com` with your domain
     - Replace `CONTRACTOR_ID` with the actual UUID
   - **Method:** POST
   - **Body type:** Raw
   - **Content type:** JSON (application/json)
   - **Request content:**
   ```json
   {
     "contact_phone": "{{client.phones[].number}}",
     "contact_name": "{{client.firstName}} {{client.lastName}}",
     "contact_email": "{{client.emails[].address}}",
     "job_type": "{{title}}",
     "tech_name": "{{assignedUsers[].name}}",
     "source": "jobber"
   }
   ```

### Module 4: Turn On

1. Click the toggle in bottom left → **ON**
2. Set schedule: **Every 15 minutes**
3. Click **Save**

---

## Housecall Pro Setup

### Module 1: Watch Updated Jobs

1. Click **+** to add first module
2. Search **Housecall Pro** → Select **Watch Updated Jobs**
3. Click **Add** to create connection
4. **On Zoom call:** Have contractor log into their HCP account
5. Authorize the connection
6. Configure:
   - **Status:** Select `completed`

### Module 2: Get Customer

1. Click **+** after HCP module
2. Search **Housecall Pro** → Select **Get a Customer**
3. Use same connection
4. Configure:
   - **Customer ID:** Map from previous module `{{customer.id}}`

### Module 3: HTTP Request

1. Click **+** after Get Customer
2. Search **HTTP** → Select **Make a request**
3. Configure:
   - **URL:** `https://yourapp.com/api/webhooks/trigger-review/CONTRACTOR_ID`
   - **Method:** POST
   - **Body type:** Raw
   - **Content type:** JSON (application/json)
   - **Request content:**
   ```json
   {
     "contact_phone": "{{phone}}",
     "contact_name": "{{first_name}} {{last_name}}",
     "contact_email": "{{email}}",
     "job_type": "{{name}}",
     "tech_name": "{{assigned_employee.name}}",
     "source": "housecall_pro"
   }
   ```

### Module 4: Turn On

1. Click toggle → **ON**
2. Set schedule: **Every 15 minutes**
3. Click **Save**

---

## QuickBooks Setup

### Module 1: New Event

1. Click **+** to add first module
2. Search **QuickBooks** → Select **New Event**
3. Click **Add** to create connection
4. **On Zoom call:** Have contractor log into their QuickBooks account
5. Authorize the connection
6. Configure:
   - **Object Type:** `Invoice` (or `Payment` if waiting for payment)

### Module 2: Get Customer

1. Click **+** after QuickBooks module
2. Search **QuickBooks** → Select **Get a Customer**
3. Use same connection
4. Configure:
   - **Customer ID:** Map `{{CustomerRef.value}}`

### Module 3: Filter (Has Phone)

1. Click **+** after Get Customer
2. Add **Filter**
3. Configure:
   - **Label:** "Has Phone Number"
   - **Condition:** `PrimaryPhone.FreeFormNumber` → `Exists`

### Module 4: HTTP Request

1. Click **+** after filter
2. Search **HTTP** → Select **Make a request**
3. Configure:
   - **URL:** `https://yourapp.com/api/webhooks/trigger-review/CONTRACTOR_ID`
   - **Method:** POST
   - **Body type:** Raw
   - **Content type:** JSON (application/json)
   - **Request content:**
   ```json
   {
     "contact_phone": "{{PrimaryPhone.FreeFormNumber}}",
     "contact_name": "{{DisplayName}}",
     "contact_email": "{{PrimaryEmailAddr.Address}}",
     "job_type": "{{Line[].Description}}",
     "source": "quickbooks"
   }
   ```

### Module 5: Turn On

1. Click toggle → **ON**
2. Click **Save**

---

## Testing

### 1. Run Once Manually
1. Right-click the first module
2. Select **Run this module only**
3. Check if it pulls data correctly

### 2. Full Test
1. In Jobber/HCP/QuickBooks, create a test job
2. Complete the job
3. In Make, click **Run once** (play button)
4. Check execution history
5. Verify review request appears in your app's inbox

### 3. Check for Errors
- Green checkmark = success
- Red X = error (click to see details)
- Common issues:
  - Wrong contractor ID
  - Missing phone number on customer
  - Contractor not subscribed

---

## Onboarding Call Script

**Before call (5 min):**
- Look up contractor ID in admin panel
- Have Make.com open
- Have blueprint JSON ready (optional)

**On call (15-20 min):**

1. **Intro (2 min)**
   > "We're going to set up automatic review requests. When a job is completed in [Jobber/HCP/QB], it'll automatically text the customer asking for a rating."

2. **Create scenario (3 min)**
   > "I'm creating the automation now. You'll need to log into your [Jobber/HCP/QB] to connect it."

3. **Connect their account (5 min)**
   > "Click this link and log in with your [Jobber/HCP/QB] credentials. This lets the automation see when jobs are completed."
   - Share screen, walk them through OAuth
   - They log in on their end

4. **Configure & test (5 min)**
   > "Let me configure the rest... Now let's test it. Can you complete a test job in [Jobber/HCP/QB]?"
   - Wait for them to complete test job
   - Run the scenario
   - Show them the review request in your app

5. **Wrap up (2 min)**
   > "All set! From now on, every time you complete a job, the customer gets a review request text. You can see all responses in your inbox here."

---

## Troubleshooting

### "Contractor not found"
- Wrong contractor ID in webhook URL
- Double-check UUID matches database

### "Contractor phone not configured"
- Contractor hasn't set up their TextGrid phone number yet
- Complete phone setup first

### "Contact has opted out"
- Customer previously replied STOP
- Can't send to opted-out contacts

### "Review request already pending"
- Duplicate trigger (job completed twice?)
- Working as intended - prevents spam

### No data from Jobber/HCP/QB
- OAuth connection expired
- Have contractor re-authorize
- Check Make's connection settings

### HTTP 500 error
- Check your server logs
- Usually a code bug or database issue

---

## Make.com Pricing Notes

**Free tier:**
- 1,000 operations/month
- Enough for ~100-200 review requests

**Core plan ($9/mo):**
- 10,000 operations/month
- Enough for most contractors

**Pro plan ($16/mo):**
- Unlimited scenarios
- Better for agencies managing many contractors

For your use case (managing multiple contractors), you'll likely need **Core** or **Pro** depending on volume.
