"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Trash2,
  Phone,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job, Contact, JobTimeType, JobTimeOfDay, JobDuration, JobStatus } from "@/types/database";

interface JobWithContact extends Job {
  contacts: Pick<Contact, "id" | "name" | "phone" | "email"> | null;
}

interface JobModalProps {
  job?: JobWithContact;
  contacts: Pick<Contact, "id" | "name" | "phone">[];
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
}

const TIME_OF_DAY_OPTIONS: { value: JobTimeOfDay; label: string; time: string }[] = [
  { value: "morning", label: "Morning", time: "8 AM - 12 PM" },
  { value: "afternoon", label: "Afternoon", time: "12 PM - 5 PM" },
  { value: "allday", label: "All Day", time: "8 AM - 5 PM" },
];

const DURATION_OPTIONS: { value: JobDuration; label: string }[] = [
  { value: "30min", label: "30 minutes" },
  { value: "1hr", label: "1 hour" },
  { value: "2hr", label: "2 hours" },
  { value: "3hr", label: "3 hours" },
  { value: "4hr", label: "4 hours" },
  { value: "half_day", label: "Half day" },
  { value: "full_day", label: "Full day" },
];

const STATUS_OPTIONS: { value: JobStatus; label: string; color: string }[] = [
  { value: "scheduled", label: "Scheduled", color: "bg-slate-100 text-slate-600" },
  { value: "en_route", label: "En Route", color: "bg-blue-50 text-blue-600" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-50 text-amber-600" },
  { value: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-600" },
];

export function JobModal({ job, contacts, onClose, onSuccess, defaultDate }: JobModalProps) {
  const isEditing = !!job;

  const [formData, setFormData] = useState({
    contact_id: job?.contact_id || "",
    service_type: job?.service_type || "",
    scheduled_date: job?.scheduled_date || defaultDate || new Date().toISOString().split("T")[0],
    time_type: (job?.time_type || "window") as JobTimeType,
    window_start: job?.window_start?.slice(0, 5) || "09:00",
    window_end: job?.window_end?.slice(0, 5) || "11:00",
    time_of_day: (job?.time_of_day || "morning") as JobTimeOfDay,
    estimated_duration: (job?.estimated_duration || "") as JobDuration | "",
    address_override: job?.address_override || "",
    notes: job?.notes || "",
    status: job?.status || "scheduled",
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        contact_id: formData.contact_id || null,
        service_type: formData.service_type || null,
        scheduled_date: formData.scheduled_date,
        time_type: formData.time_type,
        window_start:
          formData.time_type !== "timeofday" ? formData.window_start : null,
        window_end:
          formData.time_type === "window" ? formData.window_end : null,
        time_of_day:
          formData.time_type === "timeofday" ? formData.time_of_day : null,
        estimated_duration: formData.estimated_duration || null,
        address_override: formData.address_override || null,
        notes: formData.notes || null,
        ...(isEditing && { status: formData.status }),
      };

      const response = await fetch(
        isEditing ? `/api/jobs/${job.id}` : "/api/jobs",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save job");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !confirm("Are you sure you want to delete this job?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  const selectedContact = contacts.find((c) => c.id === formData.contact_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="card w-full max-w-xl my-8 animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Job" : "New Job"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Customer
              </label>
              <select
                value={formData.contact_id}
                onChange={(e) =>
                  setFormData({ ...formData, contact_id: e.target.value })
                }
                className="input"
              >
                <option value="">Select a customer (optional)</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} - {contact.phone}
                  </option>
                ))}
              </select>
              {selectedContact && (
                <div className="flex gap-2 mt-2">
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                  <a
                    href={`/inbox?contact=${selectedContact.id}`}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </a>
                </div>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Type
              </label>
              <input
                type="text"
                value={formData.service_type}
                onChange={(e) =>
                  setFormData({ ...formData, service_type: e.target.value })
                }
                placeholder="e.g., AC Repair, Drain Cleaning..."
                className="input"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Date
              </label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
                required
                className="input"
              />
            </div>

            {/* Time Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Time
              </label>
              <div className="flex gap-2 mb-3">
                {(["window", "timeofday", "exact"] as JobTimeType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, time_type: type })
                      }
                      className={cn(
                        "flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors",
                        formData.time_type === type
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {type === "window" && "Window"}
                      {type === "timeofday" && "Time of Day"}
                      {type === "exact" && "Exact Time"}
                    </button>
                  )
                )}
              </div>

              {/* Window Time */}
              {formData.time_type === "window" && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={formData.window_start}
                    onChange={(e) =>
                      setFormData({ ...formData, window_start: e.target.value })
                    }
                    className="input flex-1"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    value={formData.window_end}
                    onChange={(e) =>
                      setFormData({ ...formData, window_end: e.target.value })
                    }
                    className="input flex-1"
                  />
                </div>
              )}

              {/* Time of Day */}
              {formData.time_type === "timeofday" && (
                <div className="grid grid-cols-3 gap-2">
                  {TIME_OF_DAY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, time_of_day: option.value })
                      }
                      className={cn(
                        "py-3 px-2 text-center rounded-lg border transition-colors",
                        formData.time_of_day === option.value
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {option.time}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Exact Time */}
              {formData.time_type === "exact" && (
                <input
                  type="time"
                  value={formData.window_start}
                  onChange={(e) =>
                    setFormData({ ...formData, window_start: e.target.value })
                  }
                  className="input"
                />
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Duration (optional)
              </label>
              <select
                value={formData.estimated_duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_duration: e.target.value as JobDuration | "",
                  })
                }
                className="input"
              >
                <option value="">Not specified</option>
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Override */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Address (optional)
              </label>
              <input
                type="text"
                value={formData.address_override}
                onChange={(e) =>
                  setFormData({ ...formData, address_override: e.target.value })
                }
                placeholder="Leave blank to use customer's address"
                className="input"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Gate code, special instructions, etc."
                className="input resize-none"
              />
            </div>

            {/* Status (Edit mode only) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: option.value })
                      }
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors",
                        formData.status === option.value
                          ? option.color + " border-current"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Job"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
