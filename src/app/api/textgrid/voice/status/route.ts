import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import {
  parseFormData,
  emptyTwiml,
  voicemailTwiml,
  getWebhookBaseUrl,
  normalizePhoneNumber,
} from "@/lib/textgrid/webhook";
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
    // TextGrid sends CallStatus/CallDuration, Twilio sends DialCallStatus/DialCallDuration
    // Check both to support either provider
    const dialCallStatus = data.DialCallStatus || data.CallStatus; // completed, no-answer, busy, failed
    const dialCallDuration = parseInt(data.DialCallDuration || data.CallDuration || "0", 10); // Duration in seconds
    const from = normalizePhoneNumber(data.From); // Original caller
    const to = normalizePhoneNumber(data.To); // Business number (contractor's TextGrid number)

      console.log(`Call status: ${dialCallStatus}, duration: ${dialCallDuration}s, from: ${from}, to: ${to}`);

    const voicemailThresholdSeconds = 25;

    // If call was answered AND talked for more than the voicemail threshold, it's a real answer
    // Short "completed" calls are likely carrier voicemail answering
    if (dialCallStatus === "completed" && dialCallDuration > voicemailThresholdSeconds) {
      console.log(
        `Real answer detected (duration: ${dialCallDuration}s > ${voicemailThresholdSeconds}s), not sending auto-text`
      );
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // If completed but short duration, treat as voicemail pickup
    if (dialCallStatus === "completed" && dialCallDuration <= voicemailThresholdSeconds) {
      console.log(
        `Short "completed" call (${dialCallDuration}s) - likely carrier voicemail, treating as missed`
      );
      // Fall through to missed call handling below
    }

    // Call was missed: no-answer, busy, failed, OR short "completed" (carrier voicemail)
    const supabase = createApiServiceClient();
    const contractorId = request.nextUrl.searchParams.get("contractorId");

    const contractorQuery = supabase
      .from("contractors")
      .select("id, phone_number, business_name, feature_missed_call_text, templates");
    const { data: contractor } = contractorId
      ? await contractorQuery.eq("id", contractorId).single()
      : await contractorQuery.eq("phone_number", to).single();

    if (!contractor) {
      console.error(`Contractor not found for number: ${to}`);
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    await supabase.from("analytics_events").insert({
      contractor_id: contractor.id,
      event_type: "call_status_callback",
      metadata: {
        payload: data,
        call_sid: callSid,
        dial_status: dialCallStatus,
        dial_duration: dialCallDuration,
        from,
        to,
      },
    });

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
      const webhookBaseUrl = getWebhookBaseUrl();
      const statusCallback = `${webhookBaseUrl}/api/textgrid/status/${contractor.id}`;

      const result = await sendSms(
        to, // From: business number
        from, // To: caller
        message,
        statusCallback
      );

      console.log(`Missed call auto-text sent: ${result.sid}`);
      await supabase.from("analytics_events").insert({
        contractor_id: contractor.id,
        event_type: "missed_call_text_sent",
        metadata: {
          to: from,
          from: to,
          message_sid: result.sid,
          call_sid: callSid,
        },
      });

      // Find or create contact and conversation to log the auto-text
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("contractor_id", contractor.id)
        .eq("phone", from)
        .single();

      let contactId = existingContact?.id;
      if (!contactId) {
        const { data: newContact } = await supabase
          .from("contacts")
          .insert({
            contractor_id: contractor.id,
            phone: from,
            name: from,
            source: "call",
          })
          .select("id")
          .single();
        contactId = newContact?.id;
      }

      if (contactId) {
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("contractor_id", contractor.id)
          .eq("contact_id", contactId)
          .single();

        if (conversation) {
          // Log the auto-text as an outbound message
          await supabase.from("messages").insert({
            contractor_id: contractor.id,
            contact_id: contactId,
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
      await supabase.from("analytics_events").insert({
        contractor_id: contractor.id,
        event_type: "missed_call_text_failed",
        metadata: {
          to: from,
          from: to,
          call_sid: callSid,
          error: smsError instanceof Error ? smsError.message : String(smsError),
        },
      });
    }

    // Return voicemail TwiML so caller can leave a message
    const webhookBaseUrl = getWebhookBaseUrl();
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
