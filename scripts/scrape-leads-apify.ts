/**
 * Scrape Google Photos, Google Reviews, and Facebook Posts for all active leads
 * Uses Apify actors:
 * - thescrappa/google-maps-photos-scraper (up to 50 photos)
 * - compass/Google-Maps-Reviews-Scraper (up to 150 reviews)
 * - Facebook scraper for posts
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
  google_photos: any;
  google_reviews: any;
  facebook_posts: any;
}

async function runApifyActor(actorId: string, input: any): Promise<any[]> {
  console.log(`  Running actor: ${actorId}`);

  // Start the actor run
  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
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
  console.log(`  Run started: ${runId}`);

  // Poll for completion
  let status = "RUNNING";
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 3000)); // Wait 3 seconds

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;
    console.log(`  Status: ${status}`);
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Actor run failed with status: ${status}`);
  }

  // Get the results
  const datasetId = runData.data.defaultDatasetId;
  const resultsResponse = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
  );
  const results = await resultsResponse.json();

  return results;
}

async function scrapeGooglePhotos(placeId: string): Promise<string[]> {
  try {
    const results = await runApifyActor("thescrappa/google-maps-photos-scraper", {
      placeIds: [placeId],
      maxPhotos: 50,
    });

    // Extract photo URLs from results
    const photos: string[] = [];
    for (const item of results) {
      if (item.photoUrl) photos.push(item.photoUrl);
      if (item.photos) photos.push(...item.photos.map((p: any) => p.url || p));
    }
    return photos.slice(0, 50);
  } catch (error) {
    console.error(`  Error scraping photos: ${error}`);
    return [];
  }
}

async function scrapeGoogleReviews(placeId: string): Promise<{ reviews: any[]; last30Days: number }> {
  try {
    const results = await runApifyActor("compass/Google-Maps-Reviews-Scraper", {
      placeIds: [placeId],
      maxReviews: 150,
      language: "en",
    });

    const reviews: any[] = [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let last30Days = 0;

    for (const item of results) {
      if (item.reviews) {
        for (const review of item.reviews) {
          reviews.push({
            author: review.author || review.name,
            rating: review.rating || review.stars,
            text: review.text || review.snippet,
            date: review.date || review.publishedAtDate,
            relativeDate: review.relativeDate || review.publishAt,
          });

          // Count recent reviews
          if (review.publishedAtDate) {
            const reviewDate = new Date(review.publishedAtDate).getTime();
            if (reviewDate > thirtyDaysAgo) last30Days++;
          }
        }
      }
    }

    return { reviews: reviews.slice(0, 150), last30Days };
  } catch (error) {
    console.error(`  Error scraping reviews: ${error}`);
    return { reviews: [], last30Days: 0 };
  }
}

async function scrapeFacebookPosts(facebookUrl: string): Promise<any[]> {
  try {
    // Clean up the Facebook URL
    let url = facebookUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;

    const results = await runApifyActor("apify/facebook-posts-scraper", {
      startUrls: [{ url }],
      maxPosts: 100,
    });

    const posts: any[] = [];
    for (const item of results) {
      posts.push({
        text: item.text || item.message,
        date: item.time || item.date,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        url: item.url || item.postUrl,
      });
    }

    return posts;
  } catch (error) {
    console.error(`  Error scraping Facebook: ${error}`);
    return [];
  }
}

async function main() {
  console.log("Fetching active leads...");

  const { data: leads, error } = await supabase
    .from("leads_raw")
    .select("id, name, place_id, facebook, google_photos, google_reviews, facebook_posts")
    .eq("status", "active")
    .is("scraped_at", null) // Only scrape leads we haven't scraped yet
    .limit(1000);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  console.log(`Found ${leads?.length || 0} leads to scrape\n`);

  for (let i = 0; i < (leads?.length || 0); i++) {
    const lead = leads![i] as Lead;
    console.log(`\n[${i + 1}/${leads!.length}] ${lead.name}`);
    console.log(`  Place ID: ${lead.place_id}`);

    let photos: string[] = [];
    let reviews: any[] = [];
    let last30Days = 0;
    let fbPosts: any[] = [];

    // Scrape Google Photos
    if (lead.place_id && !lead.google_photos) {
      console.log("  Scraping Google Photos...");
      photos = await scrapeGooglePhotos(lead.place_id);
      console.log(`  Got ${photos.length} photos`);
    }

    // Scrape Google Reviews
    if (lead.place_id && !lead.google_reviews) {
      console.log("  Scraping Google Reviews...");
      const reviewData = await scrapeGoogleReviews(lead.place_id);
      reviews = reviewData.reviews;
      last30Days = reviewData.last30Days;
      console.log(`  Got ${reviews.length} reviews (${last30Days} in last 30 days)`);
    }

    // Scrape Facebook Posts
    if (lead.facebook && !lead.facebook_posts) {
      console.log(`  Scraping Facebook: ${lead.facebook}`);
      fbPosts = await scrapeFacebookPosts(lead.facebook);
      console.log(`  Got ${fbPosts.length} posts`);
    }

    // Update the database
    const updateData: any = {
      scraped_at: new Date().toISOString(),
    };

    if (photos.length > 0) updateData.google_photos = photos;
    if (reviews.length > 0) {
      updateData.google_reviews = reviews;
      updateData.reviews_last_30_days = last30Days;
    }
    if (fbPosts.length > 0) updateData.facebook_posts = fbPosts;

    const { error: updateError } = await supabase
      .from("leads_raw")
      .update(updateData)
      .eq("id", lead.id);

    if (updateError) {
      console.error(`  Error updating lead: ${updateError.message}`);
    } else {
      console.log("  Saved to database");
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n\nDone!");
}

main().catch(console.error);
