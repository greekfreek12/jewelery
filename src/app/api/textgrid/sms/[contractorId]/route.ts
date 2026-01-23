import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { emptyTwiml, parseFormData, smsReplyTwiml } from "@/lib/textgrid/webhook";
import { parseRatingFromMessage, renderTemplate } from "@/lib/reviews/templates";

/**
 * Incoming SMS webhook from TextGrid
 * URL: /api/textgrid/sms/[contractorId]
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
    const body = data.Body || "";
    const messageSid = data.MessageSid;

    if (!from || !to) {
      console.error("Missing From or To in SMS webhook");
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const supabase = createApiServiceClient();

    // Verify contractor exists
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, phone_number, business_name, feature_missed_call_text")
      .eq("id", contractorId)
      .single();

    if (!contractor) {
      console.error(`Contractor not found: ${contractorId}`);
      return new NextResponse(emptyTwiml(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Find or create contact
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("id")
      .eq("contractor_id", contractorId)
      .eq("phone", from)
      .single();

    let contactId: string;

    if (existingContact) {
      contactId = existingContact.id;
      // Update last contacted
      await supabase
        .from("contacts")
        .update({ last_contacted_at: new Date().toISOString() })
        .eq("id", contactId);
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from("contacts")
        .insert({
          contractor_id: contractorId,
          phone: from,
          name: from, // Default to phone number, can be updated later
          source: "sms",
        })
        .select("id")
        .single();

      if (contactError || !newContact) {
        console.error("Failed to create contact:", contactError);
        return new NextResponse(emptyTwiml(), {
          headers: { "Content-Type": "text/xml" },
        });
      }
      contactId = newContact.id;
    }

    // Find or create conversation
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("contractor_id", contractorId)
      .eq("contact_id", contactId)
      .single();

    let conversationId: string;

    if (existingConversation) {
      conversationId = existingConversation.id;
      // Update conversation
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: body.substring(0, 100),
          unread_count: 1, // TODO: Use RPC to increment atomically
          status: "open",
        })
        .eq("id", conversationId);
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          contractor_id: contractorId,
          contact_id: contactId,
          status: "open",
          unread_count: 1,
          last_message_at: new Date().toISOString(),
          last_message_preview: body.substring(0, 100),
        })
        .select("id")
        .single();

      if (convError || !newConversation) {
        console.error("Failed to create conversation:", convError);
        return new NextResponse(emptyTwiml(), {
          headers: { "Content-Type": "text/xml" },
        });
      }
      conversationId = newConversation.id;
    }

    // Store the message
    const { error: messageError } = await supabase.from("messages").insert({
      contractor_id: contractorId,
      contact_id: contactId,
      conversation_id: conversationId,
      direction: "inbound",
      channel: "sms",
      body,
      textgrid_sid: messageSid,
      status: "received",
    });

    if (messageError) {
      console.error("Failed to store message:", messageError);
    }

    // Log analytics event
    await supabase.from("analytics_events").insert({
      contractor_id: contractorId,
      event_type: "message_received",
      metadata: {
        channel: "sms",
        contact_id: contactId,
        from,
      },
    });

    // Check for pending review request and parse rating
    const rating = parseRatingFromMessage(body);
    let autoReplyMessage: string | null = null;

    if (rating !== null) {
      // Look for pending review request
      const { data: pendingRequest } = await supabase
        .from("review_requests")
        .select("id, status")
        .eq("contact_id", contactId)
        .eq("contractor_id", contractorId)
        .in("status", ["sent", "reminded_1", "reminded_2"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (pendingRequest) {
        // Get contractor templates and settings
        const { data: fullContractor } = await supabase
          .from("contractors")
          .select("templates, google_review_link, feature_review_automation")
          .eq("id", contractorId)
          .single();

        if (fullContractor?.feature_review_automation) {
          const templates = fullContractor.templates || {};
          const isPositive = rating >= 4;

          // Update review request
          const newStatus = isPositive ? "replied" : "negative";
          await supabase
            .from("review_requests")
            .update({
              status: newStatus,
              rating,
              replied_at: new Date().toISOString(),
              next_drip_at: null, // Stop drip sequence
            })
            .eq("id", pendingRequest.id);

          // Update contact's has_left_review if positive
          if (isPositive) {
            await supabase
              .from("contacts")
              .update({ has_left_review: false }) // Will be true after they actually leave review
              .eq("id", contactId);
          }

          // Get contact name for template
          const { data: contactData } = await supabase
            .from("contacts")
            .select("name")
            .eq("id", contactId)
            .single();

          // Prepare auto-reply based on rating
          if (isPositive) {
            const template = templates.review_positive?.message ||
              "Awesome, thank you! Would you mind leaving us a quick Google review? {{review_link}}";
            autoReplyMessage = renderTemplate(template, {
              business_name: contractor.business_name,
              contact_name: contactData?.name?.split(" ")[0] || "",
              review_link: fullContractor.google_review_link || "",
            });

            // Log positive review event
            await supabase.from("analytics_events").insert({
              contractor_id: contractorId,
              event_type: "review_positive",
              metadata: {
                contact_id: contactId,
                review_request_id: pendingRequest.id,
                rating,
              },
            });
          } else {
            const template = templates.review_negative?.message ||
              "We're sorry to hear that. Someone will reach out to make it right.";
            autoReplyMessage = renderTemplate(template, {
              business_name: contractor.business_name,
              contact_name: contactData?.name?.split(" ")[0] || "",
            });

            // Log negative review event
            await supabase.from("analytics_events").insert({
              contractor_id: contractorId,
              event_type: "review_negative",
              metadata: {
                contact_id: contactId,
                review_request_id: pendingRequest.id,
                rating,
              },
            });
          }

          // Log reply event
          await supabase.from("analytics_events").insert({
            contractor_id: contractorId,
            event_type: "review_reply",
            metadata: {
              contact_id: contactId,
              review_request_id: pendingRequest.id,
              rating,
            },
          });
        }
      }
    }

    // TODO: Send push notification to contractor

    // Return TwiML with auto-reply if we have one
    if (autoReplyMessage) {
      return new NextResponse(smsReplyTwiml(autoReplyMessage), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Return empty TwiML (no auto-reply)
    return new NextResponse(emptyTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new NextResponse(emptyTwiml(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
