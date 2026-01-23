import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

// Configure web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:support@contractorgrow.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

/**
 * Send push notification to a contractor
 */
export async function sendPushNotification(
  contractorId: string,
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured, skipping push notification");
    return { success: 0, failed: 0 };
  }

  const supabase = await createClient();

  // Get all subscriptions for this contractor
  const { data: subsData } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("contractor_id", contractorId);

  const subscriptions = (subsData || []) as { endpoint: string; p256dh: string; auth: string }[];

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
      success++;
    } catch (error: unknown) {
      failed++;
      // Remove invalid subscriptions (expired or unsubscribed)
      const webPushError = error as { statusCode?: number };
      if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return { success, failed };
}

/**
 * Send notification for new message
 */
export async function notifyNewMessage(
  contractorId: string,
  senderName: string,
  preview: string
): Promise<void> {
  await sendPushNotification(contractorId, {
    title: `New message from ${senderName}`,
    body: preview.length > 100 ? preview.slice(0, 97) + "..." : preview,
    url: "/inbox",
    tag: "new-message",
    actions: [
      { action: "open", title: "Reply" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
}

/**
 * Send notification for missed call
 */
export async function notifyMissedCall(
  contractorId: string,
  callerPhone: string
): Promise<void> {
  await sendPushNotification(contractorId, {
    title: "Missed Call",
    body: `You missed a call from ${callerPhone}`,
    url: "/inbox",
    tag: "missed-call",
  });
}

/**
 * Send notification for review response
 */
export async function notifyReviewResponse(
  contractorId: string,
  contactName: string,
  rating: number
): Promise<void> {
  const isPositive = rating >= 4;
  await sendPushNotification(contractorId, {
    title: isPositive ? "Great Review Response!" : "Review Response",
    body: `${contactName} rated you ${rating}/5`,
    url: "/reviews",
    tag: "review-response",
  });
}
