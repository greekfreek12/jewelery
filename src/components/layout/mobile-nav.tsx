"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Users,
  Star,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contractor } from "@/types/database";

interface MobileNavProps {
  contractor: Contractor;
}

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/inbox", icon: MessageSquare, badge: 3 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ contractor }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                isActive ? "text-amber-500" : "text-slate-500"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive ? "text-amber-500" : "text-slate-500")} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-amber-500 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.name}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
