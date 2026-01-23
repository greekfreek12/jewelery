import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";

/**
 * Get a single contact
 * GET /api/contacts/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contact, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (error || !contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Get conversation if exists
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, unread_count, last_message_at, last_message_preview")
      .eq("contact_id", id)
      .eq("contractor_id", user.id)
      .single();

    // Get review requests
    const { data: reviewRequests } = await supabase
      .from("review_requests")
      .select("id, status, rating, sent_at, replied_at, reviewed_at")
      .eq("contact_id", id)
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      contact,
      conversation,
      reviewRequests: reviewRequests || [],
    });
  } catch (error) {
    console.error("Get contact error:", error);
    return NextResponse.json(
      { error: "Failed to get contact" },
      { status: 500 }
    );
  }
}

/**
 * Update a contact
 * PUT /api/contacts/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    // Verify ownership
    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) {
      const normalizedPhone = phone.replace(/\D/g, "");
      updates.phone = normalizedPhone.startsWith("1")
        ? `+${normalizedPhone}`
        : `+1${normalizedPhone}`;
    }
    if (email !== undefined) updates.email = email || null;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes || null;

    const { data: contact, error } = await supabase
      .from("contacts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update contact:", error);
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

/**
 * Delete a contact
 * DELETE /api/contacts/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("contacts")
      .select("id")
      .eq("id", id)
      .eq("contractor_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete contact:", error);
      return NextResponse.json(
        { error: "Failed to delete contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
