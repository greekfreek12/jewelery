import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

const TEMPLATE_KEYS = [
  "missed_call",
  "review_request",
  "review_positive",
  "review_negative",
  "review_reminder_1",
  "review_reminder_2",
  "review_blast",
];

/**
 * Update a specific template
 * PUT /api/settings/templates
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateKey, message, enabled, delay_days } = body;

    if (!templateKey || !TEMPLATE_KEYS.includes(templateKey)) {
      return NextResponse.json(
        { error: "Invalid template key" },
        { status: 400 }
      );
    }

    // Get current templates
    const { data: contractor, error: fetchError } = await supabase
      .from("contractors")
      .select("templates")
      .eq("id", user.id)
      .single();

    if (fetchError || !contractor) {
      return NextResponse.json(
        { error: "Failed to fetch current templates" },
        { status: 500 }
      );
    }

    // Update specific template
    const templates = contractor.templates || {};
    templates[templateKey] = {
      ...templates[templateKey],
      ...(message !== undefined && { message }),
      ...(enabled !== undefined && { enabled }),
      ...(delay_days !== undefined && { delay_days }),
    };

    // Save updated templates
    const { error: updateError } = await supabase
      .from("contractors")
      .update({ templates })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update template:", updateError);
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      );
    }

    // Log analytics event
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "template_edited",
      metadata: { template_key: templateKey },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * Get all templates
 * GET /api/settings/templates
 */
export async function GET() {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contractor, error } = await supabase
      .from("contractors")
      .select("templates")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: contractor?.templates || {} });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
