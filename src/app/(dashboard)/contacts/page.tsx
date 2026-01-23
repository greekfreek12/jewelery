import { createClient } from "@/lib/supabase/server";
import { ContactsView } from "@/components/contacts/contacts-view";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("contractor_id", user!.id)
    .order("created_at", { ascending: false });

  return <ContactsView contacts={contacts || []} />;
}
