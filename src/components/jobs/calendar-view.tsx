"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job, Contact, JobStatus } from "@/types/database";

interface JobWithContact extends Job {
  contacts: Pick<Contact, "id" | "name" | "phone" | "email"> | null;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface CalendarViewProps {
  jobs: JobWithContact[];
  statusConfig: Record<JobStatus, StatusConfig>;
  onJobClick: (job: JobWithContact) => void;
  onAddJob: (date: string) => void;
}

type ViewMode = "week" | "day";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

export function CalendarView({
  jobs,
  statusConfig,
  onJobClick,
  onAddJob,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Group jobs by date
  const jobsByDate = useMemo(() => {
    const map: Record<string, JobWithContact[]> = {};
    jobs.forEach((job) => {
      const dateStr = job.scheduled_date;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(job);
    });
    return map;
  }, [jobs]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const currentDateStr = currentDate.toISOString().split("T")[0];

  return (
    <div className="card overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (viewMode === "week" ? navigateWeek(-1) : navigateDay(-1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => (viewMode === "week" ? navigateWeek(1) : navigateDay(1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 ml-2">
            {viewMode === "week"
              ? `${formatMonthYear(weekDates[0])}${weekDates[0].getMonth() !== weekDates[6].getMonth() ? ` - ${formatMonthYear(weekDates[6])}` : ""}`
              : formatFullDate(currentDate)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "week"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "day"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "week" ? (
        <WeekView
          dates={weekDates}
          jobsByDate={jobsByDate}
          statusConfig={statusConfig}
          onJobClick={onJobClick}
          onAddJob={onAddJob}
          todayStr={todayStr}
        />
      ) : (
        <DayView
          date={currentDate}
          jobs={jobsByDate[currentDateStr] || []}
          statusConfig={statusConfig}
          onJobClick={onJobClick}
          onAddJob={onAddJob}
          isToday={currentDateStr === todayStr}
        />
      )}
    </div>
  );
}

function WeekView({
  dates,
  jobsByDate,
  statusConfig,
  onJobClick,
  onAddJob,
  todayStr,
}: {
  dates: Date[];
  jobsByDate: Record<string, JobWithContact[]>;
  statusConfig: Record<JobStatus, StatusConfig>;
  onJobClick: (job: JobWithContact) => void;
  onAddJob: (date: string) => void;
  todayStr: string;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-2 text-center text-xs font-medium text-slate-400">
            {/* Time column header */}
          </div>
          {dates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const isToday = dateStr === todayStr;
            const dayJobs = jobsByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={cn(
                  "p-3 text-center border-l border-slate-200",
                  isToday && "bg-amber-50"
                )}
              >
                <div className="text-xs font-medium text-slate-400 uppercase">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "text-lg font-bold mt-0.5",
                    isToday ? "text-amber-600" : "text-slate-900"
                  )}
                >
                  {date.getDate()}
                </div>
                {dayJobs.length > 0 && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {dayJobs.length} job{dayJobs.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100">
              {/* Time Label */}
              <div className="p-2 text-right pr-3">
                <span className="text-xs text-slate-400">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Day Columns */}
              {dates.map((date) => {
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === todayStr;
                const dayJobs = jobsByDate[dateStr] || [];
                const hourJobs = dayJobs.filter((job) =>
                  jobStartsInHour(job, hour)
                );

                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    onClick={() => onAddJob(dateStr)}
                    className={cn(
                      "h-16 border-l border-slate-200 p-1 cursor-pointer hover:bg-slate-50 transition-colors relative",
                      isToday && "bg-amber-50/30"
                    )}
                  >
                    {hourJobs.map((job) => (
                      <JobBlock
                        key={job.id}
                        job={job}
                        statusConfig={statusConfig}
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobClick(job);
                        }}
                        compact
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayView({
  date,
  jobs,
  statusConfig,
  onJobClick,
  onAddJob,
  isToday,
}: {
  date: Date;
  jobs: JobWithContact[];
  statusConfig: Record<JobStatus, StatusConfig>;
  onJobClick: (job: JobWithContact) => void;
  onAddJob: (date: string) => void;
  isToday: boolean;
}) {
  const dateStr = date.toISOString().split("T")[0];

  // Group jobs by hour
  const jobsByHour: Record<number, JobWithContact[]> = {};
  jobs.forEach((job) => {
    const hour = getJobStartHour(job);
    if (!jobsByHour[hour]) jobsByHour[hour] = [];
    jobsByHour[hour].push(job);
  });

  return (
    <div>
      {/* Add Job Button */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={() => onAddJob(dateStr)}
          className="w-full btn-secondary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Job for {isToday ? "Today" : formatShortDate(date)}
        </button>
      </div>

      {/* Time Slots */}
      <div className="divide-y divide-slate-100">
        {HOURS.map((hour) => {
          const hourJobs = jobsByHour[hour] || [];

          return (
            <div
              key={hour}
              onClick={() => onAddJob(dateStr)}
              className="flex cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {/* Time Label */}
              <div className="w-20 flex-shrink-0 p-3 text-right border-r border-slate-200">
                <span className="text-sm font-medium text-slate-400">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Jobs */}
              <div className="flex-1 min-h-[80px] p-2 space-y-2">
                {hourJobs.map((job) => (
                  <JobBlock
                    key={job.id}
                    job={job}
                    statusConfig={statusConfig}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick(job);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JobBlock({
  job,
  statusConfig,
  onClick,
  compact = false,
}: {
  job: JobWithContact;
  statusConfig: Record<JobStatus, StatusConfig>;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
}) {
  const config = statusConfig[job.status];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-1.5 rounded text-xs font-medium truncate border-l-2 transition-colors hover:opacity-80",
          config.bgColor,
          config.color,
          config.borderColor.replace("border-", "border-l-")
        )}
      >
        {formatJobTime(job)} {job.contacts?.name || job.service_type || "Job"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
        config.bgColor,
        config.borderColor.replace("border-", "border-l-")
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 truncate">
            {job.contacts?.name || "No customer"}
          </h4>
          {job.service_type && (
            <p className="text-sm text-slate-500 truncate">{job.service_type}</p>
          )}
        </div>
        <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bgColor, config.color)}>
          {config.label}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        {formatJobTimeRange(job)}
      </div>
    </button>
  );
}

// Helper functions
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${ampm}`;
}

function formatJobTime(job: Job): string {
  if (job.time_type === "timeofday") {
    switch (job.time_of_day) {
      case "morning":
        return "AM";
      case "afternoon":
        return "PM";
      default:
        return "All Day";
    }
  }
  if (job.window_start) {
    const [hours, minutes] = job.window_start.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "p" : "a";
    const hour12 = h % 12 || 12;
    return `${hour12}${minutes !== "00" ? ":" + minutes : ""}${ampm}`;
  }
  return "";
}

function formatJobTimeRange(job: Job): string {
  if (job.time_type === "timeofday") {
    switch (job.time_of_day) {
      case "morning":
        return "Morning (8 AM - 12 PM)";
      case "afternoon":
        return "Afternoon (12 PM - 5 PM)";
      default:
        return "All Day (8 AM - 5 PM)";
    }
  }

  if (job.window_start) {
    const start = formatTimeStr(job.window_start);
    if (job.time_type === "window" && job.window_end) {
      return `${start} - ${formatTimeStr(job.window_end)}`;
    }
    return start;
  }

  return "Time TBD";
}

function formatTimeStr(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function getJobStartHour(job: Job): number {
  if (job.time_type === "timeofday") {
    switch (job.time_of_day) {
      case "morning":
        return 8;
      case "afternoon":
        return 12;
      default:
        return 8;
    }
  }

  if (job.window_start) {
    const [hours] = job.window_start.split(":");
    return parseInt(hours, 10);
  }

  return 8; // Default to 8 AM
}

function jobStartsInHour(job: Job, hour: number): boolean {
  return getJobStartHour(job) === hour;
}
