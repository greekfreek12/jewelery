# TextGrid Integration Guide

## Credentials

```
Account SID: sJFwswSTcDez1oz7FYKUMg==
Auth Token: B66B7EDB4AF7436B976BE44A6AFEC6B3
Webhook Secret: 6a060265c9314f929c3d65f4ff2a24ab
```

Base URL: `https://api.textgrid.com/2010-04-01`

## Authentication

All requests use Bearer token with Base64 encoded `{AccountSid}:{AuthToken}`:

```javascript
const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');
const headers = {
  'Authorization': `Bearer ${auth}`,
  'Content-Type': 'application/json'
};
```

---

## Phone Number Management

### Buy a Phone Number

**Step 1: Search available numbers**

```
GET /Accounts/{accountSid}/AvailablePhoneNumbers/US/Local.json?areaCode=504
```

Response:
```json
{
  "available_phone_numbers": [
    {"phone_number": "+15044149448", "friendly_name": "(504) 414-9448"}
  ]
}
```

**Step 2: Purchase the number with webhooks**

```
POST /Accounts/{accountSid}/IncomingPhoneNumbers.json
Content-Type: application/x-www-form-urlencoded

phoneNumber=+15044149448
friendlyName=Contractor ABC
smsUrl=https://yourapp.com/api/webhooks/sms/contractor-abc-123
voiceUrl=https://yourapp.com/api/webhooks/voice/contractor-abc-123
statusCallback=https://yourapp.com/api/webhooks/status/contractor-abc-123
```

Response:
```json
{
  "sid": "OwBn1UScmNeHCe9gPezefA==",
  "phone_number": "+15044149448",
  "sms_url": "https://yourapp.com/api/webhooks/sms/contractor-abc-123",
  "voice_url": "https://yourapp.com/api/webhooks/voice/contractor-abc-123",
  "status": "in-use"
}
```

**Step 3: Add to campaign (MANUAL - Dashboard only)**

- Log into TextGrid dashboard
- Go to phone numbers
- Assign to campaign (e.g., "Atlas Growth" - C6E7RMQ)
- Takes ~30 seconds per number

**NOTE:** Campaign assignment is NOT available via API. This is the one manual step.

### Update Phone Number Webhooks

```
POST /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}.json
Content-Type: application/x-www-form-urlencoded

smsUrl=https://yourapp.com/api/webhooks/sms/new-endpoint
voiceUrl=https://yourapp.com/api/webhooks/voice/new-endpoint
```

### Delete Phone Number

```
DELETE /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}.json
```

Returns 204 No Content on success.

### List All Phone Numbers

```
GET /Accounts/{accountSid}/IncomingPhoneNumbers.json
```

---

## Sending SMS

```
POST /Accounts/{accountSid}/Messages.json
Content-Type: application/json

{
  "from": "+15044149448",
  "to": "+12055005170",
  "body": "Thanks for choosing ABC Roofing! Reply STOP to opt out.",
  "statusCallback": "https://yourapp.com/api/webhooks/sms-status"
}
```

Response:
```json
{
  "sid": "SMONs1iT7~94PzhS26nNNiXww==",
  "status": "queued",
  "from": "+15044149448",
  "to": "+12055005170",
  "body": "Thanks for choosing ABC Roofing!",
  "date_sent": "Thu, 22 Jan 2026 23:03:21 +0000"
}
```

### Check Message Status

```
GET /Accounts/{accountSid}/Messages/{messageSid}.json
```

Response includes:
```json
{
  "status": "delivered",
  "price": "-0.00650",
  "surcharge": "-0.00300",
  "carrierNetwork": "AT&T"
}
```

### Pricing

- Base: $0.0065/SMS
- Surcharge: $0.003/SMS
- **Total: ~$0.0095/SMS (less than 1 cent)**

---

## Receiving Webhooks

### Incoming SMS Webhook

TextGrid POSTs to your `smsUrl` with `application/x-www-form-urlencoded`:

```
AccountSid=sJFwswSTcDez1oz7FYKUMg==
MessageSid=SM123456
From=+12055005170
To=+15044149448
Body=Hey, I need a quote for my roof
NumMedia=0
SmsStatus=received
```

**Your response** (must return TwiML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks! We'll get back to you shortly.</Message>
</Response>
```

Or if no auto-reply:
```xml
<Response />
```

### Incoming Voice Call Webhook

TextGrid POSTs to your `voiceUrl`:

```
CallSid=CA123456
AccountSid=sJFwswSTcDez1oz7FYKUMg==
From=+12055005170
To=+15044149448
CallStatus=ringing
Direction=inbound
```

**Your response** (TwiML):

```xml
<Response>
  <Say voice="alice">Thanks for calling ABC Roofing. Please leave a message.</Say>
  <Record maxLength="120" action="https://yourapp.com/api/webhooks/recording" />
</Response>
```

Or forward to contractor's cell:
```xml
<Response>
  <Say voice="alice">Connecting you now.</Say>
  <Dial>+15551234567</Dial>
</Response>
```

### SMS Status Callback

TextGrid POSTs when delivery status changes:

```
SmsSid=SM123456
MessageSid=SM123456
MessageStatus=delivered  (or: undelivered, failed)
SmsStatusDetail=...
```

### Webhook Signature Verification

All webhooks include `X-TextGrid-Signature` header (HMAC-SHA1).

```javascript
const crypto = require('crypto');

function verifyWebhook(webhookUrl, requestBody, signature, webhookSecret) {
  const stringToSign = webhookUrl + requestBody;
  const computed = crypto
    .createHmac('sha1', webhookSecret)
    .update(stringToSign)
    .digest('base64');
  return computed === signature;
}
```

---

## Architecture: Multiple Contractors, One Account

```
Your TextGrid Account (master)
├── +15041111111 → /api/webhooks/sms/contractor-abc
├── +15042222222 → /api/webhooks/sms/contractor-xyz
├── +15043333333 → /api/webhooks/sms/contractor-def
└── All on same campaign "Atlas Growth"
```

**Per-number webhook routing** - each contractor's phone number points to a unique webhook URL. Your backend parses the URL or the `To` number to identify which contractor.

**Onboarding flow:**
1. Contractor signs up (Stripe payment)
2. API: Search available numbers in their area code
3. API: Purchase number with contractor-specific webhook URLs
4. MANUAL: Add number to campaign in TextGrid dashboard (~30 sec)
5. Contractor is live

---

## Current Account State

**Phone Numbers:**

| Number | SID | Webhooks | Campaign |
|--------|-----|----------|----------|
| +15042339958 | JJYUdr_1iDnAb~nx2JNomw== | github codespace (old) | Atlas Growth |
| +15044149448 | OwBn1UScmNeHCe9gPezefA== | example.com (test) | Atlas Growth |

**Sub-accounts:** 6 exist (bf, Orleans, Orleans Steel, test1.0, v, Yo) but phone numbers live at master account level.

---

## API Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| List phone numbers | GET | /Accounts/{sid}/IncomingPhoneNumbers.json |
| Buy phone number | POST | /Accounts/{sid}/IncomingPhoneNumbers.json |
| Update phone number | POST | /Accounts/{sid}/IncomingPhoneNumbers/{phoneSid}.json |
| Delete phone number | DELETE | /Accounts/{sid}/IncomingPhoneNumbers/{phoneSid}.json |
| Search available numbers | GET | /Accounts/{sid}/AvailablePhoneNumbers/US/Local.json?areaCode=XXX |
| Send SMS | POST | /Accounts/{sid}/Messages.json |
| Get message | GET | /Accounts/{sid}/Messages/{msgSid}.json |
| List messages | GET | /Accounts/{sid}/Messages.json |
| Get call info | GET | /Accounts/{sid}/Calls/{callSid}.json |

---

## Next.js Webhook Handler Example

```typescript
// app/api/webhooks/sms/[contractorId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { contractorId: string } }
) {
  const formData = await request.formData();

  const from = formData.get('From') as string;
  const to = formData.get('To') as string;
  const body = formData.get('Body') as string;
  const messageSid = formData.get('MessageSid') as string;

  // Find or create contact
  const { data: contact } = await supabase
    .from('contacts')
    .upsert({
      phone: from,
      contractor_id: params.contractorId
    }, {
      onConflict: 'phone,contractor_id'
    })
    .select()
    .single();

  // Store message
  await supabase.from('messages').insert({
    contractor_id: params.contractorId,
    contact_id: contact.id,
    direction: 'inbound',
    channel: 'sms',
    body,
    textgrid_sid: messageSid,
    from_number: from,
    to_number: to,
  });

  // Return empty TwiML (no auto-reply)
  return new NextResponse('<Response />', {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

---

## Supabase Schema (starter)

```sql
-- Contractors (your customers)
create table contractors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text unique not null,
  phone text,
  business_name text,

  -- TextGrid
  textgrid_phone_number text,
  textgrid_phone_sid text,

  -- Stripe
  stripe_customer_id text,
  subscription_status text default 'trialing'
);

-- Contacts (contractor's customers)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  contractor_id uuid references contractors(id) on delete cascade,

  name text,
  phone text not null,
  email text,
  source text, -- 'sms', 'call', 'form', 'import'

  unique(contractor_id, phone)
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  contractor_id uuid references contractors(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,

  direction text not null, -- 'inbound', 'outbound'
  channel text not null, -- 'sms', 'call', 'email'
  body text,
  media_urls jsonb,

  from_number text,
  to_number text,
  textgrid_sid text,

  status text, -- 'queued', 'sent', 'delivered', 'failed'
  delivered_at timestamptz
);

-- Indexes
create index messages_contractor_id_idx on messages(contractor_id);
create index messages_contact_id_idx on messages(contact_id);
create index contacts_contractor_id_idx on contacts(contractor_id);
```
