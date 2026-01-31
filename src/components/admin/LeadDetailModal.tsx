"use client";

import { useState, useEffect, useCallback } from "react";

interface LeadDetail {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  rating: string | null;
  reviews: string | null;
  reviews_link: string | null;
  place_id: string | null;
  logo: string | null;
  photo: string | null;
  google_photos: string[] | null;
  google_reviews: Array<{
    author: string;
    rating: number;
    text: string;
    date?: string;
    relativeDate?: string;
  }> | null;
  site_data: {
    id: string;
    slug: string;
    status: string;
    config: any;
  } | null;
}

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
}

export default function LeadDetailModal({ leadId, onClose }: LeadDetailModalProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "reviews">("photos");

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      const data = await res.json();
      setLead(data);
    } catch (err) {
      console.error("Failed to fetch lead:", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId, fetchLead]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!leadId) return null;

  // Collect all photos: logo first, then main photo, then google_photos
  const allPhotos: Array<{ url: string; label: string; id: string }> = [];
  if (lead?.logo) {
    allPhotos.push({ url: lead.logo, label: "Logo", id: "logo" });
  }
  if (lead?.photo) {
    allPhotos.push({ url: lead.photo, label: "Main Photo", id: "main" });
  }
  if (lead?.google_photos) {
    lead.google_photos.forEach((url, i) => {
      allPhotos.push({ url, label: `Photo ${i + 1}`, id: `photo-${i}` });
    });
  }

  const reviews = lead?.google_reviews || [];
  const rating = parseFloat(lead?.rating || "0");
  const reviewCount = parseInt(lead?.reviews || "0", 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl my-8 mx-4 bg-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTop: "4px solid #f59e0b",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-6 w-64 bg-zinc-200 animate-pulse" />
                  <div className="h-4 w-40 bg-zinc-100 animate-pulse" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-zinc-900 truncate">
                    {lead?.name || "Unknown Business"}
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                    {lead?.city && lead?.state && (
                      <span>{lead.city}, {lead.state}</span>
                    )}
                    {rating > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-amber-500">★</span>
                        <span className="font-semibold text-zinc-700">{rating.toFixed(1)}</span>
                        <span className="text-zinc-400">({reviewCount.toLocaleString()})</span>
                      </span>
                    )}
                    {lead?.category && (
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium">
                        {lead.category}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-4">
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "photos"
                  ? "border-amber-500 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Photos {allPhotos.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-zinc-100 rounded">
                  {allPhotos.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-amber-500 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Reviews {reviews.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-zinc-100 rounded">
                  {reviews.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : activeTab === "photos" ? (
            /* Photos Tab */
            allPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square bg-zinc-100 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Label */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                        photo.label === "Logo"
                          ? "bg-amber-500 text-zinc-900"
                          : photo.label === "Main Photo"
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-900/80 text-white"
                      }`}>
                        {photo.label === "Logo" || photo.label === "Main Photo" ? photo.label : `#${index - (lead?.logo ? 1 : 0) - (lead?.photo ? 1 : 0) + 1}`}
                      </span>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={() => copyToClipboard(photo.url, photo.id)}
                      className={`absolute bottom-2 right-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        copiedId === photo.id
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-zinc-900 opacity-0 group-hover:opacity-100 hover:bg-amber-500"
                      }`}
                    >
                      {copiedId === photo.id ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </span>
                      ) : (
                        "Copy URL"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-zinc-500 font-medium">No photos available</p>
                <p className="text-zinc-400 text-sm mt-1">This lead hasn&apos;t been scraped yet</p>
              </div>
            )
          ) : (
            /* Reviews Tab */
            reviews.length > 0 ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="group relative border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Author and rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-zinc-900">{review.author || "Anonymous"}</span>
                          <span className="inline-flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < review.rating ? "text-amber-500" : "text-zinc-200"}`}
                              >
                                ★
                              </span>
                            ))}
                          </span>
                          {review.relativeDate && (
                            <span className="text-xs text-zinc-400">{review.relativeDate}</span>
                          )}
                        </div>

                        {/* Review text */}
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {review.text || <span className="text-zinc-400 italic">No review text</span>}
                        </p>
                      </div>

                      {/* Copy button */}
                      {review.text && (
                        <button
                          onClick={() => copyToClipboard(
                            `"${review.text}" — ${review.author}`,
                            `review-${index}`
                          )}
                          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold transition-all ${
                            copiedId === `review-${index}`
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-100 text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-amber-500 hover:text-zinc-900"
                          }`}
                        >
                          {copiedId === `review-${index}` ? (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied
                            </span>
                          ) : (
                            "Copy"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-zinc-500 font-medium">No reviews available</p>
                <p className="text-zinc-400 text-sm mt-1">This lead hasn&apos;t been scraped yet</p>
              </div>
            )
          )}
        </div>

        {/* Footer with site link */}
        {lead?.site_data && (
          <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Site: <span className="font-mono text-zinc-700">/s/{lead.site_data.slug}</span>
            </span>
            <a
              href={`/s/${lead.site_data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-semibold bg-amber-500 text-zinc-900 hover:bg-amber-400 transition-colors"
            >
              Preview Site →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
