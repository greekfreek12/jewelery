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
    result[key] = value.toString();
  });
  return result;
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
 */
export function forwardCallTwiml(
  forwardingNumber: string,
  callerId?: string,
  timeout: number = 30
): string {
  const callerIdAttr = callerId ? ` callerId="${callerId}"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial${callerIdAttr} timeout="${timeout}" action="/api/textgrid/voice/status">
    <Number>${forwardingNumber}</Number>
  </Dial>
</Response>`;
}

/**
 * Generate voicemail TwiML
 */
export function voicemailTwiml(businessName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">You've reached ${escapeXml(businessName)}. We're sorry we missed your call. Please leave a message after the beep, or we'll text you back shortly.</Say>
  <Record maxLength="120" action="/api/textgrid/voice/recording" />
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
