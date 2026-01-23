import { createClient } from "@/lib/supabase/server";
import { InboxView } from "@/components/inbox/inbox-view";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all conversations with contact info
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      contact:contacts(id, name, phone, tags)
    `)
    .eq("contractor_id", user!.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  return (
    <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)]">
      <InboxView conversations={conversations || []} />
    </div>
  );
}
