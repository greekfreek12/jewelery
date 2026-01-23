import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";
import { renderTemplate } from "@/lib/reviews/templates";

/**
 * Send a review request to a contact
 * POST /api/reviews/send
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
    const { contactId, campaignId } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Get contractor settings
    const { data: contractor, error: contractorError } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", user.id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    if (!contractor.phone_number) {
      return NextResponse.json(
        { error: "No phone number configured. Please set up your phone first." },
        { status: 400 }
      );
    }

    if (!contractor.feature_review_automation) {
      return NextResponse.json(
        { error: "Review automation is disabled" },
        { status: 403 }
      );
    }

    // Get contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("contractor_id", user.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    if (contact.opted_out) {
      return NextResponse.json(
        { error: "Contact has opted out of messages" },
        { status: 400 }
      );
    }

    // Check for existing pending review request
    const { data: existingRequest } = await supabase
      .from("review_requests")
      .select("id")
      .eq("contact_id", contactId)
      .eq("contractor_id", user.id)
      .in("status", ["sent", "reminded_1", "reminded_2"])
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: "A review request is already pending for this contact" },
        { status: 409 }
      );
    }

    // Get templates
    const templates = contractor.templates || {};
    const reviewTemplate = templates.review_request?.message ||
      "Hey {{contact_name}}, thanks for choosing {{business_name}}! How'd we do? Reply 1-5";

    // Render the message
    const message = renderTemplate(reviewTemplate, {
      business_name: contractor.business_name,
      contact_name: contact.name.split(" ")[0], // First name only
    });

    // Calculate next drip time (if drip is enabled)
    const dripEnabled = contractor.feature_review_drip;
    const reminder1Days = templates.review_reminder_1?.delay_days || 3;
    const nextDripAt = dripEnabled
      ? new Date(Date.now() + reminder1Days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create review request record
    const { data: reviewRequest, error: insertError } = await supabase
      .from("review_requests")
      .insert({
        contractor_id: user.id,
        contact_id: contactId,
        campaign_id: campaignId || null,
        status: "sent",
        drip_step: 0,
        next_drip_at: nextDripAt,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create review request:", insertError);
      return NextResponse.json(
        { error: "Failed to create review request" },
        { status: 500 }
      );
    }

    // Send the SMS
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";
    const statusCallback = `${baseUrl}/api/textgrid/status/${user.id}`;

    try {
      await sendSms(
        contractor.phone_number,
        contact.phone,
        message,
        statusCallback
      );
    } catch (smsError) {
      // Mark as failed
      await supabase
        .from("review_requests")
        .update({ status: "stopped" })
        .eq("id", reviewRequest.id);

      console.error("SMS send failed:", smsError);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: 500 }
      );
    }

    // Log analytics event
    await supabase.from("analytics_events").insert({
      contractor_id: user.id,
      event_type: "review_request_sent",
      metadata: {
        contact_id: contactId,
        review_request_id: reviewRequest.id,
        campaign_id: campaignId || null,
      },
    });

    return NextResponse.json({
      success: true,
      reviewRequest,
    });
  } catch (error) {
    console.error("Send review request error:", error);
    return NextResponse.json(
      { error: "Failed to send review request" },
      { status: 500 }
    );
  }
}
