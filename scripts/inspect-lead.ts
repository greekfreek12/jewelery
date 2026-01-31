import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const leadName = process.argv[2] || "Robbins Plumbing and Drain Cleaning LLC";

  const { data: lead } = await supabase
    .from("leads_raw")
    .select("*")
    .eq("name", leadName)
    .single();

  if (!lead) {
    console.log("Lead not found:", leadName);
    return;
  }

  console.log("═".repeat(70));
  console.log("LEAD INSPECTION:", lead.name);
  console.log("═".repeat(70));

  console.log("\n📍 BASIC INFO:");
  console.log("  Name:", lead.name);
  console.log("  City:", lead.city, "| State:", lead.state);
  console.log("  Phone:", lead.phone);
  console.log("  Rating:", lead.rating, "|", lead.reviews, "reviews");
  console.log("  Category:", lead.category);
  console.log("  Subtypes:", lead.subtypes);

  console.log("\n🖼️  LOGO URL:");
  console.log(" ", lead.logo || "(none)");

  const photos = lead.google_photos || [];
  console.log(`\n📸 GOOGLE PHOTOS (${photos.length} total, showing first 10):`);
  photos.slice(0, 10).forEach((p: string, i: number) => {
    console.log(`  ${i + 1}. ${p}`);
  });

  const reviews = lead.google_reviews || [];
  console.log(`\n⭐ REVIEWS (${reviews.length} total, showing first 5):`);
  reviews.slice(0, 5).forEach((r: any, i: number) => {
    console.log(`\n  [${i + 1}] ${r.author} - ${r.rating}★`);
    const text = r.text || "(no text)";
    console.log(`      "${text.substring(0, 200)}${text.length > 200 ? "..." : ""}"`);
  });

  console.log("\n⏰ WORKING HOURS:");
  console.log(" ", JSON.stringify(lead.working_hours));

  console.log("\n🔗 SOCIAL:");
  console.log("  Facebook:", lead.facebook || "(none)");
  console.log("  Instagram:", lead.instagram || "(none)");
}

main().catch(console.error);
