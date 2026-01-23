"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Star,
  Loader2,
  Zap,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  has_left_review: boolean;
  opted_out: boolean;
}

export default function NewReviewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContactId = searchParams.get("contact");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/contacts");
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
          setFilteredContacts(data.contacts || []);

          // Pre-select contact if provided
          if (preselectedContactId) {
            const contact = data.contacts?.find(
              (c: Contact) => c.id === preselectedContactId
            );
            if (contact) {
              setSelectedContact(contact);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
      setLoading(false);
    }

    fetchContacts();
  }, [preselectedContactId]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredContacts(contacts);
    } else {
      const query = search.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.phone.includes(query)
        )
      );
    }
  }, [search, contacts]);

  const handleSend = async () => {
    if (!selectedContact) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContact.id }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/reviews");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send review request");
      }
    } catch (err) {
      setError("Failed to send review request");
    }
    setSending(false);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (success) {
    return (
      <div className="animate-slide-up max-w-2xl mx-auto">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Review Request Sent!
          </h2>
          <p className="text-slate-600">
            We&apos;ve sent a review request to {selectedContact?.name}. They&apos;ll
            receive a text asking them to rate their experience.
          </p>
          <Link href="/reviews" className="btn-primary mt-6">
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Send Review Request</h1>
        <p className="text-slate-500 mt-1">
          Select a contact to send them a review request via SMS.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="card">
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredContacts.map((contact) => {
                const isDisabled = contact.has_left_review || contact.opted_out;
                const isSelected = selectedContact?.id === contact.id;

                return (
                  <button
                    key={contact.id}
                    onClick={() => !isDisabled && setSelectedContact(contact)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full p-4 text-left transition-colors flex items-center gap-4",
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : isSelected
                        ? "bg-amber-50 border-l-4 border-amber-500"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="avatar">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 truncate">
                          {contact.name}
                        </h3>
                        {contact.has_left_review && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Already Reviewed
                          </span>
                        )}
                        {contact.opted_out && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Opted Out
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-mono">
                        {formatPhone(contact.phone)}
                      </p>
                    </div>
                    {isSelected && !isDisabled && (
                      <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No contacts found</p>
            </div>
          )}
        </div>

        {/* Selected Contact Preview */}
        {selectedContact && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Will receive a review request SMS
                </p>
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-accent"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">How it works</h4>
            <p className="text-sm text-amber-700 mt-1">
              The contact will receive an SMS asking them to rate their experience
              1-5. If they reply with 4 or 5, they&apos;ll automatically receive your
              Google review link. Lower ratings trigger a follow-up message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
