"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface AnalyticsViewProps {
  initialStats: {
    totalMessages: number;
    totalContacts: number;
    reviewRequests: number;
    reviewsGenerated: number;
  };
}

interface AnalyticsData {
  summary: {
    totalMessages: number;
    inboundMessages: number;
    outboundMessages: number;
    reviewRequestsSent: number;
    reviewsReceived: number;
    positiveReplies: number;
    newContacts: number;
    conversionRate: number;
  };
  chartData: { date: string; messages: number; reviews: number }[];
}

export function AnalyticsView({ initialStats }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<7 | 14 | 30>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?days=${period}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track your business performance</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 14 | 30)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === days
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Messages"
          value={data?.summary.totalMessages ?? initialStats.totalMessages}
          icon={MessageSquare}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Total Contacts"
          value={initialStats.totalContacts}
          icon={Users}
          color="slate"
          loading={false}
        />
        <StatCard
          label="Review Requests"
          value={data?.summary.reviewRequestsSent ?? initialStats.reviewRequests}
          icon={Star}
          color="amber"
          loading={loading}
        />
        <StatCard
          label="Reviews Generated"
          value={data?.summary.reviewsReceived ?? initialStats.reviewsGenerated}
          icon={Star}
          color="emerald"
          highlight
          loading={loading}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Messages Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Messages</h2>
              <p className="text-sm text-slate-500">Last {period} days</p>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Inbound</span>
                <span className="font-semibold text-slate-900">
                  {data?.summary.inboundMessages || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Outbound</span>
                <span className="font-semibold text-slate-900">
                  {data?.summary.outboundMessages || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600">Total</span>
                <span className="font-bold text-lg text-slate-900">
                  {data?.summary.totalMessages || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Reviews</h2>
              <p className="text-sm text-slate-500">Last {period} days</p>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Requests Sent</span>
                <span className="font-semibold text-slate-900">
                  {data?.summary.reviewRequestsSent || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Positive Replies</span>
                <span className="font-semibold text-emerald-600">
                  {data?.summary.positiveReplies || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Reviews Generated</span>
                <span className="font-semibold text-amber-600">
                  {data?.summary.reviewsReceived || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600">Conversion Rate</span>
                <span className="font-bold text-lg text-slate-900">
                  {data?.summary.conversionRate || 0}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Activity Over Time</h2>
            <p className="text-sm text-slate-500">Messages and review requests per day</p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
          </div>
        ) : data?.chartData ? (
          <SimpleBarChart data={data.chartData} />
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            No activity data available
          </div>
        )}
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
  loading = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className={`card p-6 ${highlight ? "ring-2 ring-emerald-500/20" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-16"></div>
        </div>
      ) : (
        <p className={`text-2xl font-bold ${highlight ? "text-emerald-600" : "text-slate-900"}`}>
          {value.toLocaleString()}
        </p>
      )}
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function SimpleBarChart({ data }: { data: { date: string; messages: number; reviews: number }[] }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.messages, d.reviews)), 1);

  // Show fewer bars on small screens
  const displayData = data.slice(-14); // Show last 14 days

  return (
    <div className="h-48">
      <div className="flex items-end gap-1 h-40">
        {displayData.map((day, i) => {
          const msgHeight = (day.messages / maxValue) * 100;
          const revHeight = (day.reviews / maxValue) * 100;

          return (
            <div key={i} className="flex-1 flex gap-px" title={day.date}>
              <div
                className="flex-1 bg-blue-400 rounded-t transition-all hover:bg-blue-500"
                style={{ height: `${msgHeight}%` }}
              />
              <div
                className="flex-1 bg-amber-400 rounded-t transition-all hover:bg-amber-500"
                style={{ height: `${revHeight}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded" />
          <span className="text-slate-600">Messages</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-400 rounded" />
          <span className="text-slate-600">Reviews</span>
        </div>
      </div>
    </div>
  );
}
