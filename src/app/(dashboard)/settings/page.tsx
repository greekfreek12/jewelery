import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: contractor } = await supabase
    .from("contractors")
    .select("*")
    .eq("id", user!.id)
    .single();

  return <SettingsView contractor={contractor!} />;
}
