import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all events for the period
    const { data: eventsData } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .eq("contractor_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    const events = (eventsData || []) as { event_type: string; created_at: string }[];

    // Count by event type
    const eventCounts: Record<string, number> = {};
    const dailyData: Record<string, Record<string, number>> = {};

    for (const event of events) {
      const eventType = event.event_type;
      eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;

      const date = new Date(event.created_at).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {};
      }
      dailyData[date][eventType] = (dailyData[date][eventType] || 0) + 1;
    }

    // Get message counts (more detailed)
    const { count: totalMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .gte("created_at", startDate.toISOString());

    const { count: inboundMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .eq("direction", "inbound")
      .gte("created_at", startDate.toISOString());

    const { count: outboundMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .eq("direction", "outbound")
      .gte("created_at", startDate.toISOString());

    // Get review stats
    const { count: reviewRequestsSent } = await supabase
      .from("review_requests")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .gte("created_at", startDate.toISOString());

    const { count: reviewsReceived } = await supabase
      .from("review_requests")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .eq("status", "reviewed")
      .gte("created_at", startDate.toISOString());

    const { count: positiveReplies } = await supabase
      .from("review_requests")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .in("status", ["clicked", "reviewed"])
      .gte("rating", 4)
      .gte("created_at", startDate.toISOString());

    // Get contact stats
    const { count: newContacts } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", user.id)
      .gte("created_at", startDate.toISOString());

    // Build daily chart data
    const chartData: { date: string; messages: number; reviews: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      chartData.push({
        date: dateStr,
        messages: (dailyData[dateStr]?.message_sent || 0) + (dailyData[dateStr]?.message_received || 0),
        reviews: dailyData[dateStr]?.review_request_sent || 0,
      });
    }

    return NextResponse.json({
      summary: {
        totalMessages: totalMessages || 0,
        inboundMessages: inboundMessages || 0,
        outboundMessages: outboundMessages || 0,
        reviewRequestsSent: reviewRequestsSent || 0,
        reviewsReceived: reviewsReceived || 0,
        positiveReplies: positiveReplies || 0,
        newContacts: newContacts || 0,
        conversionRate: reviewRequestsSent
          ? Math.round(((reviewsReceived || 0) / reviewRequestsSent) * 100)
          : 0,
      },
      eventCounts,
      chartData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
