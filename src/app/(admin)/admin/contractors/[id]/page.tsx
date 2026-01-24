import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Settings,
  Phone,
  CreditCard,
  Activity,
  ExternalLink,
  Mail,
  Shield,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { ContractorTabs } from "./contractor-tabs";
import { ActionsDropdown } from "./actions-dropdown";

export default async function AdminContractorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;

  // First check if current user is admin
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: currentUser } = await authClient
    .from("contractors")
    .select("is_admin")
    .eq("id", user.id)
    .single() as { data: { is_admin: boolean } | null };

  if (!currentUser?.is_admin) {
    redirect("/dashboard");
  }

  // Use service client to bypass RLS for admin operations
  const supabase = createServiceClient();

  // Get contractor details
  const { data: contractorData, error } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contractorData) {
    redirect("/admin/contractors");
  }

  const contractor = contractorData as {
    id: string;
    business_name: string;
    email: string;
    phone_number: string | null;
    phone_sid: string | null;
    forwarding_number: string | null;
    google_review_link: string | null;
    timezone: string;
    business_hours_start: string | null;
    business_hours_end: string | null;
    stripe_customer_id: string | null;
    subscription_status: string;
    subscription_id: string | null;
    feature_missed_call_text: boolean;
    feature_review_automation: boolean;
    feature_review_drip: boolean;
    feature_ai_responses: boolean;
    feature_campaigns: boolean;
    notification_push: boolean;
    notification_email: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
    templates: Record<string, unknown>;
  };

  // Get stats
  const [messageStats, contactStats, reviewStats, conversationStats] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", id),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", id),
    supabase
      .from("review_requests")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", id),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("contractor_id", id),
  ]);

  const stats = {
    messages: messageStats.count || 0,
    contacts: contactStats.count || 0,
    reviewRequests: reviewStats.count || 0,
    conversations: conversationStats.count || 0,
  };

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("contractor_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get recent conversations
  const { data: recentConversations } = await supabase
    .from("conversations")
    .select("*, contacts(name, phone)")
    .eq("contractor_id", id)
    .order("last_message_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Command Header */}
      <div className="admin-header relative">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Link */}
          <Link
            href="/admin/contractors"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contractors
          </Link>

          {/* Main Header Content */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-3xl font-bold shadow-lg shadow-amber-500/20">
                {contractor.business_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">
                    {contractor.business_name}
                  </h1>
                  <StatusBadge status={contractor.subscription_status} />
                  {contractor.is_admin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Shield className="w-3 h-3" />
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {contractor.email}
                  </span>
                  {contractor.phone_number && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {formatPhone(contractor.phone_number)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-xs mt-2">
                  <span>ID: {contractor.id.slice(0, 8)}...</span>
                  <span>Joined {formatDate(contractor.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Impersonate
              </Link>
              <ActionsDropdown contractor={contractor} />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <QuickStat icon={Users} label="Contacts" value={stats.contacts} />
            <QuickStat icon={MessageSquare} label="Messages" value={stats.messages} />
            <QuickStat icon={Star} label="Review Requests" value={stats.reviewRequests} />
            <QuickStat icon={Activity} label="Conversations" value={stats.conversations} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex -mb-px">
            <TabLink
              href={`/admin/contractors/${id}?tab=overview`}
              active={tab === "overview"}
              icon={LayoutDashboard}
            >
              Overview
            </TabLink>
            <TabLink
              href={`/admin/contractors/${id}?tab=settings`}
              active={tab === "settings"}
              icon={Settings}
            >
              Settings
            </TabLink>
            <TabLink
              href={`/admin/contractors/${id}?tab=phone`}
              active={tab === "phone"}
              icon={Phone}
            >
              Phone & SMS
            </TabLink>
            <TabLink
              href={`/admin/contractors/${id}?tab=billing`}
              active={tab === "billing"}
              icon={CreditCard}
            >
              Billing
            </TabLink>
            <TabLink
              href={`/admin/contractors/${id}?tab=activity`}
              active={tab === "activity"}
              icon={Activity}
            >
              Activity
            </TabLink>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ContractorTabs
          tab={tab}
          contractor={contractor}
          stats={stats}
          recentActivity={recentActivity || []}
          recentConversations={recentConversations || []}
        />
      </div>
    </div>
  );
}

function TabLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors
        ${active
          ? "text-slate-900"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        }
      `}
    >
      <Icon className={`w-4 h-4 ${active ? "text-amber-500" : "opacity-60"}`} />
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
      )}
    </Link>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-amber-400" />
        <div>
          <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    active: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
      label: "Active",
    },
    trialing: {
      bg: "bg-blue-500/20",
      text: "text-blue-300",
      dot: "bg-blue-400",
      label: "Trialing",
    },
    past_due: {
      bg: "bg-red-500/20",
      text: "text-red-300",
      dot: "bg-red-400 animate-pulse",
      label: "Past Due",
    },
    canceled: {
      bg: "bg-slate-500/20",
      text: "text-slate-300",
      dot: "bg-slate-400",
      label: "Canceled",
    },
  };

  const { bg, text, dot, label } = config[status] || config.canceled;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
