"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  KeyRound,
  Copy,
  ExternalLink,
  UserX,
  Trash2,
  LogIn,
  RefreshCw,
  Check,
} from "lucide-react";

interface ActionsDropdownProps {
  contractor: {
    id: string;
    stripe_customer_id: string | null;
    email: string;
  };
}

export function ActionsDropdown({ contractor }: ActionsDropdownProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImpersonate = async () => {
    setLoading("impersonate");
    try {
      const response = await fetch(`/api/admin/contractors/${contractor.id}/impersonate`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate impersonation link");
      }

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to impersonate");
    } finally {
      setLoading(null);
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(contractor.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuspend = async () => {
    if (!confirm("Are you sure you want to suspend this account?")) return;

    setLoading("suspend");
    try {
      const response = await fetch(`/api/admin/contractors/${contractor.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: true, reason: "Suspended by admin" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to suspend account");
      }

      alert("Account suspended");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to suspend");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${contractor.email}? This cannot be undone.`)) return;
    if (!confirm("This will permanently delete all data. Type DELETE to confirm.")) return;

    setLoading("delete");
    try {
      const response = await fetch(`/api/admin/contractors/${contractor.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      router.push("/admin/contractors");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative group">
      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button
          className="dropdown-item w-full text-left"
          onClick={handleImpersonate}
          disabled={loading === "impersonate"}
        >
          {loading === "impersonate" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Impersonate
        </button>
        <button className="dropdown-item w-full text-left">
          <KeyRound className="w-4 h-4" />
          Send Password Reset
        </button>
        <button
          className="dropdown-item w-full text-left"
          onClick={handleCopyId}
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Contractor ID"}
        </button>
        {contractor.stripe_customer_id && (
          <a
            href={`https://dashboard.stripe.com/customers/${contractor.stripe_customer_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dropdown-item"
          >
            <ExternalLink className="w-4 h-4" />
            View in Stripe
          </a>
        )}
        <div className="dropdown-divider" />
        <button
          className="dropdown-item-danger w-full text-left"
          onClick={handleSuspend}
          disabled={loading === "suspend"}
        >
          {loading === "suspend" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
          Suspend Account
        </button>
        <button
          className="dropdown-item-danger w-full text-left"
          onClick={handleDelete}
          disabled={loading === "delete"}
        >
          {loading === "delete" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete Account
        </button>
      </div>
    </div>
  );
}
