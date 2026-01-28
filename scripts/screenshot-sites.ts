/**
 * Screenshot competitor websites using Apify
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const APIFY_TOKEN = "apify_api_vnDxCCOzZF36qMg1kx9b66hlKByT4b1XzEZC";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BATCH_SIZE = 10;
const OUTPUT_DIR = "/tmp/site-screenshots";

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
    await new Promise((r) => setTimeout(r, 3000));
    attempts++;

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusResponse.json();
    status = statusData.data.status;

    if (attempts % 10 === 0) {
      console.log(`    Still running... (${attempts * 3}s)`);
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

async function downloadScreenshot(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\n=== Screenshotting Competitor Websites ===\n`);

  // Get leads with websites (exclude facebook/linktree)
  const { data: leads, error } = await supabase
    .from("leads_raw")
    .select("id, name, site")
    .eq("status", "active")
    .not("site", "is", null)
    .neq("site", "")
    .limit(100); // Start with 100

  if (error) {
    console.error("Error:", error);
    return;
  }

  // Filter out non-website URLs
  const validLeads = leads?.filter(l => {
    const site = l.site?.toLowerCase() || "";
    return !site.includes("facebook.com") &&
           !site.includes("linktree") &&
           !site.includes("linktr.ee") &&
           (site.startsWith("http") || site.includes(".com") || site.includes(".net"));
  }) || [];

  console.log(`Found ${validLeads.length} leads with actual websites\n`);

  // Process in batches
  for (let i = 0; i < validLeads.length; i += BATCH_SIZE) {
    const batch = validLeads.slice(i, i + BATCH_SIZE);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`BATCH ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(validLeads.length / BATCH_SIZE)}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const urls = batch.map(l => {
      let url = l.site.trim();
      if (!url.startsWith("http")) url = "https://" + url;
      return { url };
    });

    try {
      const results = await runApifyActor("apify/screenshot-url", {
        urls: urls.map(u => u.url),
        viewportWidth: 1440,
        viewportHeight: 900,
        fullPage: false,
        delay: 3000, // Wait for page to load
      });

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const lead = batch[j];

        if (result?.screenshotUrl) {
          const filename = path.join(OUTPUT_DIR, `${lead.id}.jpg`);
          await downloadScreenshot(result.screenshotUrl, filename);
          console.log(`  ✓ ${lead.name}`);

          // Save URL to database
          await supabase
            .from("leads_raw")
            .update({ screenshot_url: result.screenshotUrl })
            .eq("id", lead.id);
        } else {
          console.log(`  ✗ ${lead.name} - no screenshot`);
        }
      }
    } catch (error) {
      console.error(`  Batch error: ${error}`);
    }

    // Delay between batches
    if (i + BATCH_SIZE < validLeads.length) {
      console.log("\n⏳ Waiting 5s...");
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n\n✅ Done! Screenshots saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
