/**
 * Screenshot competitor websites - 10 at a time
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APIFY_TOKEN = "apify_api_vnDxCCOzZF36qMg1kx9b66hlKByT4b1XzEZC";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 10;

function normalizeUrl(site: string): string | null {
  let url = site.trim();
  if (!url) return null;

  // Remove URL encoding issues
  url = url.replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&');

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

async function screenshotBatch(leads: any[]) {
  // Build URL objects with valid URLs only
  const urlsWithLeads = leads
    .map(l => ({ lead: l, url: normalizeUrl(l.site) }))
    .filter(x => x.url !== null);

  if (urlsWithLeads.length === 0) {
    console.log("  No valid URLs in batch");
    return;
  }

  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/apify~screenshot-url/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: urlsWithLeads.map(x => ({ url: x.url })),
        viewportWidth: 1440,
        viewportHeight: 900,
        waitUntil: "networkidle2",
        delay: 2000,
      }),
    }
  );

  if (!runResponse.ok) {
    console.error("Failed:", await runResponse.text());
    return;
  }

  const runData = await runResponse.json();
  const runId = runData.data.id;

  let status = "RUNNING";
  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    status = (await res.json()).data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);

  if (status !== "SUCCEEDED") return;

  const results = await (await fetch(
    `https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${APIFY_TOKEN}`
  )).json();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const lead = urlsWithLeads[i]?.lead;
    if (!lead) continue;

    if (result?.screenshotUrl) {
      await supabase.from("leads_raw").update({
        website_screenshot: result.screenshotUrl
      }).eq("id", lead.id);
      console.log(`  ✓ ${lead.name}`);
    } else {
      console.log(`  ✗ ${lead.name}`);
    }
  }
}

async function main() {
  const { data: leads } = await supabase
    .from("leads_raw")
    .select("id, name, site")
    .eq("status", "active")
    .not("site", "is", null)
    .neq("site", "")
    .is("website_screenshot", null)
    .limit(500);

  // Filter out facebook/linktree
  const valid = leads?.filter(l => {
    const s = l.site?.toLowerCase() || "";
    return !s.includes("facebook.com") && !s.includes("linktree") && !s.includes("linktr.ee");
  }) || [];

  console.log(`\n=== Website Screenshots ===`);
  console.log(`${valid.length} sites to screenshot\n`);

  for (let i = 0; i < valid.length; i += BATCH_SIZE) {
    const batch = valid.slice(i, i + BATCH_SIZE);
    console.log(`\nBATCH ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(valid.length/BATCH_SIZE)}`);
    await screenshotBatch(batch);
  }
  console.log("\n✅ Done!");
}

main().catch(console.error);
