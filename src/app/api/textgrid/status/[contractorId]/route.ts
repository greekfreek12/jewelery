import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { parseFormData } from "@/lib/textgrid/webhook";

/**
 * SMS delivery status callback from TextGrid
 * URL: /api/textgrid/status/[contractorId]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractorId: string }> }
) {
  const { contractorId } = await params;

  try {
    const formData = await request.formData();
    const data = parseFormData(formData);

    const messageSid = data.MessageSid || data.SmsSid;
    const messageStatus = data.MessageStatus; // queued, sent, delivered, undelivered, failed
    const errorCode = data.ErrorCode;
    const errorMessage = data.ErrorMessage;

    console.log(`SMS status update: ${messageSid} -> ${messageStatus}`);

    const supabase = createApiServiceClient();

    // Update message status
    const updateData: Record<string, string | null> = {
      status: messageStatus,
    };

    if (messageStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("textgrid_sid", messageSid)
      .eq("contractor_id", contractorId);

    if (error) {
      console.error("Failed to update message status:", error);
    }

    // Log failed messages
    if (messageStatus === "failed" || messageStatus === "undelivered") {
      await supabase.from("analytics_events").insert({
        contractor_id: contractorId,
        event_type: "message_failed",
        metadata: {
          message_sid: messageSid,
          status: messageStatus,
          error_code: errorCode,
          error_message: errorMessage,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Status webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
