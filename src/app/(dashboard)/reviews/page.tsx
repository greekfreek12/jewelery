import { createClient } from "@/lib/supabase/server";
import { ReviewsView } from "@/components/reviews/reviews-view";

interface ReviewRequest {
  id: string;
  status: string;
  rating: number | null;
  drip_step: number;
  sent_at: string;
  replied_at: string | null;
  clicked_at: string | null;
  reviewed_at: string | null;
  contact: { id: string; name: string; phone: string } | null;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  reply_count: number;
  review_count: number;
  created_at: string;
}

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get review requests with contact info
  const { data: reviewRequestsData } = await supabase
    .from("review_requests")
    .select(`
      *,
      contact:contacts(id, name, phone)
    `)
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  const reviewRequests = (reviewRequestsData || []) as ReviewRequest[];

  // Get campaigns
  const { data: campaignsData } = await supabase
    .from("review_campaigns")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  const campaigns = (campaignsData || []) as Campaign[];

  // Calculate stats
  const stats = {
    totalSent: reviewRequests.length,
    replied: reviewRequests.filter((r) => r.status === "replied" || r.rating).length,
    positive: reviewRequests.filter((r) => r.rating && r.rating >= 4).length,
    reviewed: reviewRequests.filter((r) => r.status === "reviewed").length,
  };

  return (
    <ReviewsView
      reviewRequests={reviewRequests}
      campaigns={campaigns}
      stats={stats}
    />
  );
}
