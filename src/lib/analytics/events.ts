import { createClient } from "@/lib/supabase/server";

// Event types that get logged
export type EventType =
  | "login"
  | "message_sent"
  | "message_received"
  | "call_inbound"
  | "call_missed"
  | "call_forwarded"
  | "review_request_sent"
  | "review_reply"
  | "review_positive"
  | "review_clicked"
  | "review_completed"
  | "review_negative"
  | "contact_created"
  | "contact_imported"
  | "settings_changed"
  | "template_edited"
  | "feature_toggled"
  | "blast_started";

interface LogEventParams {
  contractorId: string;
  eventType: EventType;
  metadata?: Record<string, unknown>;
}

/**
 * Log an analytics event for a contractor
 */
export async function logEvent({
  contractorId,
  eventType,
  metadata = {},
}: LogEventParams): Promise<void> {
  try {
    const supabase = await createClient();
    const eventsTable = supabase.from("analytics_events");
    // @ts-expect-error - Supabase types not generated for analytics_events table
    await eventsTable.insert({
      contractor_id: contractorId,
      event_type: eventType,
      metadata,
    });
  } catch (error) {
    // Don't throw - analytics should never break the main flow
    console.error("Failed to log analytics event:", error);
  }
}

/**
 * Get event counts for a contractor over a time period
 */
export async function getEventCounts(
  contractorId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data: rawData } = await supabase
    .from("analytics_events")
    .select("event_type")
    .eq("contractor_id", contractorId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  const data = (rawData || []) as { event_type: string }[];

  const counts: Record<string, number> = {};
  for (const event of data) {
    counts[event.event_type] = (counts[event.event_type] || 0) + 1;
  }

  return counts;
}

/**
 * Get daily event counts for charting
 */
export async function getDailyEventCounts(
  contractorId: string,
  eventType: EventType,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: rawData } = await supabase
    .from("analytics_events")
    .select("created_at")
    .eq("contractor_id", contractorId)
    .eq("event_type", eventType)
    .gte("created_at", startDate.toISOString());

  const data = (rawData || []) as { created_at: string }[];

  // Group by date
  const dailyCounts: Record<string, number> = {};
  for (const event of data) {
    const date = new Date(event.created_at).toISOString().split("T")[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  }

  // Fill in missing dates with 0
  const result: { date: string; count: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, count: dailyCounts[dateStr] || 0 });
  }

  return result;
}
