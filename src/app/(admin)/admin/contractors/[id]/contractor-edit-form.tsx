"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check } from "lucide-react";

interface Contractor {
  id: string;
  business_name: string;
  timezone: string;
  forwarding_number: string | null;
  google_review_link: string | null;
  feature_missed_call_text: boolean;
  feature_review_automation: boolean;
  feature_review_drip: boolean;
  feature_ai_responses: boolean;
  feature_campaigns: boolean;
  is_admin: boolean;
  subscription_status: string;
}

export function ContractorEditForm({ contractor }: { contractor: Contractor }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    business_name: contractor.business_name,
    timezone: contractor.timezone,
    forwarding_number: contractor.forwarding_number || "",
    google_review_link: contractor.google_review_link || "",
    feature_missed_call_text: contractor.feature_missed_call_text,
    feature_review_automation: contractor.feature_review_automation,
    feature_review_drip: contractor.feature_review_drip,
    feature_ai_responses: contractor.feature_ai_responses,
    feature_campaigns: contractor.feature_campaigns,
    is_admin: contractor.is_admin,
    subscription_status: contractor.subscription_status,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contractors/${contractor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Edit Contractor</h2>
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

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Business Info */}
        <div className="grid grid-cols-2 gap-4">
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

        {/* Phone & Review Link */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Forwarding Number</label>
            <input
              type="tel"
              value={formData.forwarding_number}
              onChange={(e) => handleChange("forwarding_number", e.target.value)}
              className="input"
              placeholder="(555) 555-5555"
            />
          </div>
          <div>
            <label className="label">Google Review Link</label>
            <input
              type="url"
              value={formData.google_review_link}
              onChange={(e) => handleChange("google_review_link", e.target.value)}
              className="input"
              placeholder="https://g.page/r/..."
            />
          </div>
        </div>

        {/* Subscription Status */}
        <div>
          <label className="label">Subscription Status</label>
          <select
            value={formData.subscription_status}
            onChange={(e) => handleChange("subscription_status", e.target.value)}
            className="input"
          >
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* Feature Toggles */}
        <div>
          <label className="label mb-3">Feature Toggles</label>
          <div className="grid grid-cols-2 gap-3">
            <ToggleField
              label="Missed Call Auto-Text"
              checked={formData.feature_missed_call_text}
              onChange={(val) => handleChange("feature_missed_call_text", val)}
            />
            <ToggleField
              label="Review Automation"
              checked={formData.feature_review_automation}
              onChange={(val) => handleChange("feature_review_automation", val)}
            />
            <ToggleField
              label="Review Drip"
              checked={formData.feature_review_drip}
              onChange={(val) => handleChange("feature_review_drip", val)}
            />
            <ToggleField
              label="AI Responses (V2)"
              checked={formData.feature_ai_responses}
              onChange={(val) => handleChange("feature_ai_responses", val)}
            />
            <ToggleField
              label="Campaigns (V2)"
              checked={formData.feature_campaigns}
              onChange={(val) => handleChange("feature_campaigns", val)}
            />
            <ToggleField
              label="Admin Access"
              checked={formData.is_admin}
              onChange={(val) => handleChange("is_admin", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}
