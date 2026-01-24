# TextGrid Breeze API

## General Notes

1. All POST requests must be formatted as JSON
2. The API returns responses in JSON
3. Base API URL: `https://api.textgrid.com/2010-04-01`

## Authentication

Pass in the `Authorization` header as a Bearer token: `{AccountSid}:{AuthToken}` encoded in Base64

```javascript
const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64');
const headers = {
  'Authorization': `Bearer ${auth}`,
  'Content-Type': 'application/json'
};
```

---

## Sending SMS

```
POST /Accounts/{accountSid}/Messages.json
Content-Type: application/json
```

### Request Body

```json
{
  "body": "Message text",
  "from": "+15044149448",
  "to": "+12055005170",
  "statusCallback": "https://yourapp.com/webhook",
  "mediaUrl": ["https://example.com/image.jpg"]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| body | Yes | SMS/MMS body (max 2048 chars) |
| from | Yes | From number in E.164 format |
| to | Yes | To number in E.164 format |
| statusCallback | No | URL for delivery status updates |
| mediaUrl | No | Array of media URLs (makes it MMS) |

### Response

```json
{
  "body": "Message text",
  "direction": "outbound-api",
  "from": "+15044149448",
  "to": "+12055005170",
  "status": "queued",
  "sid": "SMxxxxxxxx",
  "date_sent": "Sun, 21 Aug 2022 15:45:15 +0000"
}
```

### Notes

- If mediaUrl is included, message is sent as MMS
- Max MMS file size: 525 KB total
- Max 10 media files per MMS

---

## Retrieving Messages

### Get Single Message

```
GET /Accounts/{accountSid}/Messages/{messageSid}.json
```

### List All Messages

```
GET /Accounts/{accountSid}/Messages.json
```

Query params: `Page`, `PageSize`, `To`, `From`, `DateSent`

---

## Phone Numbers

### Search Available Numbers

```
GET /Accounts/{accountSid}/AvailablePhoneNumbers/US/Local.json?areaCode=504
```

Query params: `inPostalCode`, `inRegion`, `areaCode`, `contains`, `inLata`, `inRateCenter`

### Purchase Number

```
POST /Accounts/{accountSid}/IncomingPhoneNumbers.json
Content-Type: application/x-www-form-urlencoded

phoneNumber=+15044149448
friendlyName=My Number
voiceUrl=https://yourapp.com/voice
smsUrl=https://yourapp.com/sms
statusCallback=https://yourapp.com/status
```

### Update Number Webhooks

```
POST /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}.json
Content-Type: application/x-www-form-urlencoded

voiceUrl=https://yourapp.com/voice
smsUrl=https://yourapp.com/sms
```

### Delete Number

```
DELETE /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}.json
```

### List Numbers

```
GET /Accounts/{accountSid}/IncomingPhoneNumbers.json
```

---

## Voice Calls

### Get Call Info

```
GET /Accounts/{accountSid}/Calls/{callSid}.json
```

### List Calls

```
GET /Accounts/{accountSid}/Calls.json
```

Query params: `Page`, `PageSize`, `To`, `From`, `StartTime`, `EndTime`, `Status`, `ParentCallSid`

---

## Webhooks

### Incoming SMS Webhook

TextGrid POSTs to your `smsUrl` with `application/x-www-form-urlencoded`:

```
AccountSid=xxx
MessageSid=SMxxx
From=+12055005170
To=+15044149448
Body=Hello
NumMedia=0
SmsStatus=received
```

**Response** (TwiML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for your message!</Message>
</Response>
```

Or empty response:
```xml
<Response />
```

### Incoming Voice Call Webhook

TextGrid POSTs to your `voiceUrl`:

```
CallSid=CAxxx
AccountSid=xxx
From=+12055005170
To=+15044149448
CallStatus=ringing
Direction=inbound
```

**Response** (TwiML):

```xml
<Response>
  <Say voice="alice">Thanks for calling.</Say>
  <Dial>+15551234567</Dial>
</Response>
```

### SMS Status Callback

Called when delivery status changes:

```
SmsSid=SMxxx
MessageSid=SMxxx
MessageStatus=delivered
SmsStatus=delivered
SmsStatusDetail=...
```

Statuses: `delivered`, `undelivered`

### Call Status Callback

Called when call ends:

```
CallSid=CAxxx
CallDuration=135
CallStatus=completed
Direction=inbound
```

Statuses: `completed`, `busy`, `no-answer`, `failed`

---

## Webhook Signature Verification

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

## User Opt In/Out

### Opt User In/Out

```
GET /optin/{endUserNumber}/{in|out}/{senderNumber}
```

### Check Opt Status

```
GET /optin/status/{endUserNumber}/{senderNumber}/{method}
```

Method: `phone`, `api`, or omit for both

### End-user Keywords

- **Opt out**: STOP, QUIT, END, UNSUBSCRIBE
- **Opt in**: START, YES, UNSTOP
- **Help**: HELP

---

## Auto Forward (Calls)

### Set Forward

```
POST /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}/forward.json
Content-Type: application/json

{
  "forwardEnabled": true,
  "forwardTo": "+15551234567",
  "forwardRecord": false
}
```

### Get Forward Settings

```
GET /Accounts/{accountSid}/IncomingPhoneNumbers/{phoneNumberSid}/forward.json
```

---

## Lookup API

Base URL: `https://lookups.textgrid.com/v1`

### Phone Number Lookup

```
GET /PhoneNumbers/{phoneNumber}?Type=carrier&Type=caller-name
```

Response includes: `carrier.name`, `carrier.type` (landline/mobile/voip), `caller_name`

---

## API Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Send SMS | POST | /Accounts/{sid}/Messages.json |
| Get message | GET | /Accounts/{sid}/Messages/{msgSid}.json |
| List messages | GET | /Accounts/{sid}/Messages.json |
| Buy number | POST | /Accounts/{sid}/IncomingPhoneNumbers.json |
| Update number | POST | /Accounts/{sid}/IncomingPhoneNumbers/{phoneSid}.json |
| Delete number | DELETE | /Accounts/{sid}/IncomingPhoneNumbers/{phoneSid}.json |
| List numbers | GET | /Accounts/{sid}/IncomingPhoneNumbers.json |
| Search numbers | GET | /Accounts/{sid}/AvailablePhoneNumbers/US/Local.json |
| Get call | GET | /Accounts/{sid}/Calls/{callSid}.json |
| List calls | GET | /Accounts/{sid}/Calls.json |
