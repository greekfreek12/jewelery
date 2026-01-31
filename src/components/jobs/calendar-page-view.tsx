"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Job, Contact, JobStatus } from "@/types/database";
import { useRouter } from "next/navigation";
import { JobModal } from "./job-modal";
import { CalendarView } from "./calendar-view";

interface JobWithContact extends Job {
  contacts: Pick<Contact, "id" | "name" | "phone" | "email"> | null;
}

interface CalendarPageViewProps {
  jobs: JobWithContact[];
  contacts: Pick<Contact, "id" | "name" | "phone">[];
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  scheduled: {
    label: "Scheduled",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
  },
  en_route: {
    label: "En Route",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export function CalendarPageView({ jobs, contacts }: CalendarPageViewProps) {
  const router = useRouter();
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithContact | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  // Filter out cancelled jobs for calendar display
  const activeJobs = jobs.filter((j) => j.status !== "cancelled");

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysJobs = jobs.filter(
    (j) => j.scheduled_date === todayStr && j.status !== "cancelled"
  );
  const thisWeekJobs = jobs.filter((j) => {
    const jobDate = new Date(j.scheduled_date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return (
      jobDate >= today &&
      jobDate <= weekFromNow &&
      j.status !== "cancelled"
    );
  });

  const handleJobCreated = () => {
    setShowNewJobModal(false);
    setPrefilledDate(null);
    router.refresh();
  };

  const handleJobUpdated = () => {
    setSelectedJob(null);
    router.refresh();
  };

  const handleAddJob = (date: string) => {
    setPrefilledDate(date);
    setShowNewJobModal(true);
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">
            {todaysJobs.length} today &middot; {thisWeekJobs.length} this week
          </p>
        </div>
        <button onClick={() => setShowNewJobModal(true)} className="btn-accent">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </button>
      </div>

      {/* Calendar */}
      <CalendarView
        jobs={activeJobs}
        statusConfig={STATUS_CONFIG}
        onJobClick={(job) => setSelectedJob(job)}
        onAddJob={handleAddJob}
      />

      {/* New Job Modal */}
      {showNewJobModal && (
        <JobModal
          contacts={contacts}
          onClose={() => {
            setShowNewJobModal(false);
            setPrefilledDate(null);
          }}
          onSuccess={handleJobCreated}
          defaultDate={prefilledDate || undefined}
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
