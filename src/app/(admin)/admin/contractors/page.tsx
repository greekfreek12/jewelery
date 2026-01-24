import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

export default async function AdminContractorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;

  // First check if current user is admin using regular client
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: currentUser } = await authClient
    .from("contractors")
    .select("is_admin")
    .eq("id", user.id)
    .single() as { data: { is_admin: boolean } | null };

  if (!currentUser?.is_admin) {
    redirect("/dashboard");
  }

  // Use service client to bypass RLS for admin operations
  const supabase = createServiceClient();

  // Build query
  let query = supabase
    .from("contractors")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("subscription_status", params.status);
  }

  if (params.search) {
    query = query.or(
      `business_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
    );
  }

  const { data: contractorsData } = await query;
  const contractors = (contractorsData || []) as {
    id: string;
    business_name: string;
    email: string;
    phone_number: string | null;
    subscription_status: string;
    created_at: string;
  }[];

  // Get counts by status
  const { count: totalCount } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active");

  const { count: trialingCount } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "trialing");

  const { count: pastDueCount } = await supabase
    .from("contractors")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "past_due");

  const currentStatus = params.status || "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contractors</h1>
          <p className="text-slate-500">Manage all contractor accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Search by name or email..."
                className="input pl-10 w-full"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2">
            <FilterButton
              href="/admin/contractors"
              label="All"
              count={totalCount || 0}
              active={currentStatus === "all"}
            />
            <FilterButton
              href="/admin/contractors?status=active"
              label="Active"
              count={activeCount || 0}
              active={currentStatus === "active"}
            />
            <FilterButton
              href="/admin/contractors?status=trialing"
              label="Trialing"
              count={trialingCount || 0}
              active={currentStatus === "trialing"}
            />
            <FilterButton
              href="/admin/contractors?status=past_due"
              label="Past Due"
              count={pastDueCount || 0}
              active={currentStatus === "past_due"}
            />
          </div>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Business
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contractors?.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold">
                        {contractor.business_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {contractor.business_name}
                        </p>
                        <p className="text-xs text-slate-500">{contractor.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {contractor.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {contractor.phone_number ? (
                      <div className="flex items-center gap-2 text-sm font-mono text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {formatPhone(contractor.phone_number)}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={contractor.subscription_status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {formatDate(contractor.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/contractors/${contractor.id}`}
                      className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline"
                    >
                      View
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {!contractors?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No contractors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
      <span
        className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
          active ? "bg-white/20" : "bg-slate-200"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-slate-100 text-slate-700",
  };

  const labels: Record<string, string> = {
    active: "Active",
    trialing: "Trialing",
    past_due: "Past Due",
    canceled: "Canceled",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.canceled
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
