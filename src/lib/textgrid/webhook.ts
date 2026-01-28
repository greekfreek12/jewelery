import crypto from "crypto";

/**
 * Verify TextGrid webhook signature
 * TextGrid sends X-TextGrid-Signature header (HMAC-SHA1)
 */
export function verifyWebhookSignature(
  webhookUrl: string,
  requestBody: string,
  signature: string,
  webhookSecret: string = process.env.TEXTGRID_WEBHOOK_SECRET!
): boolean {
  const stringToSign = webhookUrl + requestBody;
  const computed = crypto
    .createHmac("sha1", webhookSecret)
    .update(stringToSign)
    .digest("base64");
  return computed === signature;
}

/**
 * Parse incoming SMS webhook data
 */
export interface IncomingSmsWebhook {
  AccountSid: string;
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  SmsStatus: string;
}

export function parseFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    let val = value.toString();
    // Fix phone numbers - if it starts with a space, it was a + that got URL-decoded wrong
    if ((key === "From" || key === "To") && val.startsWith(" ")) {
      val = "+" + val.trim();
    }
    result[key] = val;
  });
  return result;
}

export function normalizePhoneNumber(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed;
}

export function getWebhookBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";
  if (!baseUrl) return "";
  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
}

/**
 * Parse incoming voice call webhook data
 */
export interface IncomingCallWebhook {
  CallSid: string;
  AccountSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  ForwardedFrom?: string;
  CallerName?: string;
}

/**
 * Parse SMS status callback data
 */
export interface SmsStatusWebhook {
  SmsSid: string;
  MessageSid: string;
  MessageStatus: "queued" | "sent" | "delivered" | "undelivered" | "failed";
  ErrorCode?: string;
  ErrorMessage?: string;
}

/**
 * Generate empty TwiML response (no auto-reply)
 */
export function emptyTwiml(): string {
  return '<?xml version="1.0" encoding="UTF-8"?><Response />';
}

/**
 * Generate SMS auto-reply TwiML
 */
export function smsReplyTwiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
}

/**
 * Generate call forwarding TwiML
 * @param forwardingNumber - The number to forward calls to (contractor's cell)
 * @param callerId - The original caller's number (so contractor sees who's calling)
 * @param timeout - How long to ring before giving up
 * @param statusCallbackUrl - ABSOLUTE URL for TextGrid to call after dial completes
 */
export function forwardCallTwiml(
  forwardingNumber: string,
  callerId?: string,
  timeout: number = 30,
  statusCallbackUrl?: string,
  numberUrl?: string
): string {
  const callerIdAttr = callerId ? ` callerId="${callerId}"` : "";
  const actionAttr = statusCallbackUrl
    ? ` action="${statusCallbackUrl}" method="POST"`
    : "";
  // Add statusCallback on the Number noun to get granular dial leg events
  // This should fire separate callbacks for: initiated, ringing, answered, completed
  const numberStatusCallback = statusCallbackUrl
    ? ` statusCallback="${statusCallbackUrl}" statusCallbackEvent="initiated ringing answered completed" statusCallbackMethod="POST"`
    : "";
  const numberUrlAttr = numberUrl ? ` url="${numberUrl}"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial${callerIdAttr} timeout="${timeout}"${actionAttr}>
    <Number${numberStatusCallback}${numberUrlAttr}>${forwardingNumber}</Number>
  </Dial>
</Response>`;
}

/**
 * Generate voicemail TwiML
 * @param businessName - Name to say in the greeting
 * @param recordingCallbackUrl - ABSOLUTE URL for recording callback
 */
export function voicemailTwiml(businessName: string, recordingCallbackUrl?: string): string {
  const actionAttr = recordingCallbackUrl ? ` action="${recordingCallbackUrl}"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You've reached ${escapeXml(businessName)}. We're sorry we missed your call. Please leave a message after the beep, or we'll text you back shortly.</Say>
  <Record maxLength="120"${actionAttr} />
</Response>`;
}

/**
 * Generate missed call hangup TwiML
 */
export function missedCallTwiml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're unable to take your call right now. We'll text you back shortly.</Say>
  <Hangup />
</Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
