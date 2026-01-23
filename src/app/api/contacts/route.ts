import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * List all contacts
 * GET /api/contacts
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

    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("id, name, phone, email, tags, has_left_review, opted_out, created_at")
      .eq("contractor_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch contacts:", error);
      return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }

    return NextResponse.json({ contacts: contacts || [] });
  } catch (error) {
    console.error("List contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

/**
 * Create a new contact
 * POST /api/contacts
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, tags, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, "");
    const formattedPhone = normalizedPhone.startsWith("1")
      ? `+${normalizedPhone}`
      : `+1${normalizedPhone}`;

    // Check for existing contact with same phone
    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .eq("contractor_id", user.id)
      .eq("phone", formattedPhone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A contact with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create contact
    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({
        contractor_id: user.id,
        name,
        phone: formattedPhone,
        email: email || null,
        tags: tags || [],
        notes: notes || null,
        source: "manual",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create contact:", error);
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "contact_created",
      metadata: { contact_id: contact.id, source: "manual" },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
