/**
 * Review template utilities
 * Handles variable substitution in review messages
 */

export interface TemplateVariables {
  business_name: string;
  contact_name: string;
  review_link?: string;
}

/**
 * Replace template variables in a message
 * Supported: {{business_name}}, {{contact_name}}, {{review_link}}
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template
    .replace(/\{\{business_name\}\}/g, variables.business_name || "")
    .replace(/\{\{contact_name\}\}/g, variables.contact_name || "")
    .replace(/\{\{review_link\}\}/g, variables.review_link || "");
}

/**
 * Parse a rating from an SMS message
 * Returns the rating (1-5) or null if no valid rating found
 */
export function parseRatingFromMessage(message: string): number | null {
  // Clean the message
  const cleaned = message.trim().toLowerCase();

  // Check for just a number 1-5
  if (/^[1-5]$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  // Check for "X stars", "X/5", "rated X", etc.
  const patterns = [
    /^([1-5])\s*(star|stars|\/5)?$/i,
    /^rated?\s*([1-5])$/i,
    /^([1-5])\s*out\s*of\s*5$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Check if message starts with a rating number
  const startsWithNumber = cleaned.match(/^([1-5])\b/);
  if (startsWithNumber) {
    return parseInt(startsWithNumber[1], 10);
  }

  return null;
}

/**
 * Default templates (matches database defaults)
 */
export const DEFAULT_TEMPLATES = {
  review_request: {
    message: "Hey {{contact_name}}, thanks for choosing {{business_name}}! How'd we do? Reply 1-5",
  },
  review_positive: {
    message: "Awesome, thank you! Would you mind leaving us a quick Google review? {{review_link}}",
  },
  review_negative: {
    message: "We're sorry to hear that. Someone will reach out to make it right.",
  },
  review_reminder_1: {
    delay_days: 3,
    message: "Hey {{contact_name}}, just checking in! We'd love to hear how your experience was with {{business_name}}. Reply 1-5 when you get a chance.",
  },
  review_reminder_2: {
    delay_days: 7,
    message: "Hi {{contact_name}}, last reminder - would you take 30 seconds to rate your experience with {{business_name}}? Reply 1-5. Thanks!",
  },
  review_blast: {
    message: "Hey {{contact_name}}, hope all is well! We're collecting feedback from customers - would you mind rating your experience with {{business_name}}? Reply 1-5",
  },
};
