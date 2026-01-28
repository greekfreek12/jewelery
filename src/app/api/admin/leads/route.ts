import { createApiServiceClient } from "@/lib/supabase/api-client";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createApiServiceClient();

  // Supabase has a hard limit of 1000 rows per request
  // Fetch in batches to get all leads
  const allLeads: any[] = [];
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("leads_raw")
      .select(`
        id,
        name,
        phone,
        city,
        state,
        site,
        category,
        subtypes,
        rating,
        reviews,
        reviews_link,
        photos_count,
        place_id,
        facebook,
        instagram,
        logo,
        business_status,
        verified,
        email_1,
        status,
        status_reason
      `)
      .eq("status", "active")
      .order("reviews", { ascending: false, nullsFirst: false })
      .range(offset, offset + batchSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
      allLeads.push(...data);
      offset += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  // Fetch all sites to get slugs
  const { data: sites } = await supabase
    .from("sites")
    .select("lead_id, slug");

  // Create lookup map
  const sitesByLeadId = new Map(
    sites?.map((s) => [s.lead_id, s.slug]) || []
  );

  // Add site_slug to each lead
  const leadsWithSites = allLeads.map((lead) => ({
    ...lead,
    site_slug: sitesByLeadId.get(lead.id) || null,
  }));

  return NextResponse.json(leadsWithSites);
}

export async function DELETE(request: Request) {
  const supabase = createApiServiceClient();

  const { ids, reason } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Soft delete - mark as archived instead of removing
  const { error } = await supabase
    .from("leads_raw")
    .update({
      status: "archived",
      status_reason: reason || "manual",
      status_updated_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ archived: ids.length });
}
