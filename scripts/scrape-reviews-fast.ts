/**
 * FAST reviews scraper - 50 leads per batch
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APIFY_TOKEN = "apify_api_vnDxCCOzZF36qMg1kx9b66hlKByT4b1XzEZC";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 50;

async function scrapeReviewsBatch(leads: any[]) {
  const startUrls = leads.map(lead => ({
    url: `https://www.google.com/maps/place/?q=place_id:${lead.place_id}`
  }));

  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/compass~Google-Maps-Reviews-Scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls,
        maxReviews: 100,
        reviewsSort: "newest",
      }),
    }
  );

  const runData = await runResponse.json();
  const runId = runData.data.id;

  // Poll faster
  let status = "RUNNING";
  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    status = (await res.json()).data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);

  if (status !== "SUCCEEDED") return;

  const results = await (await fetch(
    `https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${APIFY_TOKEN}`
  )).json();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const reviewsByPlace: Record<string, any[]> = {};

  for (const r of results) {
    const placeId = r.placeId || r.url?.match(/place_id:([^&]+)/)?.[1];
    if (placeId) {
      if (!reviewsByPlace[placeId]) reviewsByPlace[placeId] = [];
      reviewsByPlace[placeId].push({
        author: r.name,
        rating: r.stars,
        text: r.text,
        date: r.publishedAtDate,
      });
    }
  }

  for (const lead of leads) {
    const reviews = reviewsByPlace[lead.place_id] || [];
    const last30 = reviews.filter(r => r.date && new Date(r.date).getTime() > thirtyDaysAgo).length;
    await supabase.from("leads_raw").update({
      google_reviews: reviews,
      reviews_last_30_days: last30,
      scraped_at: new Date().toISOString()
    }).eq("id", lead.id);
    console.log(`  ${reviews.length > 0 ? '✓' : '-'} ${lead.name}: ${reviews.length} reviews`);
  }
}

async function main() {
  const { data: leads } = await supabase
    .from("leads_raw")
    .select("id, name, place_id")
    .eq("status", "active")
    .is("google_reviews", null)
    .limit(1000);

  console.log(`\n=== FAST Reviews Scraper ===`);
  console.log(`${leads?.length} leads, ${BATCH_SIZE} per batch\n`);

  for (let i = 0; i < (leads?.length || 0); i += BATCH_SIZE) {
    const batch = leads!.slice(i, i + BATCH_SIZE);
    console.log(`\nBATCH ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(leads!.length/BATCH_SIZE)}`);
    await scrapeReviewsBatch(batch);
  }
  console.log("\n✅ Done!");
}

main().catch(console.error);
