import { createApiServiceClient } from "@/lib/supabase/api-client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createApiServiceClient();

  const { data: lead, error } = await supabase
    .from("leads_raw")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Also fetch the associated site if it exists
  const { data: site } = await supabase
    .from("sites")
    .select("id, slug, status, config")
    .eq("lead_id", id)
    .single();

  return NextResponse.json({
    ...lead,
    site_data: site || null,
  });
}
