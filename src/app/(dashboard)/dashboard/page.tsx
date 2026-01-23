import { createClient } from "@/lib/supabase/server";
import type { Contractor } from "@/types/database";
import {
  MessageSquare,
  Users,
  Star,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get contractor data
  const { data: contractorData } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!contractorData) return null;

  const contractor = contractorData as unknown as Contractor;

  // Get stats
  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user.id);

  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user.id);

  const { count: unreadCount } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id)
    .gt("unread_count", 0);

  const { count: totalReviews } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("contractor_id", user!.id)
    .eq("status", "reviewed");

  // Get recent conversations
  const { data: recentConversationsData } = await supabase
    .from("conversations")
    .select(`
      *,
      contact:contacts(name, phone)
    `)
    .eq("contractor_id", user.id)
    .order("last_message_at", { ascending: false })
    .limit(5);

  interface RecentConversation {
    id: string;
    unread_count: number;
    last_message_at: string | null;
    last_message_preview: string | null;
    contact: { name: string; phone: string } | null;
  }

  const recentConversations = (recentConversationsData || []) as RecentConversation[];

  const stats = [
    {
      name: "Unread Messages",
      value: unreadCount || 0,
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      href: "/inbox",
      color: "amber",
    },
    {
      name: "Total Contacts",
      value: totalContacts || 0,
      change: "+8%",
      trend: "up",
      icon: Users,
      href: "/contacts",
      color: "slate",
    },
    {
      name: "Reviews Collected",
      value: totalReviews || 0,
      change: "+24%",
      trend: "up",
      icon: Star,
      href: "/reviews",
      color: "emerald",
    },
    {
      name: "Conversations",
      value: totalConversations || 0,
      change: "+5%",
      trend: "up",
      icon: Phone,
      href: "/inbox",
      color: "blue",
    },
  ];

  const quickActions = [
    { name: "Send Review Request", icon: Star, href: "/reviews/new" },
    { name: "Add New Contact", icon: Users, href: "/contacts/new" },
    { name: "View Inbox", icon: MessageSquare, href: "/inbox" },
  ];

  return (
    <div className="animate-stagger">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">
            Welcome back, {contractor?.business_name?.split(" ")[0] || "there"}
          </h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reviews/new" className="btn-accent">
            <Zap className="w-4 h-4 mr-2" />
            Send Review Request
          </Link>
        </div>
      </div>

      {/* Setup Checklist - show if missing key items */}
      {(!contractor?.phone_number || !contractor?.google_review_link) && (
        <div className="card p-5 mb-6 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Complete Your Setup</h3>
              <p className="text-sm text-slate-600 mt-1">
                Finish setting up your account to start collecting reviews.
              </p>
              <div className="mt-4 space-y-2">
                <SetupItem
                  completed={!!contractor?.phone_number}
                  label="Phone number assigned"
                />
                <SetupItem
                  completed={!!contractor?.google_review_link}
                  label="Google review link added"
                />
                <SetupItem
                  completed={!!contractor?.forwarding_number}
                  label="Call forwarding configured"
                />
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 mt-4"
              >
                Go to Settings
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                stat.trend === "up" ? "text-emerald-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.name}</p>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
              <Link
                href="/inbox"
                className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentConversations && recentConversations.length > 0 ? (
              recentConversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/inbox/${conversation.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="avatar">
                    {conversation.contact?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {conversation.contact?.name || "Unknown"}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="unread-dot" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {conversation.last_message_preview || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {conversation.last_message_at
                      ? formatRelativeTime(conversation.last_message_at)
                      : ""}
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state py-12">
                <MessageSquare className="empty-state-icon" />
                <p className="empty-state-title">No conversations yet</p>
                <p className="empty-state-text">
                  Conversations will appear here when customers reach out.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <action.icon className="w-5 h-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Review Stats Summary */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Review Performance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Requests Sent</span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Reviews Received</span>
                <span className="font-semibold text-emerald-600">{totalReviews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Conversion Rate</span>
                <span className="font-semibold text-slate-900">--%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupItem({ completed, label }: { completed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle className="w-4 h-4 text-emerald-500" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
      )}
      <span className={`text-sm ${completed ? "text-slate-500 line-through" : "text-slate-700"}`}>
        {label}
      </span>
    </div>
  );
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
