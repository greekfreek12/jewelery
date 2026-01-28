import { NextRequest, NextResponse } from "next/server";
function pressToAcceptTwiml(actionUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" timeout="4" action="${actionUrl}">
    <Say voice="alice">Press 1 to accept this call.</Say>
  </Gather>
  <Hangup />
</Response>`;
}

/**
 * Whisper prompt for press-to-accept.
 * URL: /api/textgrid/voice/whisper?contractorId=xxx
 */
export async function GET(request: NextRequest) {
  const contractorId = request.nextUrl.searchParams.get("contractorId") || "";
  const actionUrl = `${request.nextUrl.origin}/api/textgrid/voice/accepted?contractorId=${contractorId}`;
  return new NextResponse(pressToAcceptTwiml(actionUrl), {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: NextRequest) {
  await request.formData().catch(() => null);
  const contractorId = request.nextUrl.searchParams.get("contractorId") || "";
  const actionUrl = `${request.nextUrl.origin}/api/textgrid/voice/accepted?contractorId=${contractorId}`;
  return new NextResponse(pressToAcceptTwiml(actionUrl), {
    headers: { "Content-Type": "text/xml" },
  });
}
