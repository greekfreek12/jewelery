import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  Settings,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { ContractorEditForm } from "./contractor-edit-form";

export default async function AdminContractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

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
    forwarding_number: string | null;
    google_review_link: string | null;
    timezone: string;
    stripe_customer_id: string | null;
    subscription_status: string;
    feature_missed_call_text: boolean;
    feature_review_automation: boolean;
    feature_review_drip: boolean;
    feature_ai_responses: boolean;
    feature_campaigns: boolean;
    is_admin: boolean;
    created_at: string;
    templates: Record<string, unknown>;
  };

  // Get stats
  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", id);

  const { count: contactCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", id);

  const { count: reviewRequestCount } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", id);

  const { count: reviewCount } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", id)
    .eq("status", "reviewed");

  // Get recent activity
  const { data: recentEventsData } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("contractor_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const recentEvents = (recentEventsData || []) as {
    id: string;
    event_type: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/contractors"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contractors
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-2xl font-bold">
              {contractor.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {contractor.business_name}
              </h1>
              <p className="text-slate-500">{contractor.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={contractor.subscription_status} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Contacts" value={contactCount || 0} icon={Building2} />
        <StatCard label="Messages" value={messageCount || 0} icon={MessageSquare} />
        <StatCard label="Review Requests" value={reviewRequestCount || 0} icon={Star} />
        <StatCard
          label="Reviews Generated"
          value={reviewCount || 0}
          icon={Star}
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Account Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Email" value={contractor.email} icon={Mail} />
              <InfoRow
                label="Phone Number"
                value={contractor.phone_number || "Not assigned"}
                icon={Phone}
              />
              <InfoRow
                label="Forwarding"
                value={contractor.forwarding_number || "Not set"}
                icon={Phone}
              />
              <InfoRow
                label="Created"
                value={formatDate(contractor.created_at)}
                icon={Calendar}
              />
              <InfoRow
                label="Stripe Customer"
                value={contractor.stripe_customer_id || "None"}
                icon={CreditCard}
              />
              <InfoRow
                label="Timezone"
                value={contractor.timezone}
                icon={Settings}
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Feature Toggles
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <FeatureToggle
                label="Missed Call Auto-Text"
                enabled={contractor.feature_missed_call_text}
              />
              <FeatureToggle
                label="Review Automation"
                enabled={contractor.feature_review_automation}
              />
              <FeatureToggle
                label="Review Drip"
                enabled={contractor.feature_review_drip}
              />
              <FeatureToggle
                label="AI Responses"
                enabled={contractor.feature_ai_responses}
              />
              <FeatureToggle
                label="Campaigns"
                enabled={contractor.feature_campaigns}
              />
              <FeatureToggle label="Is Admin" enabled={contractor.is_admin} />
            </div>
          </div>

          {/* Edit Form */}
          <ContractorEditForm contractor={contractor} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            <a
              href={`/dashboard?impersonate=${contractor.id}`}
              className="btn-secondary w-full justify-start"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View as Contractor
            </a>
            {contractor.stripe_customer_id && (
              <a
                href={`https://dashboard.stripe.com/customers/${contractor.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-start"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View in Stripe
              </a>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {recentEvents?.map((event) => (
                <div key={event.id} className="p-3">
                  <p className="text-sm font-medium text-slate-900">
                    {formatEventType(event.event_type)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(event.created_at)}
                  </p>
                </div>
              ))}
              {!recentEvents?.length && (
                <div className="p-4 text-sm text-slate-500 text-center">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-red-900">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Actions here cannot be undone. Be careful.
            </p>
            <button className="btn-secondary w-full text-red-600 hover:bg-red-100">
              Suspend Account
            </button>
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
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? "ring-2 ring-emerald-500/20" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className={`text-xl font-bold ${highlight ? "text-emerald-600" : "text-slate-900"}`}>
            {value}
          </p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-all">{value}</p>
      </div>
    </div>
  );
}

function FeatureToggle({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`w-2 h-2 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
      />
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
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || styles.canceled
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    login: "Logged in",
    message_sent: "Sent message",
    message_received: "Received message",
    review_request_sent: "Sent review request",
    review_positive: "Positive review reply",
    review_negative: "Negative review reply",
    review_reply: "Review reply received",
    contact_created: "Created contact",
    settings_changed: "Updated settings",
    template_edited: "Edited template",
    blast_started: "Started review blast",
  };

  return labels[type] || type.replace(/_/g, " ");
}
