"use client";

import {
  Clock,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Truck,
  Wrench,
  CheckCircle2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job, Contact, JobStatus } from "@/types/database";
import { useRouter } from "next/navigation";

interface JobWithContact extends Job {
  contacts: Pick<Contact, "id" | "name" | "phone" | "email"> | null;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}

interface JobCardProps {
  job: JobWithContact;
  onClick: () => void;
  statusConfig: Record<JobStatus, StatusConfig>;
}

export function JobCard({ job, onClick, statusConfig }: JobCardProps) {
  const router = useRouter();
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;

  const handleStatusChange = async (
    e: React.MouseEvent,
    newStatus: JobStatus
  ) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Determine next status action
  const getNextAction = (): { status: JobStatus; label: string; icon: React.ElementType } | null => {
    switch (job.status) {
      case "scheduled":
        return { status: "en_route", label: "Start Route", icon: Truck };
      case "en_route":
        return { status: "in_progress", label: "Start Job", icon: Play };
      case "in_progress":
        return { status: "completed", label: "Complete", icon: CheckCircle2 };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div
      onClick={onClick}
      className={cn(
        "card hover:shadow-md transition-all cursor-pointer border-l-4",
        config.borderColor
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Time */}
          <div className="flex-shrink-0 text-center min-w-[70px]">
            <div className="text-lg font-bold text-slate-900">
              {formatTime(job)}
            </div>
            {job.time_type === "window" && job.window_end && (
              <div className="text-xs text-slate-400">
                to {formatTimeString(job.window_end)}
              </div>
            )}
            {job.estimated_duration && (
              <div className="text-xs text-slate-400 mt-1">
                {formatDuration(job.estimated_duration)}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-slate-200 flex-shrink-0" />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Customer & Service */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">
                  {job.contacts?.name || "No customer"}
                </h3>
                {job.service_type && (
                  <p className="text-sm text-slate-500">{job.service_type}</p>
                )}
              </div>

              {/* Status Badge */}
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                  config.bgColor,
                  config.color
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              {job.contacts?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {formatPhoneNumber(job.contacts.phone)}
                </span>
              )}
              {(job.address_override || job.contacts) && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {job.address_override || "Address on file"}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {nextAction && (
              <button
                onClick={(e) => handleStatusChange(e, nextAction.status)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                <nextAction.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{nextAction.label}</span>
              </button>
            )}
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        {/* Notes Preview */}
        {job.notes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-500 line-clamp-1">{job.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(job: Job): string {
  if (job.time_type === "timeofday") {
    switch (job.time_of_day) {
      case "morning":
        return "Morning";
      case "afternoon":
        return "Afternoon";
      case "allday":
        return "All Day";
      default:
        return "TBD";
    }
  }

  if (job.window_start) {
    return formatTimeString(job.window_start);
  }

  return "TBD";
}

function formatTimeString(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatDuration(duration: string): string {
  const map: Record<string, string> = {
    "30min": "30 min",
    "1hr": "1 hour",
    "2hr": "2 hours",
    "3hr": "3 hours",
    "4hr": "4 hours",
    half_day: "Half day",
    full_day: "Full day",
  };
  return map[duration] || duration;
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
