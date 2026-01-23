import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import {
  parseFormData,
  forwardCallTwiml,
  missedCallTwiml,
} from "@/lib/textgrid/webhook";

/**
 * Incoming voice call webhook from TextGrid
 * URL: /api/textgrid/voice/[contractorId]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractorId: string }> }
) {
  const { contractorId } = await params;

  try {
    const formData = await request.formData();
    const data = parseFormData(formData);

    const from = data.From;
    const to = data.To;
    const callSid = data.CallSid;
    const callStatus = data.CallStatus;

    console.log(`Incoming call: ${from} -> ${to}, status: ${callStatus}`);

    const supabase = createApiServiceClient();

    // Get contractor's forwarding number
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, phone_number, forwarding_number, business_name")
      .eq("id", contractorId)
      .single();

    if (!contractor) {
      console.error(`Contractor not found: ${contractorId}`);
      return new NextResponse(missedCallTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Find or create contact
    if (from) {
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("contractor_id", contractorId)
        .eq("phone", from)
        .single();

      let contactId: string;

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const { data: newContact } = await supabase
          .from("contacts")
          .insert({
            contractor_id: contractorId,
            phone: from,
            name: from,
            source: "call",
          })
          .select("id")
          .single();
        contactId = newContact?.id || "";
      }

      // Log the call
      if (contactId) {
        // Find or create conversation
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("contractor_id", contractorId)
          .eq("contact_id", contactId)
          .single();

        const conversationId = conversation?.id;

        if (conversationId) {
          // Log call as a message
          await supabase.from("messages").insert({
            contractor_id: contractorId,
            contact_id: contactId,
            conversation_id: conversationId,
            direction: "inbound",
            channel: "call",
            body: `Incoming call from ${from}`,
            textgrid_sid: callSid,
            status: "received",
          });
        }
      }

      // Log analytics
      await supabase.from("analytics_events").insert({
        contractor_id: contractorId,
        event_type: "call_inbound",
        metadata: {
          from,
          call_sid: callSid,
        },
      });
    }

    // Forward call if forwarding number is set
    if (contractor.forwarding_number) {
      // Log that we're forwarding
      await supabase.from("analytics_events").insert({
        contractor_id: contractorId,
        event_type: "call_forwarded",
        metadata: {
          from,
          forwarding_to: contractor.forwarding_number,
          call_sid: callSid,
        },
      });

      return new NextResponse(
        forwardCallTwiml(contractor.forwarding_number, to, 30),
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // No forwarding number - play missed call message
    return new NextResponse(missedCallTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Voice webhook error:", error);
    return new NextResponse(missedCallTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
