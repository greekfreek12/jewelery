# TextGrid Missed Call Text-Back Investigation

**Date:** January 24, 2026
**Status:** PARTIALLY WORKING - Needs Code Fix
**Priority:** High

---

## Executive Summary

~~The missed call text-back feature is not working as expected.~~

**UPDATE:** The feature now sends SMS, but there's a critical bug - it sends texts on ALL calls, including answered ones. The root cause is a **parameter name mismatch**: TextGrid sends `CallStatus`/`CallDuration` but our code expects `DialCallStatus`/`DialCallDuration`.

---

## What We Discovered

### Finding 1: The Webhook IS Being Called ✅

TextGrid DOES call the status callback endpoint. We confirmed this via database logs showing `call_status_callback` events with full payload data.

### Finding 2: Wrong Parameter Names ❌

TextGrid sends **different parameter names** than Twilio's `<Dial action>` callback:

| Expected (Twilio-style) | Actual (TextGrid sends) |
|------------------------|------------------------|
| `DialCallStatus` | `CallStatus` |
| `DialCallDuration` | `CallDuration` |
| `DialCallSid` | `CallSid` |

Our code at `status/route.ts:29-30`:
```typescript
const dialCallStatus = data.DialCallStatus;     // undefined!
const dialCallDuration = data.DialCallDuration; // undefined → 0
```

### Finding 3: The 401 Error ✅ FIXED

TextGrid env vars were missing from Vercel Preview/Development environments. After syncing `TEXTGRID_ACCOUNT_SID`, `TEXTGRID_AUTH_TOKEN`, and `TEXTGRID_WEBHOOK_SECRET` to all Vercel environments, SMS sending works.

### Finding 4: SMS Sends But Logic Is Wrong ⚠️

Test results show:
```
call_status_callback: CallStatus: completed, CallDuration: 40
call_missed: recorded  ← WRONG! This was a 40-second answered call
missed_call_text_sent: ✓  ← Sent text to someone who answered!
```

---

## The Bug

The current code treats ALL calls as missed because the detection logic uses undefined variables:

```typescript
// status/route.ts lines 36-55

// This condition is always FALSE (dialCallStatus is undefined)
if (dialCallStatus === "completed" && dialCallDuration > voicemailThresholdSeconds) {
  // Real answer - never reaches here!
  return emptyTwiml();
}

// Falls through to missed call handling for EVERY call
```

---

## The Fix

Update `status/route.ts` to use TextGrid's actual parameter names:

```typescript
// BEFORE (broken)
const dialCallStatus = data.DialCallStatus;
const dialCallDuration = parseInt(data.DialCallDuration || "0", 10);

// AFTER (fixed) - Check both Twilio-style and TextGrid-style params
const dialCallStatus = data.DialCallStatus || data.CallStatus;
const dialCallDuration = parseInt(data.DialCallDuration || data.CallDuration || "0", 10);
```

This makes the code work with both Twilio (if you switch later) and TextGrid (current).

---

## Go High Level Research

### Key Finding: GHL Uses TextGrid for SMS Only

From [TextGrid's GHL page](https://textgrid.com/ghl/):
- Focuses exclusively on "Save 50% of Your SMS Costs!"
- Highlights SMS API and MMS API only
- **No mention of voice, calls, or missed call detection**

GHL's architecture:
1. **Voice/Calls** → LC Phone (built on Twilio) - handles call detection
2. **SMS** → Can use TextGrid as cheaper alternative

**Conclusion:** GHL's missed call text-back works because they use Twilio for voice detection, not TextGrid.

---

## Options Going Forward

### Option 1: Fix Parameter Names (Quick Win) ← RECOMMENDED FIRST

Just update the code to read TextGrid's parameter names. This may be enough if TextGrid's `CallStatus` accurately reflects whether the call was answered.

**Risk:** TextGrid's `CallStatus` might be for the PARENT call, not the dial leg. Need to test if a forwarded-but-unanswered call shows `CallStatus: no-answer` or `CallStatus: completed`.

### Option 2: Press-1 to Accept (Most Reliable)

If Option 1 doesn't work reliably, implement whisper:

```xml
<Dial>
  <Number url="/api/textgrid/voice/whisper">+1234567890</Number>
</Dial>
```

The whisper URL plays "Press 1 to accept this call":
- Press 1 → Human answered → Don't send text
- No digit → Voicemail → Send text

**Pros:** 100% reliable detection
**Cons:** Contractor hears "press 1" on every call

### Option 3: Switch to Twilio for Voice

Use Twilio for voice (proper callbacks), keep TextGrid for SMS (cheaper).

**Pros:** Everything works as designed
**Cons:** Two providers, more complexity, slightly higher voice costs

### Option 4: Contact TextGrid Support

Ask them:
> "We're using TwiML `<Dial action='...'>` to receive status callbacks. The callback receives `CallStatus`/`CallDuration` instead of `DialCallStatus`/`DialCallDuration`. Is the `CallStatus` value for the parent call or the dialed leg? What's the recommended way to detect if a forwarded call was answered vs went to voicemail?"

---

## Environment Variables (Verified Working)

These are now synced to all Vercel environments:

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `TEXTGRID_ACCOUNT_SID` | ✅ | ✅ | ✅ |
| `TEXTGRID_AUTH_TOKEN` | ✅ | ✅ | ✅ |
| `TEXTGRID_WEBHOOK_SECRET` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | ✅ |

---

## Next Steps

1. [x] ~~Diagnose if webhook is being called~~ → YES, it is
2. [x] ~~Fix 401 error~~ → Synced env vars
3. [x] ~~Fix parameter name mismatch~~ → Updated code to check both `CallStatus` and `DialCallStatus`
4. [ ] **Deploy and test event-based detection** → Using `statusCallbackEvent` on `<Number>` noun
5. [ ] If detection unreliable → Implement press-1 whisper
6. [ ] Email TextGrid support for clarification

---

## Latest Approach: Event-Based Detection (Jan 24, 2026)

### The Strategy

Instead of relying on final status (`completed` vs `no-answer`), we now use **granular dial leg events**:

1. Added `statusCallbackEvent="initiated ringing answered completed"` to the `<Number>` noun in TwiML
2. TextGrid should now fire separate callbacks for each event:
   - `initiated` - Dial started
   - `ringing` - Destination is ringing
   - `answered` - **Human picked up!** (KEY EVENT)
   - `completed` - Dial finished

3. Detection logic:
   - When `answered` event received → Log it to `analytics_events` as `call_answered_event`
   - On final `completed` event → Check if we logged an `answered` event for this CallSid
   - If `answered` event exists → Human answered → Don't send text
   - If no `answered` event → Missed call → Send text

### Code Changes

**`src/lib/textgrid/webhook.ts`** - Added statusCallbackEvent to Number noun:
```typescript
const numberStatusCallback = statusCallbackUrl
  ? ` statusCallback="${statusCallbackUrl}" statusCallbackEvent="initiated ringing answered completed" statusCallbackMethod="POST"`
  : "";
```

**`src/app/api/textgrid/voice/status/route.ts`** - Event-based detection:
```typescript
// Handle "answered" event - log it
if (dialCallStatus === "answered") {
  await supabase.from("analytics_events").insert({
    event_type: "call_answered_event",
    metadata: { call_sid: callSid, ... }
  });
  return emptyTwiml();
}

// On "completed" - check for prior answered event
const { data: answeredEvent } = await supabase
  .from("analytics_events")
  .select("id")
  .eq("event_type", "call_answered_event")
  .eq("metadata->>call_sid", callSid)
  .single();

if (answeredEvent) {
  // Human answered - don't send text
  return emptyTwiml();
}
```

### Fallback

If TextGrid doesn't send `answered` events, we still have a duration-based fallback with a reduced threshold (12 seconds instead of 25 seconds).

---

## Code References

### Status Callback Handler
`src/app/api/textgrid/voice/status/route.ts:17-231`

### Lines to Fix
`src/app/api/textgrid/voice/status/route.ts:29-30`

```typescript
// Current (broken)
const dialCallStatus = data.DialCallStatus;
const dialCallDuration = parseInt(data.DialCallDuration || "0", 10);

// Fixed
const dialCallStatus = data.DialCallStatus || data.CallStatus;
const dialCallDuration = parseInt(data.DialCallDuration || data.CallDuration || "0", 10);
```

---

## Research Sources

- [TextGrid GHL Integration](https://textgrid.com/ghl/) - SMS only, no voice
- [Go High Level Missed Call Text Back](https://help.gohighlevel.com/support/solutions/articles/48001239140-where-and-how-to-configure-the-missed-call-text-back-feature)
- [LC Phone System](https://help.gohighlevel.com/support/solutions/articles/48001223546-what-is-lc-lead-connector-phone-system-) - GHL's Twilio-based voice
- [Twilio Dial Action Webhooks](https://www.twilio.com/docs/usage/webhooks/voice-webhooks)
- [SignalWire Dial CXML](https://developer.signalwire.com/compatibility-api/cxml/voice/dial/) - Alternative with proper callbacks
