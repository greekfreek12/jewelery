"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Tag,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string | null;
  source: string;
  created_at: string;
  last_contacted_at: string | null;
  has_left_review: boolean;
  opted_out: boolean;
}

interface Conversation {
  id: string;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
}

interface ReviewRequest {
  id: string;
  status: string;
  rating: number | null;
  sent_at: string;
  replied_at: string | null;
  reviewed_at: string | null;
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchContact() {
      try {
        const response = await fetch(`/api/contacts/${contactId}`);
        if (response.ok) {
          const data = await response.json();
          setContact(data.contact);
          setConversation(data.conversation);
          setReviewRequests(data.reviewRequests);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/contacts");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="animate-slide-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Header */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {contact.name}
                  </h1>
                  {contact.has_left_review && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      Reviewed
                    </span>
                  )}
                  {contact.opted_out && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Opted Out
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-mono">{formatPhoneNumber(contact.phone)}</span>
                  </a>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{contact.email}</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/contacts/${contactId}/edit`}
                  className="btn-secondary btn-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-ghost btn-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {contact.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Added {formatDate(contact.created_at)}
              </div>
              {contact.last_contacted_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last contact {formatDate(contact.last_contacted_at)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="capitalize">Source: {contact.source}</span>
              </div>
            </div>
          </div>

          {/* Review History */}
          {reviewRequests.length > 0 && (
            <div className="card">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Review History</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {reviewRequests.map((request) => (
                  <div key={request.id} className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        request.rating && request.rating >= 4
                          ? "bg-emerald-100"
                          : request.rating && request.rating < 4
                          ? "bg-red-100"
                          : "bg-slate-100"
                      )}
                    >
                      {request.rating && request.rating >= 4 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : request.rating && request.rating < 4 ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Star className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 capitalize">
                          {request.status.replace("_", " ")}
                        </span>
                        {request.rating && (
                          <span className="text-sm text-slate-500">
                            • Rated {request.rating}/5
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        Sent {formatDate(request.sent_at)}
                        {request.reviewed_at && (
                          <> • Reviewed {formatDate(request.reviewed_at)}</>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>

            {conversation ? (
              <Link
                href={`/inbox?conversation=${conversation.id}`}
                className="btn-primary w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Conversation
                {conversation.unread_count > 0 && (
                  <span className="ml-auto bg-white text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold">
                    {conversation.unread_count}
                  </span>
                )}
              </Link>
            ) : (
              <button className="btn-primary w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Conversation
              </button>
            )}

            <button className="btn-secondary w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Request Review
            </button>

            <a
              href={`tel:${contact.phone}`}
              className="btn-secondary w-full justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </a>
          </div>

          {/* Conversation Preview */}
          {conversation && conversation.last_message_preview && (
            <div className="card p-4">
              <h2 className="font-semibold text-slate-900 mb-3">
                Last Message
              </h2>
              <p className="text-sm text-slate-600 line-clamp-3">
                {conversation.last_message_preview}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {conversation.last_message_at &&
                  formatDate(conversation.last_message_at)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Delete Contact
                </h3>
                <p className="text-slate-600 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium">{contact.name}</span>? This will
                  also delete their conversation history and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / 60000);
      return diffMins <= 1 ? "just now" : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
