/**
 * TextGrid API Client
 * TextGrid uses a Twilio-compatible REST API
 * Docs: https://textgrid.com/docs
 */

const TEXTGRID_API_URL = "https://api.textgrid.com/2010-04-01";

interface TextGridConfig {
  accountSid: string;
  authToken: string;
}

function getConfig(): TextGridConfig {
  const accountSid = process.env.TEXTGRID_ACCOUNT_SID;
  const authToken = process.env.TEXTGRID_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("TextGrid credentials not configured");
  }

  return { accountSid, authToken };
}

function getAuthHeader(config: TextGridConfig): string {
  // TextGrid uses Bearer token with Base64 encoded AccountSid:AuthToken
  const credentials = Buffer.from(
    `${config.accountSid}:${config.authToken}`
  ).toString("base64");
  return `Bearer ${credentials}`;
}

// Search for available phone numbers
export async function searchAvailableNumbers(areaCode?: string): Promise<{
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
}[]> {
  const config = getConfig();
  const params = new URLSearchParams({
    VoiceEnabled: "true",
    SmsEnabled: "true",
    ...(areaCode && { AreaCode: areaCode }),
  });

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/AvailablePhoneNumbers/US/Local.json?${params}`,
    {
      headers: {
        Authorization: getAuthHeader(config),
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid search error:", error);
    throw new Error("Failed to search phone numbers");
  }

  const data = await response.json();
  return data.available_phone_numbers?.map((num: Record<string, string>) => ({
    phoneNumber: num.phone_number,
    friendlyName: num.friendly_name,
    locality: num.locality,
    region: num.region,
  })) || [];
}

// Purchase a phone number (generic)
export async function purchasePhoneNumber(
  phoneNumber: string,
  webhookBaseUrl: string
): Promise<{ sid: string; phoneNumber: string }> {
  const config = getConfig();

  const body = new URLSearchParams({
    PhoneNumber: phoneNumber,
    VoiceUrl: `${webhookBaseUrl}/api/textgrid/voice`,
    VoiceMethod: "POST",
    SmsUrl: `${webhookBaseUrl}/api/textgrid/sms`,
    SmsMethod: "POST",
    StatusCallback: `${webhookBaseUrl}/api/textgrid/status`,
    StatusCallbackMethod: "POST",
  });

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/IncomingPhoneNumbers.json`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(config),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid purchase error:", error);
    throw new Error("Failed to purchase phone number");
  }

  const data = await response.json();
  return {
    sid: data.sid,
    phoneNumber: data.phone_number,
  };
}

// Purchase a phone number with contractor-specific webhooks
export async function purchasePhoneNumberForContractor(
  phoneNumber: string,
  contractorId: string,
  webhookBaseUrl: string
): Promise<{ sid: string; phoneNumber: string }> {
  const config = getConfig();

  // Contractor-specific webhook URLs for proper routing
  const body = new URLSearchParams({
    PhoneNumber: phoneNumber,
    VoiceUrl: `${webhookBaseUrl}/api/textgrid/voice/${contractorId}`,
    VoiceMethod: "POST",
    SmsUrl: `${webhookBaseUrl}/api/textgrid/sms/${contractorId}`,
    SmsMethod: "POST",
    StatusCallback: `${webhookBaseUrl}/api/textgrid/status/${contractorId}`,
    StatusCallbackMethod: "POST",
  });

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/IncomingPhoneNumbers.json`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(config),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid purchase error:", error);
    throw new Error("Failed to purchase phone number");
  }

  const data = await response.json();
  return {
    sid: data.sid,
    phoneNumber: data.phone_number,
  };
}

// Send an SMS message
export async function sendSms(
  from: string,
  to: string,
  body: string,
  statusCallback?: string
): Promise<{ sid: string; status: string }> {
  const config = getConfig();

  const payload: Record<string, string> = {
    from,
    to,
    body,
  };
  if (statusCallback) {
    payload.statusCallback = statusCallback;
  }

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid SMS error:", error);
    throw new Error("Failed to send SMS");
  }

  const data = await response.json();
  return {
    sid: data.sid,
    status: data.status,
  };
}

// Update phone number webhooks
export async function updatePhoneNumberWebhooks(
  phoneSid: string,
  webhookBaseUrl: string
): Promise<void> {
  const config = getConfig();

  const body = new URLSearchParams({
    VoiceUrl: `${webhookBaseUrl}/api/textgrid/voice`,
    VoiceMethod: "POST",
    SmsUrl: `${webhookBaseUrl}/api/textgrid/sms`,
    SmsMethod: "POST",
    StatusCallback: `${webhookBaseUrl}/api/textgrid/status`,
    StatusCallbackMethod: "POST",
  });

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/IncomingPhoneNumbers/${phoneSid}.json`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(config),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid update error:", error);
    throw new Error("Failed to update phone number webhooks");
  }
}

// Release a phone number
export async function releasePhoneNumber(phoneSid: string): Promise<void> {
  const config = getConfig();

  const response = await fetch(
    `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/IncomingPhoneNumbers/${phoneSid}.json`,
    {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(config),
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("TextGrid release error:", error);
    throw new Error("Failed to release phone number");
  }
}

// Generate TwiML for call forwarding
export function generateForwardingTwiml(
  forwardingNumber: string,
  callerId: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}" timeout="30" action="/api/textgrid/voice/status">
    <Number>${forwardingNumber}</Number>
  </Dial>
</Response>`;
}

// Generate TwiML for voicemail / missed call
export function generateVoicemailTwiml(businessName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You've reached ${businessName}. We're sorry we missed your call. Please leave a message after the beep, or we'll text you back shortly.</Say>
  <Record maxLength="120" action="/api/textgrid/voice/recording" />
</Response>`;
}

// Generate TwiML for busy/no answer
export function generateMissedCallTwiml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're unable to take your call right now. We'll text you back shortly.</Say>
  <Hangup />
</Response>`;
}
