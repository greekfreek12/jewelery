import { NextRequest, NextResponse } from "next/server";
import { createApiServiceClient } from "@/lib/supabase/api-client";
import { parseFormData, emptyTwiml } from "@/lib/textgrid/webhook";

/**
 * Handles digit press from press-to-accept whisper.
 * URL: /api/textgrid/voice/accepted?contractorId=xxx
 */
export async function POST(request: NextRequest) {
  const contractorId = request.nextUrl.searchParams.get("contractorId") || "";
  const formData = await request.formData();
  const data = parseFormData(formData);

  const digits = data.Digits || data.Digit || "";
  const callSid = data.CallSid || "";
  const from = data.From || "";
  const to = data.To || "";

  if (contractorId) {
    const supabase = createApiServiceClient();
    await supabase.from("analytics_events").insert({
      contractor_id: contractorId,
      event_type: "call_press_accept",
      metadata: {
        digits,
        call_sid: callSid,
        from,
        to,
      },
    });
  }

  if (digits === "1") {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Connecting.</Say></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup /></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return new NextResponse(emptyTwiml(), {
    headers: { "Content-Type": "text/xml" },
  });
}
