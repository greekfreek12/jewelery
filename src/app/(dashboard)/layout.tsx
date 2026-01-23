import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { PushNotificationPrompt } from "@/components/pwa/push-notification-prompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contractor } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!contractor) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PWA Registration */}
      <ServiceWorkerRegistration />
      <InstallPrompt />
      <PushNotificationPrompt />

      {/* Desktop Sidebar */}
      <Sidebar contractor={contractor} />

      {/* Mobile Navigation */}
      <MobileNav contractor={contractor} />

      {/* Main Content */}
      <main className="lg:pl-72 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
