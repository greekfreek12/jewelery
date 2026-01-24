import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { parseFormData, emptyTwiml, voicemailTwiml } from "@/lib/textgrid/webhook";
import { sendSms } from "@/lib/textgrid/client";

/**
 * Voice call status callback from TextGrid
 * Called after Dial completes to know if call was answered
 * URL: /api/textgrid/voice/status
 */
export async function POST(request: NextRequest) {
  console.log("=== STATUS WEBHOOK HIT ===");

  try {
    const formData = await request.formData();
    const data = parseFormData(formData);

    console.log("=== STATUS WEBHOOK DATA (ALL PARAMS) ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("=========================================");

    const callSid = data.CallSid;
    const dialCallStatus = data.DialCallStatus; // completed, no-answer, busy, failed
    const dialCallDuration = parseInt(data.DialCallDuration || "0", 10); // Duration in seconds
    const from = data.From; // Original caller
    const to = data.To; // Business number (contractor's TextGrid number)

    console.log(`Call status: ${dialCallStatus}, duration: ${dialCallDuration}s, from: ${from}, to: ${to}`);

    // If call was answered AND talked for more than 15 seconds, it's a real answer
    // Short "completed" calls are likely carrier voicemail answering
    if (dialCallStatus === "completed" && dialCallDuration > 15) {
      console.log(`Real answer detected (duration: ${dialCallDuration}s > 15s), not sending auto-text`);
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // If completed but short duration (< 15 sec), treat as voicemail pickup
    if (dialCallStatus === "completed" && dialCallDuration <= 15) {
      console.log(`Short "completed" call (${dialCallDuration}s) - likely carrier voicemail, treating as missed`);
      // Fall through to missed call handling below
    }

    // Call was missed: no-answer, busy, failed, OR short "completed" (carrier voicemail)
    const supabase = createApiServiceClient();

    // Find contractor by their TextGrid phone number
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, phone_number, business_name, feature_missed_call_text, templates")
      .eq("phone_number", to)
      .single();

    if (!contractor) {
      console.error(`Contractor not found for number: ${to}`);
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Log missed call with duration info
    await supabase.from("analytics_events").insert({
      contractor_id: contractor.id,
      event_type: "call_missed",
      metadata: {
        from,
        dial_status: dialCallStatus,
        dial_duration: dialCallDuration,
        call_sid: callSid,
        reason: dialCallStatus === "completed" ? "carrier_voicemail_likely" : dialCallStatus,
      },
    });

    // Check if auto-text is enabled
    if (!contractor.feature_missed_call_text) {
      console.log(`Missed call auto-text disabled for contractor ${contractor.id}`);
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Get missed call template
    const templates = contractor.templates as Record<string, { enabled?: boolean; message: string }> | null;
    const missedCallTemplate = templates?.missed_call;

    if (!missedCallTemplate?.enabled) {
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Replace template variables
    let message = missedCallTemplate.message ||
      "Sorry we missed your call! We'll get back to you shortly. - {{business_name}}";
    message = message.replace(/\{\{business_name\}\}/g, contractor.business_name || "");

    // Send auto-text
    try {
      const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const statusCallback = `${webhookBaseUrl}/api/textgrid/status/${contractor.id}`;

      const result = await sendSms(
        to, // From: business number
        from, // To: caller
        message,
        statusCallback
      );

      console.log(`Missed call auto-text sent: ${result.sid}`);

      // Find or create contact and conversation to log the auto-text
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("contractor_id", contractor.id)
        .eq("phone", from)
        .single();

      if (contact) {
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("contractor_id", contractor.id)
          .eq("contact_id", contact.id)
          .single();

        if (conversation) {
          // Log the auto-text as an outbound message
          await supabase.from("messages").insert({
            contractor_id: contractor.id,
            contact_id: contact.id,
            conversation_id: conversation.id,
            direction: "outbound",
            channel: "sms",
            body: message,
            textgrid_sid: result.sid,
            status: "queued",
          });

          // Update conversation
          await supabase
            .from("conversations")
            .update({
              last_message_at: new Date().toISOString(),
              last_message_preview: message.substring(0, 100),
            })
            .eq("id", conversation.id);
        }
      }
    } catch (smsError) {
      console.error("Failed to send missed call auto-text:", smsError);
    }

    // Return voicemail TwiML so caller can leave a message
    const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const recordingCallbackUrl = `${webhookBaseUrl}/api/textgrid/voice/recording?contractorId=${contractor.id}&callerPhone=${encodeURIComponent(from)}`;

    console.log("Returning voicemail TwiML for caller to leave message");
    return new NextResponse(
      voicemailTwiml(contractor.business_name, recordingCallbackUrl),
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("Voice status webhook error:", error);
    return new NextResponse(emptyTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
