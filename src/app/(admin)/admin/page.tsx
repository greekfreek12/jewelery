import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Phone,
  DollarSign,
  MessageSquare,
  Star,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get contractor stats
  const { count: totalContractors } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true });

  const { count: activeSubscriptions } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active");

  const { count: trialingContractors } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "trialing");

  const { count: pastDueContractors } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "past_due");

  // Get message stats (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo);

  const { count: totalReviewRequests } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo);

  const { count: totalReviews } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "reviewed")
    .gte("created_at", thirtyDaysAgo);

  // Get recently active contractors
  const { data: recentContractorsData } = await supabase
    .from("contractors")
    .select("id, business_name, email, subscription_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentContractors = (recentContractorsData || []) as {
    id: string;
    business_name: string;
    email: string;
    subscription_status: string;
    created_at: string;
  }[];

  // Get contractors with issues
  const { data: problemContractorsData } = await supabase
    .from("contractors")
    .select("id, business_name, email, subscription_status")
    .eq("subscription_status", "past_due")
    .limit(5);

  const problemContractors = (problemContractorsData || []) as {
    id: string;
    business_name: string;
    email: string;
    subscription_status: string;
  }[];

  const mrr = (activeSubscriptions || 0) * 297;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contractors"
          value={totalContractors || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active Subscriptions"
          value={activeSubscriptions || 0}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          label="MRR"
          value={`$${mrr.toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
          highlight
        />
        <StatCard
          label="Trialing"
          value={trialingContractors || 0}
          icon={Users}
          color="slate"
        />
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalMessages || 0}</p>
              <p className="text-sm text-slate-500">Messages (30 days)</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalReviewRequests || 0}</p>
              <p className="text-sm text-slate-500">Review Requests (30 days)</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalReviews || 0}</p>
              <p className="text-sm text-slate-500">Reviews Generated (30 days)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contractors */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Contractors</h2>
            <Link href="/admin/contractors" className="text-sm text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentContractors?.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/admin/contractors/${contractor.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{contractor.business_name}</p>
                    <p className="text-sm text-slate-500">{contractor.email}</p>
                  </div>
                  <StatusBadge status={contractor.subscription_status} />
                </div>
              </Link>
            ))}
            {!recentContractors?.length && (
              <div className="p-8 text-center text-slate-500">No contractors yet</div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Needs Attention</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {problemContractors?.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/admin/contractors/${contractor.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{contractor.business_name}</p>
                    <p className="text-sm text-slate-500">{contractor.email}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    Past Due
                  </span>
                </div>
              </Link>
            ))}
            {!problemContractors?.length && (
              <div className="p-8 text-center text-slate-500">
                <span className="text-emerald-600">All clear!</span> No issues to address.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  highlight = false,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className={`card p-6 ${highlight ? "ring-2 ring-amber-500/20" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-amber-600" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-slate-100 text-slate-700",
  };

  const labels: Record<string, string> = {
    active: "Active",
    trialing: "Trialing",
    past_due: "Past Due",
    canceled: "Canceled",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || styles.canceled}`}>
      {labels[status] || status}
    </span>
  );
}
