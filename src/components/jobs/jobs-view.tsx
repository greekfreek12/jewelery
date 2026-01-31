"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  ChevronRight,
  Truck,
  Wrench,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job, Contact, JobStatus } from "@/types/database";
import { useRouter } from "next/navigation";
import { JobModal } from "./job-modal";
import { JobCard } from "./job-card";
import { CalendarView } from "./calendar-view";

interface JobWithContact extends Job {
  contacts: Pick<Contact, "id" | "name" | "phone" | "email"> | null;
}

interface JobsViewProps {
  jobs: JobWithContact[];
  contacts: Pick<Contact, "id" | "name" | "phone">[];
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  scheduled: {
    label: "Scheduled",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    icon: Clock,
  },
  en_route: {
    label: "En Route",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Truck,
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Wrench,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
};

type ViewMode = "list" | "calendar";
type FilterStatus = JobStatus | "all" | "active";

export function JobsView({ jobs, contacts }: JobsViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithContact | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    // Status filter
    if (filterStatus === "active") {
      if (job.status === "completed" || job.status === "cancelled") return false;
    } else if (filterStatus !== "all") {
      if (job.status !== filterStatus) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContact = job.contacts?.name?.toLowerCase().includes(query);
      const matchesService = job.service_type?.toLowerCase().includes(query);
      const matchesPhone = job.contacts?.phone?.includes(query);
      if (!matchesContact && !matchesService && !matchesPhone) return false;
    }

    return true;
  });

  // Group jobs by date for list view
  const jobsByDate = filteredJobs.reduce(
    (acc, job) => {
      const date = job.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(job);
      return acc;
    },
    {} as Record<string, JobWithContact[]>
  );

  // Sort dates
  const sortedDates = Object.keys(jobsByDate).sort();

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysJobs = jobs.filter((j) => j.scheduled_date === todayStr);
  const activeJobs = jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled"
  );

  const handleJobCreated = () => {
    setShowNewJobModal(false);
    router.refresh();
  };

  const handleJobUpdated = () => {
    setSelectedJob(null);
    router.refresh();
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">
            {todaysJobs.length} today &middot; {activeJobs.length} active
          </p>
        </div>
        <button onClick={() => setShowNewJobModal(true)} className="btn-accent">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card mb-6">
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <FilterButton
              active={filterStatus === "active"}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </FilterButton>
            <FilterButton
              active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
            >
              All
            </FilterButton>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((status) => (
              <FilterButton
                key={status}
                active={filterStatus === status}
                onClick={() => setFilterStatus(status)}
              >
                {STATUS_CONFIG[status].label}
              </FilterButton>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "calendar"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400 hover:text-slate-600"
              )}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Content */}
      {viewMode === "list" ? (
        <div className="space-y-6">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold",
                      date === todayStr
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    {formatDateHeader(date)}
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm text-slate-400">
                    {jobsByDate[date].length} job{jobsByDate[date].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Jobs for this date */}
                <div className="grid gap-3">
                  {jobsByDate[date].map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={() => setSelectedJob(job)}
                      statusConfig={STATUS_CONFIG}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="empty-state py-16">
                <Calendar className="empty-state-icon" />
                <p className="empty-state-title">
                  {searchQuery || filterStatus !== "active"
                    ? "No jobs found"
                    : "No active jobs"}
                </p>
                <p className="empty-state-text">
                  {searchQuery || filterStatus !== "active"
                    ? "Try adjusting your search or filters."
                    : "Schedule your first job to get started."}
                </p>
                {!searchQuery && filterStatus === "active" && (
                  <button
                    onClick={() => setShowNewJobModal(true)}
                    className="btn-accent mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <CalendarView
          jobs={filteredJobs}
          statusConfig={STATUS_CONFIG}
          onJobClick={(job) => setSelectedJob(job)}
          onAddJob={(date) => {
            setShowNewJobModal(true);
            // TODO: Pre-fill the date in the modal
          }}
        />
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <JobModal
          contacts={contacts}
          onClose={() => setShowNewJobModal(false)}
          onSuccess={handleJobCreated}
        />
      )}

      {/* Edit Job Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          contacts={contacts}
          onClose={() => setSelectedJob(null)}
          onSuccess={handleJobUpdated}
        />
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
