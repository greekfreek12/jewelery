"use client";

import { useState, useRef } from "react";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Filter,
  Upload,
  Tag,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ContactsViewProps {
  contacts: Contact[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export function ContactsView({ contacts }: ContactsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("skipDuplicates", skipDuplicates.toString());

      const response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success && result.imported > 0) {
        router.refresh();
      }
    } catch {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Failed to import contacts"],
      });
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get unique tags
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || contact.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">{contacts.length} total contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </button>
          <Link href="/contacts/new" className="btn-accent">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg animate-slide-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Import Contacts</h2>
              <button onClick={closeImportModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!importResult ? (
                <>
                  {/* File Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      importFile
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {importFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-amber-500" />
                        <div className="text-left">
                          <p className="font-medium text-slate-900">{importFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">Click to select a CSV file</p>
                        <p className="text-sm text-slate-400 mt-1">or drag and drop</p>
                      </>
                    )}
                  </div>

                  {/* Options */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-600">
                      Skip contacts that already exist (matching phone number)
                    </span>
                  </label>

                  {/* Help Text */}
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900 mb-2">CSV Format</p>
                    <p>Your CSV should have columns for:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li><strong>Name</strong> (required)</li>
                      <li><strong>Phone</strong> (required)</li>
                      <li>Email (optional)</li>
                      <li>Tags (optional, comma-separated)</li>
                      <li>Notes (optional)</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  {importResult.success && importResult.imported > 0 ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900">Import Complete</h3>
                      <p className="text-slate-600 mt-1">
                        Successfully imported {importResult.imported} contact{importResult.imported !== 1 ? "s" : ""}
                        {importResult.skipped > 0 && (
                          <span className="text-slate-400">
                            {" "}({importResult.skipped} skipped as duplicates)
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-slate-900">Import Failed</h3>
                      {importResult.errors.length > 0 && (
                        <ul className="text-sm text-red-600 mt-2 text-left max-h-40 overflow-y-auto">
                          {importResult.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={closeImportModal} className="btn-secondary">
                {importResult ? "Close" : "Cancel"}
              </button>
              {!importResult && (
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="btn-accent disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Import Contacts"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "tag cursor-pointer transition-colors",
                !selectedTag && "bg-slate-900 text-white border-slate-900"
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  "tag cursor-pointer transition-colors",
                  selectedTag === tag && "bg-amber-100 text-amber-700 border-amber-200"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="card overflow-hidden">
        {filteredContacts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-4">Contact</div>
              <div className="col-span-3">Phone</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-2">Added</div>
              <div className="col-span-1"></div>
            </div>

            {filteredContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="block hover:bg-slate-50 transition-colors"
              >
                {/* Mobile Layout */}
                <div className="lg:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="avatar bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">{contact.name}</h3>
                        {contact.has_left_review && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{formatPhoneNumber(contact.phone)}</p>
                      {contact.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="tag text-[10px]">
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="tag text-[10px]">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-400">
                        {formatDate(contact.created_at)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // TODO: Start conversation
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="avatar bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 truncate">{contact.name}</h3>
                        {contact.has_left_review && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      {contact.email && (
                        <p className="text-sm text-slate-500 truncate">{contact.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 text-slate-600 font-mono text-sm">
                    {formatPhoneNumber(contact.phone)}
                  </div>
                  <div className="col-span-2">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag text-[10px]">
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 2 && (
                        <span className="text-xs text-slate-400">+{contact.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">
                    {formatDate(contact.created_at)}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Start conversation
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Send review request
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <Star className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state py-16">
            <Users className="empty-state-icon" />
            <p className="empty-state-title">
              {searchQuery || selectedTag ? "No contacts found" : "No contacts yet"}
            </p>
            <p className="empty-state-text">
              {searchQuery || selectedTag
                ? "Try adjusting your search or filters."
                : "Add your first contact or import from a CSV file."}
            </p>
            {!searchQuery && !selectedTag && (
              <Link href="/contacts/new" className="btn-accent mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Link>
            )}
          </div>
        )}
      </div>
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
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
