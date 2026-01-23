"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Star,
  Bell,
  CreditCard,
  MessageSquare,
  Clock,
  Save,
  Loader2,
  ExternalLink,
  Check,
  X,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contractor } from "@/types/database";

interface SettingsViewProps {
  contractor: Contractor;
}

const sections = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export function SettingsView({ contractor }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState("business");
  const [formData, setFormData] = useState({
    business_name: contractor.business_name,
    timezone: contractor.timezone,
    forwarding_number: contractor.forwarding_number || "",
    google_review_link: contractor.google_review_link || "",
    business_hours_start: contractor.business_hours_start || "",
    business_hours_end: contractor.business_hours_end || "",
    feature_missed_call_text: contractor.feature_missed_call_text,
    feature_review_automation: contractor.feature_review_automation,
    feature_review_drip: contractor.feature_review_drip,
    notification_push: contractor.notification_push,
    notification_email: contractor.notification_email,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, { message?: string; enabled?: boolean; delay_days?: number }>>(
    (contractor.templates || {}) as unknown as Record<string, { message?: string; enabled?: boolean; delay_days?: number }>
  );

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save settings. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-accent">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Nav */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-amber-500 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <section.icon className={cn(
                  "w-5 h-5",
                  activeSection === section.id ? "text-slate-900" : "text-slate-400"
                )} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === "business" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Business Name</label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => handleChange("business_name", e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="input"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Hours</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Set your working hours for auto-responder timing.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Time</label>
                    <input
                      type="time"
                      value={formData.business_hours_start}
                      onChange={(e) => handleChange("business_hours_start", e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">End Time</label>
                    <input
                      type="time"
                      value={formData.business_hours_end}
                      onChange={(e) => handleChange("business_hours_end", e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "phone" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Phone Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Your Business Number</label>
                    <div className="input bg-slate-50 text-slate-600 font-mono">
                      {contractor.phone_number || "Not assigned yet"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      This is the number customers will text and call.
                    </p>
                  </div>

                  <div>
                    <label className="label">Call Forwarding Number</label>
                    <input
                      type="tel"
                      value={formData.forwarding_number}
                      onChange={(e) => handleChange("forwarding_number", e.target.value)}
                      className="input"
                      placeholder="(555) 555-5555"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Calls will be forwarded to this number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Missed Call Auto-Text</h2>
                <ToggleSetting
                  label="Enable missed call auto-text"
                  description="Automatically send a text when you miss a call"
                  enabled={formData.feature_missed_call_text}
                  onChange={(val) => handleChange("feature_missed_call_text", val)}
                />
              </div>
            </div>
          )}

          {activeSection === "reviews" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Review Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Google Review Link</label>
                    <input
                      type="url"
                      value={formData.google_review_link}
                      onChange={(e) => handleChange("google_review_link", e.target.value)}
                      className="input"
                      placeholder="https://g.page/r/..."
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Paste your Google Business Profile review link.{" "}
                      <a
                        href="https://support.google.com/business/answer/7035772"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:underline inline-flex items-center gap-1"
                      >
                        How to find it
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Automation</h2>
                <div className="space-y-4">
                  <ToggleSetting
                    label="Review automation"
                    description="Automatically route positive ratings to Google"
                    enabled={formData.feature_review_automation}
                    onChange={(val) => handleChange("feature_review_automation", val)}
                  />
                  <ToggleSetting
                    label="Review drip sequence"
                    description="Send follow-up reminders to non-responders"
                    enabled={formData.feature_review_drip}
                    onChange={(val) => handleChange("feature_review_drip", val)}
                  />
                </div>
              </div>

              <div className="divider" />

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Message Templates</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Customize the messages sent to your customers. Use {"{{contact_name}}"}, {"{{business_name}}"}, and {"{{review_link}}"} as placeholders.
                </p>
                <div className="space-y-3">
                  <TemplateButton
                    label="Review Request"
                    templateKey="review_request"
                    onClick={() => setEditingTemplate("review_request")}
                  />
                  <TemplateButton
                    label="Positive Response (4-5)"
                    templateKey="review_positive"
                    onClick={() => setEditingTemplate("review_positive")}
                  />
                  <TemplateButton
                    label="Negative Response (1-3)"
                    templateKey="review_negative"
                    onClick={() => setEditingTemplate("review_negative")}
                  />
                  <TemplateButton
                    label="First Reminder (Day 3)"
                    templateKey="review_reminder_1"
                    onClick={() => setEditingTemplate("review_reminder_1")}
                  />
                  <TemplateButton
                    label="Second Reminder (Day 7)"
                    templateKey="review_reminder_2"
                    onClick={() => setEditingTemplate("review_reminder_2")}
                  />
                  <TemplateButton
                    label="Missed Call Auto-Text"
                    templateKey="missed_call"
                    onClick={() => setEditingTemplate("missed_call")}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <ToggleSetting
                    label="Push notifications"
                    description="Get notified instantly when customers message you"
                    enabled={formData.notification_push}
                    onChange={(val) => handleChange("notification_push", val)}
                  />
                  <ToggleSetting
                    label="Email notifications"
                    description="Receive daily summary emails"
                    enabled={formData.notification_email}
                    onChange={(val) => handleChange("notification_email", val)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "billing" && (
            <BillingSection contractor={contractor} />
          )}
        </div>
      </div>

      {/* Template Editor Modal */}
      {editingTemplate && (
        <TemplateEditorModal
          templateKey={editingTemplate}
          templates={templates}
          onSave={(key, data) => {
            setTemplates((prev) => ({ ...prev, [key]: data }));
          }}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "toggle",
          enabled ? "toggle-on" : "toggle-off"
        )}
      >
        <span
          className={cn(
            "toggle-knob",
            enabled ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

function TemplateButton({
  label,
  templateKey,
  onClick,
}: {
  label: string;
  templateKey: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <span className="font-medium text-slate-700">{label}</span>
      <Edit2 className="w-4 h-4 text-slate-400" />
    </button>
  );
}

const TEMPLATE_INFO: Record<string, { title: string; description: string; hasDelay?: boolean }> = {
  review_request: {
    title: "Review Request",
    description: "Initial message asking for a rating (1-5)",
  },
  review_positive: {
    title: "Positive Response",
    description: "Sent when customer replies with 4 or 5 stars",
  },
  review_negative: {
    title: "Negative Response",
    description: "Sent when customer replies with 1-3 stars",
  },
  review_reminder_1: {
    title: "First Reminder",
    description: "Sent if no response after initial request",
    hasDelay: true,
  },
  review_reminder_2: {
    title: "Second Reminder",
    description: "Final reminder if still no response",
    hasDelay: true,
  },
  missed_call: {
    title: "Missed Call Auto-Text",
    description: "Sent automatically when you miss a call",
  },
  review_blast: {
    title: "Review Blast",
    description: "Used for bulk review request campaigns",
  },
};

function TemplateEditorModal({
  templateKey,
  templates,
  onSave,
  onClose,
}: {
  templateKey: string;
  templates: Record<string, { message?: string; enabled?: boolean; delay_days?: number }>;
  onSave: (key: string, data: { message?: string; enabled?: boolean; delay_days?: number }) => void;
  onClose: () => void;
}) {
  const info = TEMPLATE_INFO[templateKey] || { title: templateKey, description: "" };
  const currentTemplate = templates[templateKey] || {};

  const [message, setMessage] = useState(currentTemplate.message || "");
  const [enabled, setEnabled] = useState(currentTemplate.enabled !== false);
  const [delayDays, setDelayDays] = useState(currentTemplate.delay_days || 3);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey,
          message,
          enabled,
          ...(info.hasDelay && { delay_days: delayDays }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      onSave(templateKey, {
        message,
        enabled,
        ...(info.hasDelay && { delay_days: delayDays }),
      });
      onClose();
    } catch (error) {
      console.error("Save template error:", error);
      alert("Failed to save template. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full animate-scale-in">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{info.title}</h3>
              <p className="text-sm text-slate-500">{info.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {templateKey === "missed_call" && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Enable</p>
                <p className="text-sm text-slate-500">Send this message automatically</p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={cn("toggle", enabled ? "toggle-on" : "toggle-off")}
              >
                <span className={cn("toggle-knob", enabled ? "translate-x-5" : "translate-x-1")} />
              </button>
            </div>
          )}

          {info.hasDelay && (
            <div>
              <label className="label">Send After (days)</label>
              <select
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="input"
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input min-h-[120px] resize-y font-mono text-sm"
              placeholder="Enter your message template..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Available variables: {"{{contact_name}}"}, {"{{business_name}}"}, {"{{review_link}}"}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-accent">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSection({ contractor }: { contractor: Contractor }) {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500",
    trialing: "bg-blue-500",
    past_due: "bg-red-500",
    canceled: "bg-slate-400",
  };

  const statusLabels: Record<string, string> = {
    active: "Active",
    trialing: "Free Trial",
    past_due: "Past Due",
    canceled: "Canceled",
  };

  const status = contractor.subscription_status || "none";

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription</h2>
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Current Plan</p>
              <p className="text-xl font-bold text-slate-900">Contractor Growth Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Monthly</p>
              <p className="text-xl font-bold text-slate-900">$297</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              "w-2 h-2 rounded-full",
              statusColors[status] || "bg-slate-400"
            )} />
            <span className="text-sm font-medium text-slate-700">
              {statusLabels[status] || "No subscription"}
            </span>
          </div>
          {status === "trialing" && (
            <p className="text-sm text-blue-600 mb-4">
              Your free trial is active. You won&apos;t be charged until it ends.
            </p>
          )}
          {status === "past_due" && (
            <p className="text-sm text-red-600 mb-4">
              Your payment failed. Please update your payment method to keep your account active.
            </p>
          )}
          {contractor.stripe_customer_id ? (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="btn-secondary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Subscription
                </>
              )}
            </button>
          ) : (
            <a href="/pricing" className="btn-accent w-full inline-block text-center">
              Start Free Trial
            </a>
          )}
        </div>
      </div>

      <div className="divider" />

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
        <p className="text-sm text-slate-500 mb-4">
          Manage your payment method through the Stripe billing portal.
        </p>
        {contractor.stripe_customer_id && (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
