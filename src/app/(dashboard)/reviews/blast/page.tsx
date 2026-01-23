"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Tag,
  Loader2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Filter,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_TAGS = ["lead", "customer", "past customer", "VIP", "referral"];

export default function ReviewBlastPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excludeReviewed, setExcludeReviewed] = useState(true);
  const [excludePending, setExcludePending] = useState(true);
  const [rateLimitPerHour, setRateLimitPerHour] = useState(20);

  // Fetch estimate when filters change
  useEffect(() => {
    const fetchEstimate = async () => {
      setLoadingEstimate(true);
      try {
        const response = await fetch("/api/reviews/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactFilter: {
              tags: selectedTags,
              excludeReviewed,
              excludePending,
            },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setEstimatedCount(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch estimate:", err);
      }
      setLoadingEstimate(false);
    };

    fetchEstimate();
  }, [selectedTags, excludeReviewed, excludePending]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Campaign name is required");
      return;
    }

    if (estimatedCount === 0) {
      setError("No contacts match the selected criteria");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contactFilter: {
            tags: selectedTags,
            excludeReviewed,
            excludePending,
          },
          rateLimitPerHour,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/reviews/campaigns/${data.campaign.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create campaign");
      }
    } catch (err) {
      setError("Failed to create campaign");
    }
    setCreating(false);
  };

  const estimatedHours =
    estimatedCount && rateLimitPerHour
      ? Math.ceil(estimatedCount / rateLimitPerHour)
      : 0;

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Review Blast</h1>
        <p className="text-slate-500 mt-1">
          Send review requests to multiple contacts at once.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="label">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., January 2026 Review Blast"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <label className="label flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              Filter by Tags
              <span className="text-slate-400 text-xs font-normal">
                (leave empty for all contacts)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedTags.includes(tag)
                      ? "bg-amber-100 text-amber-800 ring-2 ring-amber-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-3">
            <label className="label flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Exclusions
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeReviewed}
                onChange={(e) => setExcludeReviewed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-700">
                Skip contacts who have already left a review
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={excludePending}
                onChange={(e) => setExcludePending(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-700">
                Skip contacts with pending review requests
              </span>
            </label>
          </div>

          {/* Rate Limit */}
          <div>
            <label className="label flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Send Rate
            </label>
            <select
              value={rateLimitPerHour}
              onChange={(e) => setRateLimitPerHour(Number(e.target.value))}
              className="input"
            >
              <option value={10}>10 messages per hour (slow)</option>
              <option value={20}>20 messages per hour (recommended)</option>
              <option value={30}>30 messages per hour (faster)</option>
              <option value={50}>50 messages per hour (fast)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Slower rates help avoid carrier spam filters
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Campaign Preview</h3>
            {loadingEstimate ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            ) : (
              <span className="text-sm text-slate-500">
                {estimatedCount !== null
                  ? `${estimatedCount} contacts`
                  : "Calculating..."}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <p className="text-slate-500">Contacts</p>
              <p className="text-xl font-bold text-slate-900">
                {estimatedCount ?? "-"}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <p className="text-slate-500">Est. Duration</p>
              <p className="text-xl font-bold text-slate-900">
                {estimatedHours > 0
                  ? `~${estimatedHours} hour${estimatedHours > 1 ? "s" : ""}`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link href="/reviews" className="btn-secondary justify-center">
            Cancel
          </Link>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || estimatedCount === 0}
            className="btn-accent justify-center"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">How Review Blasts Work</h4>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Messages are sent gradually based on the rate limit</li>
              <li>• Each contact receives automated follow-up reminders</li>
              <li>• Positive responses automatically receive your Google review link</li>
              <li>• You can pause or stop the campaign at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
