"use client";

import { useState } from "react";
import {
  Star,
  Send,
  Plus,
  TrendingUp,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ReviewRequest {
  id: string;
  status: string;
  rating: number | null;
  drip_step: number;
  sent_at: string;
  replied_at: string | null;
  clicked_at: string | null;
  reviewed_at: string | null;
  contact: Contact | null;
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

interface ReviewsViewProps {
  reviewRequests: ReviewRequest[];
  campaigns: Campaign[];
  stats: {
    totalSent: number;
    replied: number;
    positive: number;
    reviewed: number;
  };
}

export function ReviewsView({ reviewRequests, campaigns, stats }: ReviewsViewProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "campaigns">("requests");

  const conversionRate = stats.totalSent > 0
    ? Math.round((stats.reviewed / stats.totalSent) * 100)
    : 0;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Collect and manage customer reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reviews/blast" className="btn-secondary">
            <Users className="w-4 h-4 mr-2" />
            Review Blast
          </Link>
          <Link href="/reviews/new" className="btn-accent">
            <Zap className="w-4 h-4 mr-2" />
            Send Request
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Requests Sent"
          value={stats.totalSent}
          icon={Send}
          color="slate"
        />
        <StatCard
          label="Replies Received"
          value={stats.replied}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          label="Positive (4-5)"
          value={stats.positive}
          icon={Star}
          color="amber"
        />
        <StatCard
          label="Google Reviews"
          value={stats.reviewed}
          icon={CheckCircle}
          color="emerald"
          highlight
        />
      </div>

      {/* Conversion Funnel */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-900">Review Funnel</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">{conversionRate}%</span>
            <span className="text-sm text-slate-500">conversion</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FunnelStep
            label="Sent"
            value={stats.totalSent}
            percentage={100}
            color="slate"
          />
          <div className="w-4 h-0.5 bg-slate-200" />
          <FunnelStep
            label="Replied"
            value={stats.replied}
            percentage={stats.totalSent > 0 ? (stats.replied / stats.totalSent) * 100 : 0}
            color="blue"
          />
          <div className="w-4 h-0.5 bg-slate-200" />
          <FunnelStep
            label="Positive"
            value={stats.positive}
            percentage={stats.totalSent > 0 ? (stats.positive / stats.totalSent) * 100 : 0}
            color="amber"
          />
          <div className="w-4 h-0.5 bg-slate-200" />
          <FunnelStep
            label="Reviewed"
            value={stats.reviewed}
            percentage={stats.totalSent > 0 ? (stats.reviewed / stats.totalSent) * 100 : 0}
            color="emerald"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("requests")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === "requests"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Individual Requests
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === "campaigns"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Campaigns
        </button>
      </div>

      {/* Content */}
      {activeTab === "requests" ? (
        <div className="card overflow-hidden">
          {reviewRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reviewRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      {request.contact?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 truncate">
                          {request.contact?.name || "Unknown"}
                        </h3>
                        <StatusBadge status={request.status} rating={request.rating} />
                      </div>
                      <p className="text-sm text-slate-500">{request.contact?.phone}</p>
                    </div>
                    <div className="text-right">
                      {request.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= request.rating!
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200"
                              )}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        {formatDate(request.sent_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-16">
              <Star className="empty-state-icon" />
              <p className="empty-state-title">No review requests yet</p>
              <p className="empty-state-text">
                Send your first review request to start collecting feedback.
              </p>
              <Link href="/reviews/new" className="btn-accent mt-4">
                <Zap className="w-4 h-4 mr-2" />
                Send Request
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {campaigns.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/reviews/campaigns/${campaign.id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Contacts</p>
                      <p className="font-semibold text-slate-900">{campaign.total_contacts}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Sent</p>
                      <p className="font-semibold text-slate-900">{campaign.sent_count}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Replies</p>
                      <p className="font-semibold text-slate-900">{campaign.reply_count}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Reviews</p>
                      <p className="font-semibold text-emerald-600">{campaign.review_count}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state py-16">
              <BarChart3 className="empty-state-icon" />
              <p className="empty-state-title">No campaigns yet</p>
              <p className="empty-state-text">
                Create a review blast to send requests to multiple contacts at once.
              </p>
              <Link href="/reviews/blast" className="btn-accent mt-4">
                <Users className="w-4 h-4 mr-2" />
                Create Campaign
              </Link>
            </div>
          )}
        </div>
      )}
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
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("stat-card", highlight && "ring-2 ring-emerald-500/20")}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
      <p className={cn("text-2xl font-bold", highlight ? "text-emerald-600" : "text-slate-900")}>
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="flex-1 text-center">
      <div
        className={`h-2 rounded-full bg-${color}-500 mb-2`}
        style={{ opacity: Math.max(0.2, percentage / 100) }}
      />
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status, rating }: { status: string; rating: number | null }) {
  if (rating && rating >= 4) {
    return <span className="badge-success">Positive</span>;
  }
  if (rating && rating < 4) {
    return <span className="badge-danger">Needs Follow-up</span>;
  }

  switch (status) {
    case "reviewed":
      return <span className="badge-success">Reviewed</span>;
    case "clicked":
      return <span className="badge-info">Clicked Link</span>;
    case "replied":
      return <span className="badge-info">Replied</span>;
    case "reminded_1":
    case "reminded_2":
      return <span className="badge-warning">Reminded</span>;
    case "stopped":
      return <span className="badge-danger">Stopped</span>;
    default:
      return <span className="badge-info">Sent</span>;
  }
}

function CampaignStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <span className="badge-success">Completed</span>;
    case "sending":
      return <span className="badge-warning">Sending</span>;
    case "paused":
      return <span className="badge-info">Paused</span>;
    default:
      return <span className="badge-info">Draft</span>;
  }
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
