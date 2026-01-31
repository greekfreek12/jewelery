import { createClient } from "@/lib/supabase/server";
import { CalendarPageView } from "@/components/jobs/calendar-page-view";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all jobs with contact info
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `
      *,
      contacts (
        id,
        name,
        phone,
        email,
        address
      )
    `
    )
    .eq("contractor_id", user!.id)
    .order("scheduled_date", { ascending: true });

  // Get contacts for the new job modal
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, phone")
    .eq("contractor_id", user!.id)
    .order("name", { ascending: true });

  return <CalendarPageView jobs={jobs || []} contacts={contacts || []} />;
}
