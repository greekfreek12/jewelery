"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Save,
} from "lucide-react";

const SUGGESTED_TAGS = ["lead", "customer", "past customer", "VIP", "referral"];

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string | null;
}

export default function EditContactPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    async function fetchContact() {
      try {
        const response = await fetch(`/api/contacts/${contactId}`);
        if (response.ok) {
          const data = await response.json();
          const contact: Contact = data.contact;
          setName(contact.name);
          setPhone(formatPhoneDisplay(contact.phone));
          setEmail(contact.email || "");
          setTags(contact.tags || []);
          setNotes(contact.notes || "");
        } else {
          router.push("/contacts");
        }
      } catch (error) {
        console.error("Failed to fetch contact:", error);
        router.push("/contacts");
      }
      setLoading(false);
    }

    fetchContact();
  }, [contactId, router]);

  const formatPhoneDisplay = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

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
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
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
        throw new Error(data.error || "Failed to update contact");
      }

      router.push(`/contacts/${contactId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/contacts/${contactId}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contact
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Contact</h1>
        <p className="text-slate-500 mt-1">
          Update contact information and tags.
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
            <Link href={`/contacts/${contactId}`} className="btn-secondary justify-center">
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
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
