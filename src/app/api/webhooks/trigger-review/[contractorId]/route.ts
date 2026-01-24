import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { sendSms } from "@/lib/textgrid/client";

/**
 * External webhook for triggering review requests
 * Called by Make.com (Jobber, Housecall Pro, QuickBooks integrations)
 *
 * POST /api/webhooks/trigger-review/[contractorId]
 *
 * Body:
 * {
 *   "contact_phone": "+15551234567",    // Required
 *   "contact_name": "John Smith",        // Required
 *   "contact_email": "john@example.com", // Optional
 *   "job_type": "AC Repair",             // Optional - for personalization
 *   "tech_name": "Carlos",               // Optional - for personalization
 *   "source": "jobber"                   // Optional - tracking
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractorId: string }> }
) {
  try {
    const { contractorId } = await params;

    if (!contractorId) {
      return NextResponse.json(
        { error: "Contractor ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      contact_phone,
      contact_name,
      contact_email,
      job_type,
      tech_name,
      source = "webhook"
    } = body;

    // Validate required fields
    if (!contact_phone) {
      return NextResponse.json(
        { error: "contact_phone is required" },
        { status: 400 }
      );
    }

    if (!contact_name) {
      return NextResponse.json(
        { error: "contact_name is required" },
        { status: 400 }
      );
    }

    // Normalize phone number (basic cleanup)
    const normalizedPhone = normalizePhone(contact_phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Use service client (no user session for webhooks)
    const supabase = createApiServiceClient();

    // Get contractor
    const { data: contractor, error: contractorError } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", contractorId)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }

    // Check contractor has phone configured
    if (!contractor.phone_number) {
      return NextResponse.json(
        { error: "Contractor phone not configured" },
        { status: 400 }
      );
    }

    // Check subscription is active
    if (!["trialing", "active"].includes(contractor.subscription_status)) {
      return NextResponse.json(
        { error: "Contractor subscription not active" },
        { status: 403 }
      );
    }

    // Check review automation is enabled
    if (!contractor.feature_review_automation) {
      return NextResponse.json(
        { error: "Review automation is disabled for this contractor" },
        { status: 403 }
      );
    }

    // Find or create contact
    let contact;
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("*")
      .eq("contractor_id", contractorId)
      .eq("phone", normalizedPhone)
      .single();

    if (existingContact) {
      contact = existingContact;

      // Update name if provided and different
      if (contact_name && contact.name !== contact_name) {
        await supabase
          .from("contacts")
          .update({
            name: contact_name,
            ...(contact_email && { email: contact_email }),
          })
          .eq("id", contact.id);
        contact.name = contact_name;
      }
    } else {
      // Create new contact
      const { data: newContact, error: createError } = await supabase
        .from("contacts")
        .insert({
          contractor_id: contractorId,
          phone: normalizedPhone,
          name: contact_name,
          email: contact_email || null,
          source: "import", // Webhook-created contacts
          tags: source ? [source] : [],
        })
        .select()
        .single();

      if (createError || !newContact) {
        console.error("Failed to create contact:", createError);
        return NextResponse.json(
          { error: "Failed to create contact" },
          { status: 500 }
        );
      }

      contact = newContact;
    }

    // Check if contact opted out
    if (contact.opted_out) {
      return NextResponse.json(
        { error: "Contact has opted out of messages" },
        { status: 400 }
      );
    }

    // Check for existing pending review request (prevent duplicates)
    const { data: existingRequest } = await supabase
      .from("review_requests")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("contractor_id", contractorId)
      .in("status", ["sent", "reminded_1", "reminded_2"])
      .single();

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: "Review request already pending for this contact",
        skipped: true,
        contact_id: contact.id,
      });
    }

    // Check cooldown - don't send if reviewed in last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentReview } = await supabase
      .from("review_requests")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("contractor_id", contractorId)
      .gte("created_at", ninetyDaysAgo)
      .limit(1)
      .single();

    if (recentReview) {
      return NextResponse.json({
        success: true,
        message: "Contact received review request within last 90 days",
        skipped: true,
        contact_id: contact.id,
      });
    }

    // Build the review message
    const templates = contractor.templates || {};
    let reviewTemplate = templates.review_request?.message ||
      "Hey {{contact_name}}, thanks for choosing {{business_name}}! How'd we do? Reply 1-5";

    // Personalize with tech name and job type if provided
    if (tech_name && job_type) {
      reviewTemplate = `Hey {{contact_name}}, how was your ${job_type} with ${tech_name} from {{business_name}}? Reply 1-5`;
    } else if (tech_name) {
      reviewTemplate = `Hey {{contact_name}}, how was your service with ${tech_name} from {{business_name}}? Reply 1-5`;
    } else if (job_type) {
      reviewTemplate = `Hey {{contact_name}}, how was your ${job_type} with {{business_name}}? Reply 1-5`;
    }

    // Render template
    const message = reviewTemplate
      .replace(/\{\{contact_name\}\}/g, contact.name.split(" ")[0]) // First name
      .replace(/\{\{business_name\}\}/g, contractor.business_name);

    // Calculate next drip time
    const dripEnabled = contractor.feature_review_drip;
    const reminder1Days = templates.review_reminder_1?.delay_days || 3;
    const nextDripAt = dripEnabled
      ? new Date(Date.now() + reminder1Days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create review request record
    const { data: reviewRequest, error: insertError } = await supabase
      .from("review_requests")
      .insert({
        contractor_id: contractorId,
        contact_id: contact.id,
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
    const statusCallback = `${baseUrl}/api/textgrid/status/${contractorId}`;

    try {
      await sendSms(
        contractor.phone_number,
        normalizedPhone,
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
      contractor_id: contractorId,
      event_type: "review_request_sent",
      metadata: {
        contact_id: contact.id,
        review_request_id: reviewRequest.id,
        source: source,
        job_type: job_type || null,
        tech_name: tech_name || null,
        triggered_by: "webhook",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review request sent",
      contact_id: contact.id,
      review_request_id: reviewRequest.id,
    });

  } catch (error) {
    console.error("Webhook trigger-review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Normalize phone number to E.164-ish format
 * Handles common formats: (555) 123-4567, 555-123-4567, 5551234567, +15551234567
 */
function normalizePhone(phone: string): string | null {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +, keep it; otherwise assume US
  if (!cleaned.startsWith("+")) {
    // Remove leading 1 if present (US country code)
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }

    // Must be 10 digits for US
    if (cleaned.length !== 10) {
      return null;
    }

    // Add US country code
    cleaned = "+1" + cleaned;
  }

  // Basic validation: must be at least 11 chars (+1 plus 10 digits)
  if (cleaned.length < 11) {
    return null;
  }

  return cleaned;
}

// Also support GET for testing/health check
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractorId: string }> }
) {
  const { contractorId } = await params;

  return NextResponse.json({
    status: "ok",
    endpoint: "trigger-review",
    contractor_id: contractorId,
    method: "POST",
    required_fields: ["contact_phone", "contact_name"],
    optional_fields: ["contact_email", "job_type", "tech_name", "source"],
  });
}
