import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api-client";
import { searchAvailableNumbers } from "@/lib/textgrid/client";

/**
 * Search for available phone numbers
 * GET /api/phone/search?areaCode=504
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const areaCode = request.nextUrl.searchParams.get("areaCode") || undefined;

    const numbers = await searchAvailableNumbers(areaCode);

    return NextResponse.json({
      numbers: numbers.slice(0, 10), // Return max 10 options
    });
  } catch (error) {
    console.error("Phone search error:", error);
    return NextResponse.json(
      { error: "Failed to search phone numbers" },
      { status: 500 }
    );
  }
}
