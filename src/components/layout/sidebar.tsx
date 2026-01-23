"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Users,
  Star,
  Settings,
  LayoutDashboard,
  LogOut,
  Phone,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contractor } from "@/types/database";
import { signOut } from "@/lib/actions/auth";

interface SidebarProps {
  contractor: Contractor;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: MessageSquare, badge: true },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ contractor }: SidebarProps) {
  const pathname = usePathname();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", class: "bg-emerald-500" };
      case "trialing":
        return { label: "Trial", class: "bg-amber-500" };
      case "past_due":
        return { label: "Past Due", class: "bg-red-500" };
      default:
        return { label: status, class: "bg-slate-500" };
    }
  };

  const statusInfo = getStatusInfo(contractor.subscription_status);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col overflow-y-auto bg-slate-900 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center gap-3">
          <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-glow-amber">
            <Zap className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">ContractorGrow</span>
            <p className="text-xs text-slate-500 font-medium">Business Platform</p>
          </div>
        </div>

        {/* Business Card */}
        <div className="mt-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{contractor.business_name}</p>
              {contractor.phone_number && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm text-slate-400 font-mono">{contractor.phone_number}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", statusInfo.class)} />
              <span className="text-xs font-medium text-slate-400">{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex flex-1 flex-col">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Menu
          </p>
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-amber-500 text-slate-900 shadow-glow-amber"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-slate-900" : "text-slate-500 group-hover:text-amber-500"
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                        isActive ? "bg-slate-900/20 text-slate-900" : "bg-amber-500/20 text-amber-500"
                      )}>
                        3
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Logout at bottom */}
            <li className="mt-auto pt-4 border-t border-slate-800">
              <form action={signOut}>
                <button
                  type="submit"
                  className="group flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 shrink-0 text-slate-600 group-hover:text-red-400 transition-colors" />
                  Sign out
                </button>
              </form>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
