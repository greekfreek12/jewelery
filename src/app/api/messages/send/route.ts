import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";

/**
 * Send SMS message from contractor's inbox
 * POST /api/messages/send
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
    const { contactId, message } = body;

    if (!contactId || !message) {
      return NextResponse.json(
        { error: "Missing contactId or message" },
        { status: 400 }
      );
    }

    // Get contractor's phone number
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, phone_number, subscription_status")
      .eq("id", user.id)
      .single();

    if (!contractor?.phone_number) {
      return NextResponse.json(
        { error: "No phone number assigned. Please complete setup." },
        { status: 400 }
      );
    }

    // Check subscription
    const activeStatuses = ["trialing", "active"];
    if (!activeStatuses.includes(contractor.subscription_status || "")) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Get contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, phone, name")
      .eq("id", contactId)
      .eq("contractor_id", user.id)
      .single();

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Get or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("contractor_id", user.id)
      .eq("contact_id", contactId)
      .single();

    if (!conversation) {
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          contractor_id: user.id,
          contact_id: contactId,
          status: "open",
          unread_count: 0,
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError);
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }
      conversation = newConversation;
    }

    // Send SMS via TextGrid
    const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const statusCallback = `${webhookBaseUrl}/api/textgrid/status/${user.id}`;

    const result = await sendSms(
      contractor.phone_number,
      contact.phone,
      message,
      statusCallback
    );

    // Store the message
    const { data: newMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        contractor_id: user.id,
        contact_id: contactId,
        conversation_id: conversation.id,
        direction: "outbound",
        channel: "sms",
        body: message,
        textgrid_sid: result.sid,
        status: result.status,
      })
      .select("id, created_at, body, status")
      .single();

    if (messageError) {
      console.error("Failed to store message:", messageError);
    }

    // Update conversation
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: message.substring(0, 100),
        status: "open",
      })
      .eq("id", conversation.id);

    // Update contact last_contacted_at
    await supabase
      .from("contacts")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", contactId);

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "message_sent",
      metadata: {
        channel: "sms",
        contact_id: contactId,
        to: contact.phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      textgridSid: result.sid,
    });
  } catch (error) {
    console.error("Send SMS error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
