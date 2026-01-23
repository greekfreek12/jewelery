"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Loader2,
  Users,
  Send,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  reply_count: number;
  review_count: number;
  rate_limit_per_hour: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface ReviewRequest {
  id: string;
  status: string;
  rating: number | null;
  sent_at: string;
  replied_at: string | null;
  contact: { id: string; name: string; phone: string } | null;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data.campaign);
        setRequests(data.requests);
      } else {
        router.push("/reviews");
      }
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
      router.push("/reviews");
    }
    setLoading(false);
  }, [campaignId, router]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  useEffect(() => {
    // Refresh every 30 seconds if campaign is sending
    if (campaign?.status !== "sending") return;

    const interval = setInterval(() => {
      fetchCampaign();
    }, 30000);
    return () => clearInterval(interval);
  }, [campaign?.status, fetchCampaign]);

  const handleAction = async (action: "start" | "pause") => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reviews/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        await fetchCampaign();
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reviews/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/reviews");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!campaign) return null;

  const progress =
    campaign.total_contacts > 0
      ? Math.round((campaign.sent_count / campaign.total_contacts) * 100)
      : 0;

  return (
    <div className="animate-slide-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-slate-500 mt-1">
              Created {formatDate(campaign.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" || campaign.status === "paused" ? (
              <button
                onClick={() => handleAction("start")}
                disabled={actionLoading}
                className="btn-accent"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {campaign.status === "draft" ? "Start Campaign" : "Resume"}
              </button>
            ) : campaign.status === "sending" ? (
              <button
                onClick={() => handleAction("pause")}
                disabled={actionLoading}
                className="btn-secondary"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Pause className="w-4 h-4 mr-2" />
                )}
                Pause
              </button>
            ) : null}
            {campaign.status !== "sending" && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-ghost text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar (if sending) */}
      {campaign.status === "sending" && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-500">
              {campaign.sent_count} / {campaign.total_contacts} sent
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Sending at {campaign.rate_limit_per_hour} messages per hour
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Contacts"
          value={campaign.total_contacts}
          icon={Users}
        />
        <StatCard label="Sent" value={campaign.sent_count} icon={Send} />
        <StatCard
          label="Replies"
          value={campaign.reply_count}
          icon={MessageSquare}
        />
        <StatCard
          label="Reviews"
          value={campaign.review_count}
          icon={Star}
          highlight
        />
      </div>

      {/* Requests List */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Review Requests</h2>
        </div>
        {requests.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {requests.map((request) => (
              <div key={request.id} className="p-4 flex items-center gap-4">
                <div className="avatar">
                  {request.contact?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">
                    {request.contact?.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {request.contact?.phone}
                  </p>
                </div>
                <div className="text-right">
                  <RequestStatusBadge
                    status={request.status}
                    rating={request.rating}
                  />
                  {request.rating && (
                    <div className="flex items-center gap-0.5 justify-end mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3 h-3",
                            star <= request.rating!
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">
              {campaign.status === "draft"
                ? "Start the campaign to begin sending"
                : "No requests sent yet"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete Campaign
                </h3>
                <p className="text-slate-600 mt-1">
                  Are you sure you want to delete &quot;{campaign.name}&quot;? This cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className={cn("stat-card", highlight && "ring-2 ring-emerald-500/20")}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      </div>
      <p
        className={cn(
          "text-2xl font-bold",
          highlight ? "text-emerald-600" : "text-slate-900"
        )}
      >
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    case "sending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
          <Loader2 className="w-3 h-3 animate-spin" />
          Sending
        </span>
      );
    case "paused":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
          <Pause className="w-3 h-3" />
          Paused
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          Draft
        </span>
      );
  }
}

function RequestStatusBadge({
  status,
  rating,
}: {
  status: string;
  rating: number | null;
}) {
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
      return <span className="badge-info">Clicked</span>;
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
