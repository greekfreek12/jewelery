import { createClient } from "@/lib/supabase/server";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get quick stats
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id)
    .gte("created_at", thirtyDaysAgo);

  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id);

  const { count: reviewRequests } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id)
    .gte("created_at", thirtyDaysAgo);

  const { count: reviewsGenerated } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id)
    .eq("status", "reviewed")
    .gte("created_at", thirtyDaysAgo);

  return (
    <AnalyticsView
      initialStats={{
        totalMessages: totalMessages || 0,
        totalContacts: totalContacts || 0,
        reviewRequests: reviewRequests || 0,
        reviewsGenerated: reviewsGenerated || 0,
      }}
    />
  );
}
