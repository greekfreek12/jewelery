/**
 * Scrape Google Photos, Google Reviews, and Facebook Posts for all active leads
 *
 * Actors:
 * - compass/crawler-google-places (photos - up to 50)
 * - compass/Google-Maps-Reviews-Scraper (reviews - up to 150)
 * - apify/facebook-posts-scraper (posts - all)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APIFY_TOKEN = "apify_api_vnDxCCOzZF36qMg1kx9b66hlKByT4b1XzEZC";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Lead {
  id: string;
  name: string;
  place_id: string;
  facebook: string | null;
}

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

  // Poll for completion
  let status = "RUNNING";
  let attempts = 0;
  while ((status === "RUNNING" || status === "READY") && attempts < 120) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;
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

async function scrapePhotos(placeId: string): Promise<string[]> {
  try {
    const results = await runApifyActor("compass/crawler-google-places", {
      startUrls: [{ url: `https://www.google.com/maps/place/?q=place_id:${placeId}` }],
      maxImages: 50,
      scrapeReviews: false,
    });
    return results[0]?.imageUrls || [];
  } catch (error) {
    console.error(`    Photos error: ${error}`);
    return [];
  }
}

async function scrapeReviews(placeId: string): Promise<{ reviews: any[]; last30Days: number }> {
  try {
    const results = await runApifyActor("compass/Google-Maps-Reviews-Scraper", {
      startUrls: [{ url: `https://www.google.com/maps/place/?q=place_id:${placeId}` }],
      maxReviews: 150,
      reviewsSort: "newest",
    });

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let last30Days = 0;

    const reviews = results.map((r: any) => {
      if (r.publishedAtDate) {
        const reviewDate = new Date(r.publishedAtDate).getTime();
        if (reviewDate > thirtyDaysAgo) last30Days++;
      }
      return {
        author: r.name,
        rating: r.stars,
        text: r.text,
        date: r.publishedAtDate,
        relativeDate: r.publishAt,
      };
    });

    return { reviews: reviews.slice(0, 150), last30Days };
  } catch (error) {
    console.error(`    Reviews error: ${error}`);
    return { reviews: [], last30Days: 0 };
  }
}

async function scrapeFacebook(facebookUrl: string): Promise<any[]> {
  try {
    let url = facebookUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;

    const results = await runApifyActor("apify/facebook-posts-scraper", {
      startUrls: [{ url }],
      maxPosts: 50,
    });

    return results.map((p: any) => ({
      text: p.text,
      date: p.time,
      likes: p.likes,
      shares: p.shares,
      url: p.url,
      media: p.media?.map((m: any) => m.thumbnail || m.image?.uri).filter(Boolean) || [],
    }));
  } catch (error) {
    console.error(`    Facebook error: ${error}`);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const scrapeType = args[0] || "all"; // "photos", "reviews", "facebook", or "all"

  console.log(`\n=== Scraping ${scrapeType.toUpperCase()} for all active leads ===\n`);

  // Get leads that haven't been scraped yet
  let query = supabase
    .from("leads_raw")
    .select("id, name, place_id, facebook")
    .eq("status", "active");

  if (scrapeType === "photos") {
    query = query.is("google_photos", null);
  } else if (scrapeType === "reviews") {
    query = query.is("google_reviews", null);
  } else if (scrapeType === "facebook") {
    query = query.is("facebook_posts", null).not("facebook", "is", null).neq("facebook", "");
  }

  const { data: leads, error } = await query.limit(1000);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log(`Found ${leads?.length || 0} leads to scrape\n`);

  for (let i = 0; i < (leads?.length || 0); i++) {
    const lead = leads![i] as Lead;
    console.log(`[${i + 1}/${leads!.length}] ${lead.name}`);

    const updateData: any = {};

    // Scrape photos
    if (scrapeType === "photos" || scrapeType === "all") {
      console.log("  Scraping photos...");
      const photos = await scrapePhotos(lead.place_id);
      console.log(`  Got ${photos.length} photos`);
      if (photos.length > 0) updateData.google_photos = photos;
    }

    // Scrape reviews
    if (scrapeType === "reviews" || scrapeType === "all") {
      console.log("  Scraping reviews...");
      const { reviews, last30Days } = await scrapeReviews(lead.place_id);
      console.log(`  Got ${reviews.length} reviews (${last30Days} in last 30 days)`);
      if (reviews.length > 0) {
        updateData.google_reviews = reviews;
        updateData.reviews_last_30_days = last30Days;
      }
    }

    // Scrape Facebook
    if ((scrapeType === "facebook" || scrapeType === "all") && lead.facebook) {
      console.log(`  Scraping Facebook: ${lead.facebook}`);
      const posts = await scrapeFacebook(lead.facebook);
      console.log(`  Got ${posts.length} posts`);
      if (posts.length > 0) updateData.facebook_posts = posts;
    }

    // Update database
    if (Object.keys(updateData).length > 0) {
      updateData.scraped_at = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("leads_raw")
        .update(updateData)
        .eq("id", lead.id);

      if (updateError) {
        console.error(`  DB Error: ${updateError.message}`);
      } else {
        console.log("  Saved to database");
      }
    }

    // Small delay between leads
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n\nDone!");
}

main().catch(console.error);
