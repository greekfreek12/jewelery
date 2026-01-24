# Make.com Blueprint Templates

These are scenario blueprints you can import into Make.com for each integration.

## How to Import a Blueprint

1. Log into Make.com
2. Click **Create a new scenario**
3. Click the **...** menu (three dots) in the bottom toolbar
4. Select **Import Blueprint**
5. Paste the JSON content from the appropriate file
6. Click **Save**

## After Importing

Each blueprint needs configuration:

1. **Connect the source app** (Jobber, Housecall Pro, or QuickBooks)
   - Click the first module
   - Click **Add** or **Create a connection**
   - Log in with the contractor's credentials

2. **Update the webhook URL**
   - Click the HTTP module
   - Replace `{{CONTRACTOR_ID}}` with the actual contractor ID from your database

3. **Turn on the scenario**
   - Click the toggle in the bottom left
   - Set the schedule (every 15 minutes is fine for polling triggers)

## Webhook URL Format

```
https://yourapp.com/api/webhooks/trigger-review/{{CONTRACTOR_ID}}
```

Replace `yourapp.com` with your actual domain and `{{CONTRACTOR_ID}}` with the contractor's UUID from your database.

## Test the Integration

After setup:
1. Create a test job in Jobber/HCP/QuickBooks
2. Complete the job
3. Check Make's scenario history for the run
4. Check your app's inbox for the sent review request
