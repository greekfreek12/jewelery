"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Zap,
  MessageSquare,
  Star,
  TrendingUp,
  Phone,
  Search,
  PhoneCall,
  PhoneOff,
  Globe,
  Clock,
  Building2,
  CreditCard,
  Calendar,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Send,
  User,
  Mail,
  MapPin,
} from "lucide-react";

interface Contractor {
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
}

interface Stats {
  messages: number;
  contacts: number;
  reviewRequests: number;
  conversations: number;
}

interface ActivityEvent {
  id: string;
  event_type: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface Conversation {
  id: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
  contacts: { name: string; phone: string } | null;
}

interface ContractorTabsProps {
  tab: string;
  contractor: Contractor;
  stats: Stats;
  recentActivity: ActivityEvent[];
  recentConversations: Conversation[];
}

export function ContractorTabs({
  tab,
  contractor,
  stats,
  recentActivity,
  recentConversations,
}: ContractorTabsProps) {
  switch (tab) {
    case "overview":
      return <OverviewTab contractor={contractor} stats={stats} recentActivity={recentActivity} recentConversations={recentConversations} />;
    case "settings":
      return <SettingsTab contractor={contractor} />;
    case "phone":
      return <PhoneTab contractor={contractor} recentConversations={recentConversations} />;
    case "billing":
      return <BillingTab contractor={contractor} />;
    case "activity":
      return <ActivityTab recentActivity={recentActivity} />;
    default:
      return <OverviewTab contractor={contractor} stats={stats} recentActivity={recentActivity} recentConversations={recentConversations} />;
  }
}

// ============================================
// OVERVIEW TAB
// ============================================

function OverviewTab({
  contractor,
  stats,
  recentActivity,
  recentConversations,
}: {
  contractor: Contractor;
  stats: Stats;
  recentActivity: ActivityEvent[];
  recentConversations: Conversation[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Account Health */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Account Health
            </h3>
          </div>
          <div className="admin-section-body">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <HealthMetric
                label="Messages Sent"
                value={stats.messages}
                trend={12}
                trendUp
              />
              <HealthMetric
                label="Contacts"
                value={stats.contacts}
                trend={5}
                trendUp
              />
              <HealthMetric
                label="Review Requests"
                value={stats.reviewRequests}
                trend={8}
                trendUp
              />
              <HealthMetric
                label="Conversations"
                value={stats.conversations}
                trend={-2}
                trendUp={false}
              />
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">
              <Building2 className="w-4 h-4 text-amber-500" />
              Business Information
            </h3>
          </div>
          <div className="admin-section-body">
            <div className="grid grid-cols-2 gap-6">
              <InfoItem icon={Mail} label="Email" value={contractor.email} />
              <InfoItem icon={Phone} label="Business Phone" value={contractor.phone_number || "Not assigned"} />
              <InfoItem icon={PhoneCall} label="Forwarding Number" value={contractor.forwarding_number || "Not configured"} />
              <InfoItem icon={Globe} label="Timezone" value={contractor.timezone} />
              <InfoItem icon={Clock} label="Business Hours" value={contractor.business_hours_start ? `${contractor.business_hours_start} - ${contractor.business_hours_end}` : "Not set"} />
              <InfoItem icon={Star} label="Google Review Link" value={contractor.google_review_link ? "Configured" : "Not set"} />
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="admin-section">
          <div className="admin-section-header flex items-center justify-between">
            <h3 className="admin-section-title">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Recent Conversations
            </h3>
            <span className="text-xs text-slate-500">{stats.conversations} total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {conv.contacts?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500 truncate max-w-xs">
                          {conv.last_message_preview || "No messages"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(conv.last_message_at)}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No conversations yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Feature Status */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">
              <Zap className="w-4 h-4 text-amber-500" />
              Features Enabled
            </h3>
          </div>
          <div className="admin-section-body space-y-3">
            <FeatureStatus label="Missed Call Auto-Text" enabled={contractor.feature_missed_call_text} />
            <FeatureStatus label="Review Automation" enabled={contractor.feature_review_automation} />
            <FeatureStatus label="Review Drip" enabled={contractor.feature_review_drip} />
            <FeatureStatus label="AI Responses" enabled={contractor.feature_ai_responses} premium />
            <FeatureStatus label="Campaigns" enabled={contractor.feature_campaigns} premium />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentActivity.slice(0, 8).map((event) => (
              <div key={event.id} className="p-3">
                <p className="text-sm font-medium text-slate-900">
                  {formatEventType(event.event_type)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatRelativeTime(event.created_at)}
                </p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="p-4 text-sm text-slate-500 text-center">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SETTINGS TAB
// ============================================

function SettingsTab({ contractor }: { contractor: Contractor }) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Business Info */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <Building2 className="w-4 h-4 text-amber-500" />
            Business Information
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="label">Business Name</label>
              <input
                type="text"
                className="input"
                defaultValue={contractor.business_name}
              />
            </div>
            <div>
              <label className="label">Email (Auth)</label>
              <input
                type="email"
                className="input bg-slate-50"
                value={contractor.email}
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Timezone</label>
              <select className="input" defaultValue={contractor.timezone}>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="label">Google Review Link</label>
              <input
                type="url"
                className="input"
                defaultValue={contractor.google_review_link || ""}
                placeholder="https://g.page/review/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <Zap className="w-4 h-4 text-amber-500" />
            Feature Toggles
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="space-y-1">
            <FeatureToggleRow
              name="Missed Call Auto-Text"
              description="Automatically send SMS when calls are missed"
              enabled={contractor.feature_missed_call_text}
              onToggle={() => {}}
            />
            <FeatureToggleRow
              name="Review Automation"
              description="Parse ratings and send auto-replies"
              enabled={contractor.feature_review_automation}
              onToggle={() => {}}
            />
            <FeatureToggleRow
              name="Review Drip Reminders"
              description="Send follow-up reminders on Day 3 and Day 7"
              enabled={contractor.feature_review_drip}
              onToggle={() => {}}
            />
            <FeatureToggleRow
              name="AI Responses"
              description="Use AI to generate personalized responses"
              enabled={contractor.feature_ai_responses}
              onToggle={() => {}}
              premium
              locked={!contractor.feature_ai_responses}
            />
            <FeatureToggleRow
              name="Review Campaigns"
              description="Send bulk review requests to contacts"
              enabled={contractor.feature_campaigns}
              onToggle={() => {}}
              premium
              locked={!contractor.feature_campaigns}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <Send className="w-4 h-4 text-amber-500" />
            Notification Preferences
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="space-y-1">
            <FeatureToggleRow
              name="Push Notifications"
              description="Receive browser push notifications for new messages"
              enabled={contractor.notification_push}
              onToggle={() => {}}
            />
            <FeatureToggleRow
              name="Email Notifications"
              description="Receive email digests and alerts"
              enabled={contractor.notification_email}
              onToggle={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Admin Settings */}
      <div className="admin-section border-purple-200">
        <div className="admin-section-header bg-purple-50/50">
          <h3 className="admin-section-title text-purple-900">
            <Lock className="w-4 h-4 text-purple-500" />
            Admin Settings
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="space-y-1">
            <FeatureToggleRow
              name="Admin Access"
              description="Grant this user admin panel access"
              enabled={contractor.is_admin}
              onToggle={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="btn-primary px-8"
          disabled={saving}
          onClick={() => {
            setSaving(true);
            setTimeout(() => setSaving(false), 1000);
          }}
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// PHONE TAB
// ============================================

function PhoneTab({
  contractor,
  recentConversations,
}: {
  contractor: Contractor;
  recentConversations: Conversation[];
}) {
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [areaCode, setAreaCode] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current Phone Number */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <Phone className="w-4 h-4 text-amber-500" />
            Business Phone Number
          </h3>
        </div>
        <div className="admin-section-body">
          {contractor.phone_number ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="phone-display-large">
                  {formatPhone(contractor.phone_number)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  SID: {contractor.phone_sid?.slice(0, 20)}...
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change Number
                </button>
                <button className="btn-secondary btn-sm text-red-600 hover:bg-red-50">
                  <PhoneOff className="w-4 h-4 mr-1" />
                  Release
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">No Phone Number Assigned</h4>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Search for available numbers and provision one for this contractor.
              </p>

              {/* Search Form */}
              <div className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Area code (e.g., 504)"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    maxLength={3}
                  />
                  <button
                    className="btn-accent"
                    onClick={() => {
                      setSearchingNumbers(true);
                      setTimeout(() => setSearchingNumbers(false), 1500);
                    }}
                    disabled={searchingNumbers}
                  >
                    {searchingNumbers ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Numbers
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Forwarding */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <PhoneCall className="w-4 h-4 text-amber-500" />
            Call Forwarding
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="max-w-md">
            <label className="label">Forward Calls To</label>
            <input
              type="tel"
              className="input"
              defaultValue={contractor.forwarding_number || ""}
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-slate-500 mt-2">
              Incoming calls to the business number will be forwarded to this personal number.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="admin-section">
        <div className="admin-section-header flex items-center justify-between">
          <h3 className="admin-section-title">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Recent SMS Conversations
          </h3>
          <button className="text-amber-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentConversations.length > 0 ? (
            recentConversations.map((conv) => (
              <div key={conv.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {conv.contacts?.name || "Unknown"}
                        </p>
                        <span className="text-slate-400 text-sm">
                          {conv.contacts?.phone}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate max-w-md">
                        {conv.last_message_preview || "No messages"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BILLING TAB
// ============================================

function BillingTab({ contractor }: { contractor: Contractor }) {
  const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    active: { color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Active", icon: CheckCircle },
    trialing: { color: "text-blue-600 bg-blue-50 border-blue-200", label: "Trialing", icon: Clock },
    past_due: { color: "text-red-600 bg-red-50 border-red-200", label: "Past Due", icon: AlertTriangle },
    canceled: { color: "text-slate-600 bg-slate-50 border-slate-200", label: "Canceled", icon: XCircle },
  };

  const status = statusConfig[contractor.subscription_status] || statusConfig.canceled;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Subscription Status */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            <CreditCard className="w-4 h-4 text-amber-500" />
            Subscription Status
          </h3>
        </div>
        <div className="admin-section-body">
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${status.color}`}>
                <StatusIcon className="w-5 h-5" />
                <span className="font-semibold">{status.label}</span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-slate-700">
                  <span className="text-slate-500">Plan:</span>{" "}
                  <span className="font-semibold">ContractorGrow Pro</span>
                </p>
                <p className="text-slate-700">
                  <span className="text-slate-500">Price:</span>{" "}
                  <span className="font-semibold">$297/month</span>
                </p>
                {contractor.subscription_status === "trialing" && (
                  <p className="text-slate-700">
                    <span className="text-slate-500">Trial Ends:</span>{" "}
                    <span className="font-semibold text-amber-600">In 14 days</span>
                  </p>
                )}
              </div>
            </div>
            {contractor.stripe_customer_id && (
              <a
                href={`https://dashboard.stripe.com/customers/${contractor.stripe_customer_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Stripe
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Billing Actions */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Billing Actions</h3>
        </div>
        <div className="admin-section-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <button className="btn-secondary justify-start p-4 h-auto flex-col items-start">
              <Calendar className="w-5 h-5 mb-2 text-amber-500" />
              <span className="font-semibold">Extend Trial</span>
              <span className="text-xs text-slate-500">Add 7 more days</span>
            </button>
            <button className="btn-secondary justify-start p-4 h-auto flex-col items-start">
              <RefreshCw className="w-5 h-5 mb-2 text-blue-500" />
              <span className="font-semibold">Sync Status</span>
              <span className="text-xs text-slate-500">Refresh from Stripe</span>
            </button>
            <button className="btn-secondary justify-start p-4 h-auto flex-col items-start text-red-600 hover:bg-red-50">
              <XCircle className="w-5 h-5 mb-2" />
              <span className="font-semibold">Cancel Subscription</span>
              <span className="text-xs text-slate-500">End billing immediately</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Override */}
      <div className="admin-section border-amber-200">
        <div className="admin-section-header bg-amber-50/50">
          <h3 className="admin-section-title text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Manual Override
          </h3>
        </div>
        <div className="admin-section-body">
          <p className="text-sm text-slate-600 mb-4">
            Override the subscription status manually. Use with caution - this does not affect Stripe.
          </p>
          <div className="flex items-center gap-4">
            <select className="input max-w-xs" defaultValue={contractor.subscription_status}>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
            <button className="btn-accent">Update Status</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACTIVITY TAB
// ============================================

function ActivityTab({ recentActivity }: { recentActivity: ActivityEvent[] }) {
  const [filter, setFilter] = useState("all");

  const filteredActivity = filter === "all"
    ? recentActivity
    : recentActivity.filter((e) => e.event_type.includes(filter));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-2">
        {["all", "message", "review", "call"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="admin-section">
        <div className="divide-y divide-slate-100">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((event) => (
              <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">
                      {formatEventType(event.event_type)}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {formatFullTime(event.created_at)}
                    </p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <pre className="mt-2 text-xs bg-slate-50 rounded p-2 overflow-x-auto text-slate-600">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              No activity matching this filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function HealthMetric({
  label,
  value,
  trend,
  trendUp,
}: {
  label: string;
  value: number;
  trend: number;
  trendUp: boolean;
}) {
  return (
    <div className="metric-card">
      <p className="metric-value">{value.toLocaleString()}</p>
      <p className="metric-label">{label}</p>
      <span className={trendUp ? "metric-trend-up" : "metric-trend-down"}>
        {trendUp ? "↑" : "↓"} {Math.abs(trend)}%
      </span>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function FeatureStatus({
  label,
  enabled,
  premium = false,
}: {
  label: string;
  enabled: boolean;
  premium?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">{label}</span>
        {premium && (
          <span className="premium-badge">
            <Zap className="w-3 h-3" />
            PRO
          </span>
        )}
      </div>
      {enabled ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-slate-300" />
      )}
    </div>
  );
}

function FeatureToggleRow({
  name,
  description,
  enabled,
  onToggle,
  premium = false,
  locked = false,
}: {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  premium?: boolean;
  locked?: boolean;
}) {
  return (
    <div className={`feature-row ${locked ? "feature-locked" : ""}`}>
      <div className="feature-info">
        <div className="feature-name">
          {name}
          {premium && (
            <span className="premium-badge">
              <Zap className="w-3 h-3" />
              PRO
            </span>
          )}
          {locked && (
            <span className="lock-badge">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>
        <p className="feature-description">{description}</p>
      </div>
      <div className="feature-controls">
        {!locked && (
          <button
            onClick={onToggle}
            className={`toggle ${enabled ? "toggle-on" : "toggle-off"}`}
          >
            <span
              className={`toggle-knob ${enabled ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
        )}
        <button className="p-1.5 rounded hover:bg-slate-100 transition-colors">
          {locked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : (
            <Unlock className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

function formatFullTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
    phone_provisioned: "Phone number provisioned",
  };

  return labels[type] || type.replace(/_/g, " ");
}

function getEventIcon(type: string) {
  if (type.includes("message")) return <MessageSquare className="w-5 h-5 text-blue-500" />;
  if (type.includes("review")) return <Star className="w-5 h-5 text-amber-500" />;
  if (type.includes("call") || type.includes("phone")) return <Phone className="w-5 h-5 text-emerald-500" />;
  if (type.includes("contact")) return <User className="w-5 h-5 text-purple-500" />;
  return <Zap className="w-5 h-5 text-slate-500" />;
}
