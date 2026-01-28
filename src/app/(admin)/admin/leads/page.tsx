"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  site: string | null;
  category: string | null;
  subtypes: string | null;
  rating: string | null;
  reviews: string | null;
  reviews_link: string | null;
  photos_count: string | null;
  place_id: string | null;
  facebook: string | null;
  instagram: string | null;
  logo: string | null;
  business_status: string | null;
  verified: string | null;
  email_1: string | null;
  site_slug: string | null;
}

type WebsiteFilter = "all" | "has_website" | "no_website";
type PhotosFilter = "all" | "has_photos" | "no_photos";
type SortField = "name" | "reviews" | "rating" | "photos_count" | "category";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 50;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [sidebarHidden, setSidebarHidden] = useState(true); // Start with sidebar hidden for more room

  // Filters
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [photosFilter, setPhotosFilter] = useState<PhotosFilter>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("reviews");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Toggle sidebar visibility via CSS class on body
  useEffect(() => {
    if (sidebarHidden) {
      document.body.classList.add("sidebar-hidden");
    } else {
      document.body.classList.remove("sidebar-hidden");
    }
    return () => document.body.classList.remove("sidebar-hidden");
  }, [sidebarHidden]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [websiteFilter, photosFilter, minRating, minReviews, stateFilter, categoryFilter, search]);

  const states = useMemo(() => {
    const stateSet = new Set<string>();
    leads.forEach((l) => {
      if (l.state) stateSet.add(l.state);
    });
    return Array.from(stateSet).sort();
  }, [leads]);

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    leads.forEach((l) => {
      if (l.category) catSet.add(l.category);
    });
    return Array.from(catSet).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      if (websiteFilter === "has_website" && (!lead.site || !lead.site.trim())) return false;
      if (websiteFilter === "no_website" && lead.site && lead.site.trim()) return false;

      const photoCount = parseInt(lead.photos_count || "0", 10);
      if (photosFilter === "has_photos" && photoCount === 0) return false;
      if (photosFilter === "no_photos" && photoCount > 0) return false;

      const rating = parseFloat(lead.rating || "0");
      if (rating < minRating) return false;

      const reviews = parseInt(lead.reviews || "0", 10);
      if (reviews < minReviews) return false;

      if (stateFilter !== "all" && lead.state !== stateFilter) return false;
      if (categoryFilter !== "all" && lead.category !== categoryFilter) return false;

      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = lead.name?.toLowerCase().includes(searchLower);
        const cityMatch = lead.city?.toLowerCase().includes(searchLower);
        if (!nameMatch && !cityMatch) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case "name":
          const aName = a.name || "";
          const bName = b.name || "";
          return sortDir === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName);
        case "category":
          const aCat = a.category || "";
          const bCat = b.category || "";
          return sortDir === "asc" ? aCat.localeCompare(bCat) : bCat.localeCompare(aCat);
        case "reviews":
          aVal = parseInt(a.reviews || "0", 10);
          bVal = parseInt(b.reviews || "0", 10);
          break;
        case "rating":
          aVal = parseFloat(a.rating || "0");
          bVal = parseFloat(b.rating || "0");
          break;
        case "photos_count":
          aVal = parseInt(a.photos_count || "0", 10);
          bVal = parseInt(b.photos_count || "0", 10);
          break;
        default:
          return 0;
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [leads, websiteFilter, photosFilter, minRating, minReviews, stateFilter, categoryFilter, search, sortField, sortDir]);

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
  const paginatedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = leads.length;
    const withSite = leads.filter((l) => l.site && l.site.trim()).length;
    const withPhotos = leads.filter((l) => parseInt(l.photos_count || "0", 10) > 0).length;
    return { total, withSite, withPhotos, noSite: total - withSite };
  }, [leads]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectAllOnPage = () => {
    const newSelected = new Set(selected);
    paginatedLeads.forEach((l) => newSelected.add(l.id));
    setSelected(newSelected);
  };

  const deselectAll = () => setSelected(new Set());

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const deleteLeads = async (ids: string[]) => {
    if (ids.length === 0) return;

    const confirmed = confirm(`Archive ${ids.length} lead${ids.length > 1 ? "s" : ""}? They'll be hidden from this view.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
        setSelected(new Set());
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-3 py-2 font-medium text-zinc-600 cursor-pointer hover:text-zinc-900 select-none text-xs"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-amber-500">{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-zinc-500 font-mono text-sm">Loading leads...</div>
      </div>
    );
  }

  return (
    <>
      {/* Full-width style override when sidebar hidden */}
      <style jsx global>{`
        .sidebar-hidden aside {
          display: none !important;
        }
        .sidebar-hidden main {
          margin-left: 0 !important;
        }
      `}</style>

      <div className="p-4 min-h-screen">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarHidden(!sidebarHidden)}
              className="p-2 hover:bg-zinc-200 rounded"
              title={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
            >
              <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Leads</h1>
              <p className="text-zinc-500 text-xs">
                {stats.total.toLocaleString()} leads · {stats.noSite.toLocaleString()} no website · {stats.withPhotos.toLocaleString()} have photos
              </p>
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-3 bg-zinc-900 text-white px-4 py-2">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <button
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                onClick={() => deleteLeads(Array.from(selected))}
                disabled={deleting}
              >
                {deleting ? "Archiving..." : "Archive"}
              </button>
              <button className="text-sm text-zinc-400 hover:text-white" onClick={deselectAll}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-zinc-200 p-3 mb-3 flex flex-wrap gap-3 items-center text-sm">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1.5 border border-zinc-300 text-sm w-40 focus:outline-none focus:border-zinc-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value as WebsiteFilter)}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value="all">Website: All</option>
            <option value="no_website">No website</option>
            <option value="has_website">Has website</option>
          </select>

          <select
            value={photosFilter}
            onChange={(e) => setPhotosFilter(e.target.value as PhotosFilter)}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value="all">Photos: All</option>
            <option value="has_photos">Has photos</option>
            <option value="no_photos">No photos</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value="all">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value={0}>Rating: Any</option>
            <option value={4}>4+</option>
            <option value={4.5}>4.5+</option>
          </select>

          <select
            value={minReviews}
            onChange={(e) => setMinReviews(Number(e.target.value))}
            className="px-2 py-1.5 border border-zinc-300 text-sm bg-white"
          >
            <option value={0}>Reviews: Any</option>
            <option value={50}>50+</option>
            <option value={100}>100+</option>
            <option value={200}>200+</option>
          </select>

          <span className="text-zinc-500 ml-auto">
            {filteredLeads.length.toLocaleString()} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="w-8 px-3 py-2">
                  <input
                    type="checkbox"
                    onChange={(e) => (e.target.checked ? selectAllOnPage() : deselectAll())}
                    checked={paginatedLeads.length > 0 && paginatedLeads.every((l) => selected.has(l.id))}
                    className="rounded border-zinc-300"
                  />
                </th>
                <SortHeader field="name">Business</SortHeader>
                <SortHeader field="category">Category</SortHeader>
                <th className="text-left px-3 py-2 font-medium text-zinc-600 text-xs">Location</th>
                <SortHeader field="rating">Rating</SortHeader>
                <SortHeader field="reviews">Reviews</SortHeader>
                <SortHeader field="photos_count">Photos</SortHeader>
                <th className="text-left px-3 py-2 font-medium text-zinc-600 text-xs">Links</th>
                <th className="text-left px-3 py-2 font-medium text-zinc-600 text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedLeads.map((lead) => {
                const hasWebsite = lead.site && lead.site.trim();
                const photoCount = parseInt(lead.photos_count || "0", 10);
                const rating = parseFloat(lead.rating || "0");
                const reviews = parseInt(lead.reviews || "0", 10);
                const isSelected = selected.has(lead.id);

                return (
                  <tr key={lead.id} className={`hover:bg-zinc-50 ${isSelected ? "bg-amber-50" : ""}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-zinc-300"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-zinc-900 truncate max-w-[180px]">
                        {lead.name || "—"}
                      </div>
                      {lead.phone && (
                        <div className="text-xs text-zinc-400 font-mono">{lead.phone}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 text-xs max-w-[100px] truncate">
                      {lead.category || "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 text-xs whitespace-nowrap">
                      {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.state || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {rating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="text-amber-500">★</span>
                          <span className="font-medium">{rating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-600">
                      {reviews > 0 ? reviews.toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {photoCount > 0 ? (
                        <span className="text-green-600">{photoCount}</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {lead.site_slug && (
                          <a
                            href={`/s/${lead.site_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded font-medium"
                            title="Preview generated site"
                          >
                            Preview
                          </a>
                        )}
                        {lead.reviews_link && (
                          <a
                            href={lead.reviews_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                            title="View on Google"
                          >
                            Google
                          </a>
                        )}
                        {hasWebsite && (
                          <a
                            href={lead.site?.startsWith("http") ? lead.site : `https://${lead.site}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded"
                            title="Their website"
                          >
                            Site
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                        onClick={() => deleteLeads([lead.id])}
                        disabled={deleting}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 border border-zinc-300 disabled:opacity-30 hover:bg-zinc-50"
              >
                First
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-2 py-1 border border-zinc-300 disabled:opacity-30 hover:bg-zinc-50"
              >
                Prev
              </button>
              <span className="px-2 text-zinc-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 border border-zinc-300 disabled:opacity-30 hover:bg-zinc-50"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 border border-zinc-300 disabled:opacity-30 hover:bg-zinc-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
