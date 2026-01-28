/**
 * FAST batch scraper - sends 20 leads at once to Apify
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APIFY_TOKEN = "apify_api_vnDxCCOzZF36qMg1kx9b66hlKByT4b1XzEZC";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BATCH_SIZE = 20;

async function runApifyActor(actorId: string, input: any): Promise<any[]> {
  const encodedActorId = actorId.replace("/", "~");
  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/${encodedActorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runResponse.ok) {
    const error = await runResponse.text();
    throw new Error(`Failed to start actor: ${error}`);
  }

  const runData = await runResponse.json();
  const runId = runData.data.id;

  // Poll for completion - faster polling
  let status = "RUNNING";
  let attempts = 0;
  while ((status === "RUNNING" || status === "READY") && attempts < 300) {
    await new Promise((r) => setTimeout(r, 2000)); // 2 sec instead of 5
    attempts++;

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;

    if (attempts % 15 === 0) {
      console.log(`    Still running... (${attempts * 2}s)`);
    }
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Actor run failed with status: ${status}`);
  }

  const datasetId = runData.data.defaultDatasetId;
  const resultsResponse = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
  );
  return await resultsResponse.json();
}

async function scrapePhotosBatch(leads: any[]) {
  console.log(`\n📷 Scraping PHOTOS for ${leads.length} leads...`);

  const startUrls = leads.map(lead => ({
    url: `https://www.google.com/maps/place/?q=place_id:${lead.place_id}`
  }));

  try {
    const results = await runApifyActor("compass/crawler-google-places", {
      startUrls,
      maxImages: 50,
      scrapeReviews: false,
    });

    // Results come back in same order as startUrls
    for (let i = 0; i < results.length; i++) {
      const photos = results[i]?.imageUrls || [];
      const lead = leads[i];

      if (photos.length > 0) {
        await supabase
          .from("leads_raw")
          .update({
            google_photos: photos,
            scraped_at: new Date().toISOString()
          })
          .eq("id", lead.id);
        console.log(`  ✓ ${lead.name}: ${photos.length} photos`);
      } else {
        // Mark as scraped even if no photos (empty array)
        await supabase
          .from("leads_raw")
          .update({
            google_photos: [],
            scraped_at: new Date().toISOString()
          })
          .eq("id", lead.id);
        console.log(`  - ${lead.name}: 0 photos`);
      }
    }
  } catch (error) {
    console.error(`  Photos batch error: ${error}`);
  }
}

async function scrapeReviewsBatch(leads: any[]) {
  console.log(`\n⭐ Scraping REVIEWS for ${leads.length} leads...`);

  const startUrls = leads.map(lead => ({
    url: `https://www.google.com/maps/place/?q=place_id:${lead.place_id}`
  }));

  try {
    const results = await runApifyActor("compass/Google-Maps-Reviews-Scraper", {
      startUrls,
      maxReviews: 150,
      reviewsSort: "newest",
    });

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Group reviews by place
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
          relativeDate: r.publishAt,
        });
      }
    }

    for (const lead of leads) {
      const reviews = reviewsByPlace[lead.place_id] || [];
      const last30Days = reviews.filter(r =>
        r.date && new Date(r.date).getTime() > thirtyDaysAgo
      ).length;

      await supabase
        .from("leads_raw")
        .update({
          google_reviews: reviews,
          reviews_last_30_days: last30Days,
          scraped_at: new Date().toISOString()
        })
        .eq("id", lead.id);

      console.log(`  ${reviews.length > 0 ? '✓' : '-'} ${lead.name}: ${reviews.length} reviews (${last30Days} recent)`);
    }
  } catch (error) {
    console.error(`  Reviews batch error: ${error}`);
  }
}

async function main() {
  const scrapeType = process.argv[2] || "all";

  console.log(`\n=== BATCH Scraping ${scrapeType.toUpperCase()} ===`);
  console.log(`Batch size: ${BATCH_SIZE} leads per Apify run\n`);

  // Get leads that need scraping
  let query = supabase
    .from("leads_raw")
    .select("id, name, place_id, facebook")
    .eq("status", "active");

  if (scrapeType === "photos") {
    query = query.is("google_photos", null);
  } else if (scrapeType === "reviews") {
    query = query.is("google_reviews", null);
  }

  const { data: leads, error } = await query.limit(1000);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log(`Found ${leads?.length || 0} leads needing ${scrapeType}\n`);

  // Process in batches
  for (let i = 0; i < (leads?.length || 0); i += BATCH_SIZE) {
    const batch = leads!.slice(i, i + BATCH_SIZE);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`BATCH ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(leads!.length / BATCH_SIZE)}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (scrapeType === "photos" || scrapeType === "all") {
      await scrapePhotosBatch(batch);
    }

    if (scrapeType === "reviews" || scrapeType === "all") {
      await scrapeReviewsBatch(batch);
    }

    // Small delay between batches
    if (i + BATCH_SIZE < leads!.length) {
      console.log("\n⏳ Waiting 3s before next batch...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log("\n\n✅ Done!");
}

main().catch(console.error);
