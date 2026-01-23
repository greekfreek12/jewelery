"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Tag,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_TAGS = ["lead", "customer", "past customer", "VIP", "referral"];

export default function NewContactPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [customTag, setCustomTag] = useState("");

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim().toLowerCase())) {
      setTags((prev) => [...prev, customTag.trim().toLowerCase()]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          email: email.trim() || null,
          tags,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create contact");
      }

      const { contact } = await response.json();
      router.push(`/contacts/${contact.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
      setSaving(false);
    }
  };

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Contact</h1>
        <p className="text-slate-500 mt-1">
          Add a customer or lead to your contact list.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card">
          {error && (
            <div className="m-6 mb-0 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="John Smith"
                required
                autoFocus
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="input font-mono"
                placeholder="(555) 555-5555"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="label flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Email <span className="text-slate-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="john@example.com"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="label flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                Tags
              </label>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="tag cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  className="input flex-1"
                  placeholder="Add custom tag..."
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                  className="btn-secondary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Notes <span className="text-slate-400 text-xs font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[100px] resize-y"
                placeholder="Any notes about this contact..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-xl">
            <Link href="/contacts" className="btn-secondary justify-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!name.trim() || !phone.trim() || saving}
              className="btn-accent justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
