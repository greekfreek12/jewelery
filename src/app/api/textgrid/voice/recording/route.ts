import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import {
  parseFormData,
  emptyTwiml,
  normalizePhoneNumber,
} from "@/lib/textgrid/webhook";

/**
 * Voicemail recording callback from TextGrid
 * Called after caller leaves a voicemail
 * URL: /api/textgrid/voice/recording?contractorId=xxx&callerPhone=xxx
 */
export async function POST(request: NextRequest) {
  console.log("=== RECORDING WEBHOOK HIT ===");

  try {
    const formData = await request.formData();
    const data = parseFormData(formData);

    // Get contractor and caller from query params
    const contractorId = request.nextUrl.searchParams.get("contractorId");
    const callerPhone = normalizePhoneNumber(request.nextUrl.searchParams.get("callerPhone"));

    const recordingUrl = data.RecordingUrl;
    const recordingDuration = data.RecordingDuration;
    const callSid = data.CallSid;

    console.log("Recording received:", {
      contractorId,
      callerPhone,
      recordingUrl,
      recordingDuration,
      callSid,
    });

    if (!contractorId || !callerPhone || !recordingUrl) {
      console.error("Missing required params for recording");
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const supabase = createApiServiceClient();

    // Find the contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("contractor_id", contractorId)
      .eq("phone", callerPhone)
      .single();

    if (contact) {
      // Find conversation
      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("contractor_id", contractorId)
        .eq("contact_id", contact.id)
        .single();

      if (conversation) {
        // Log the voicemail as a message
        await supabase.from("messages").insert({
          contractor_id: contractorId,
          contact_id: contact.id,
          conversation_id: conversation.id,
          direction: "inbound",
          channel: "voicemail",
          body: `Voicemail (${recordingDuration}s)`,
          textgrid_sid: callSid,
          status: "received",
          media_urls: [recordingUrl],
        });

        // Update conversation
        await supabase
          .from("conversations")
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: `Voicemail (${recordingDuration}s)`,
            unread_count: supabase.rpc("increment_unread_count", {
              conv_id: conversation.id,
            }),
          })
          .eq("id", conversation.id);

        console.log("Voicemail saved to conversation");
      }
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      contractor_id: contractorId,
      event_type: "voicemail_received",
      metadata: {
        from: callerPhone,
        recording_url: recordingUrl,
        duration: recordingDuration,
        call_sid: callSid,
      },
    });

    // Return empty TwiML to end the call
    return new NextResponse(emptyTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Recording webhook error:", error);
    return new NextResponse(emptyTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
