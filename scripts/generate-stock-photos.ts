/**
 * Generate stock photos for service sections using xAI Grok Imagine API
 *
 * Uses n=10 to generate 10 image variations per service in ONE API call
 *
 * Usage: npx tsx scripts/generate-stock-photos.ts [--service=drain-cleaning] [--dry-run]
 *
 * Requires XAI_API_KEY in .env.local
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const XAI_API_KEY = process.env.XAI_API_KEY;
const OUTPUT_DIR = path.join(process.cwd(), "public/stock-photos/services");

// Base style instructions for consistency across all images
// Using 4:3 aspect ratio to fit service cards (340px height, ~400px width)
const BASE_STYLE = `
Professional commercial photography for a plumbing company website services section,
photorealistic, high resolution, warm natural lighting,
clean modern American residential home, professional plumber at work,
shot on Sony A7R IV, 50mm lens, f/2.8, shallow depth of field,
4:3 aspect ratio, vertical composition preferred, no text, no logos, no watermarks
`.trim().replace(/\n/g, " ");

// One prompt per service - API generates 10 variations each
const SERVICES: Record<string, { folder: string; prompt: string }> = {
  "drain-cleaning": {
    folder: "drain-cleaning",
    prompt: "Professional plumber clearing a clogged drain, using drain snake or auger equipment, kitchen or bathroom sink, water flowing freely, clean modern home environment, tools visible, skilled hands at work",
  },

  "water-heater": {
    folder: "water-heater",
    prompt: "Professional technician servicing a water heater, residential garage or utility room, tank or tankless unit, copper pipes visible, temperature gauge, maintenance or installation work, clean professional setting",
  },

  "leak-detection": {
    folder: "leak-detection",
    prompt: "Professional plumber detecting or repairing a water leak, using moisture detector or inspection equipment, under sink or near pipes, water damage visible, focused repair work, residential bathroom or kitchen",
  },

  "pipe-repair": {
    folder: "pipe-repair",
    prompt: "Professional plumber repairing or replacing pipes, copper or PVC piping, soldering or fitting work, pipe wrench and tools, exposed plumbing, residential repair job, skilled craftsmanship",
  },

  "fixture-installation": {
    folder: "fixture-installation",
    prompt: "Professional plumber installing bathroom or kitchen fixtures, new faucet toilet or sink, chrome fixtures, supply line connections, modern bathroom or kitchen renovation, quality installation work",
  },

  "emergency-plumbing": {
    folder: "emergency-plumbing",
    prompt: "Emergency plumbing situation, plumber responding urgently, burst pipe or flooding, water shutoff, nighttime or urgent scenario, professional rapid response, residential emergency repair",
  },
};

interface GenerationResult {
  service: string;
  prompt: string;
  success: boolean;
  imageCount: number;
  filePaths?: string[];
  error?: string;
}

async function generateImages(prompt: string, count: number = 10): Promise<Buffer[]> {
  const response = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt: `${prompt}. ${BASE_STYLE}`,
      n: count,
      aspect_ratio: "4:3",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: { b64_json: string }) =>
    Buffer.from(item.b64_json, "base64")
  );
}

async function generateServiceImages(
  serviceKey: string,
  dryRun: boolean = false
): Promise<GenerationResult> {
  const service = SERVICES[serviceKey];
  if (!service) {
    throw new Error(`Unknown service: ${serviceKey}`);
  }

  const outputFolder = path.join(OUTPUT_DIR, service.folder);

  // Ensure folder exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  console.log(`\n📸 Generating images for: ${serviceKey}`);
  console.log(`   Output folder: ${outputFolder}`);
  console.log(`   Prompt: ${service.prompt.substring(0, 80)}...`);
  console.log(`   Count: 10 images in ONE batch\n`);

  if (dryRun) {
    console.log(`   [DRY RUN] Would generate 10 images\n`);
    return {
      service: serviceKey,
      prompt: service.prompt,
      success: true,
      imageCount: 10,
      filePaths: Array.from({ length: 10 }, (_, i) =>
        path.join(outputFolder, `${String(i + 1).padStart(2, "0")}.png`)
      ),
    };
  }

  try {
    console.log(`   ⏳ Calling API (n=10)...`);
    const imageBuffers = await generateImages(service.prompt, 10);

    const filePaths: string[] = [];
    for (let i = 0; i < imageBuffers.length; i++) {
      const fileName = `${String(i + 1).padStart(2, "0")}.png`;
      const filePath = path.join(outputFolder, fileName);
      fs.writeFileSync(filePath, imageBuffers[i]);
      filePaths.push(filePath);
      console.log(`   ✅ Saved: ${fileName}`);
    }

    console.log(`\n   🎉 Generated ${imageBuffers.length} images for ${serviceKey}\n`);

    return {
      service: serviceKey,
      prompt: service.prompt,
      success: true,
      imageCount: imageBuffers.length,
      filePaths,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ Error: ${errorMessage}\n`);

    return {
      service: serviceKey,
      prompt: service.prompt,
      success: false,
      imageCount: 0,
      error: errorMessage,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const serviceArg = args.find((a) => a.startsWith("--service="));
  const specificService = serviceArg?.split("=")[1];

  console.log("🖼️  Stock Photo Generator for Contractor Sites");
  console.log("=".repeat(50));

  if (!XAI_API_KEY && !dryRun) {
    console.error("\n❌ Error: XAI_API_KEY not found in .env.local");
    console.error("   Add your xAI API key to continue.\n");
    process.exit(1);
  }

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE - No images will be generated\n");
  }

  const servicesToGenerate = specificService
    ? [specificService]
    : Object.keys(SERVICES);

  console.log(`\nServices to generate: ${servicesToGenerate.join(", ")}`);
  console.log(`Total API calls: ${servicesToGenerate.length} (10 images each)`);
  console.log(`Total images: ${servicesToGenerate.length * 10}`);

  const allResults: GenerationResult[] = [];

  for (const serviceKey of servicesToGenerate) {
    if (!SERVICES[serviceKey]) {
      console.error(`\n❌ Unknown service: ${serviceKey}`);
      console.error(`   Available: ${Object.keys(SERVICES).join(", ")}\n`);
      continue;
    }

    const result = await generateServiceImages(serviceKey, dryRun);
    allResults.push(result);

    // Rate limiting - wait 3 seconds between service batches
    if (!dryRun && servicesToGenerate.indexOf(serviceKey) < servicesToGenerate.length - 1) {
      console.log("   ⏳ Waiting 3s before next batch...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));

  const successful = allResults.filter((r) => r.success);
  const failed = allResults.filter((r) => !r.success);
  const totalImages = successful.reduce((sum, r) => sum + r.imageCount, 0);

  console.log(`   Services: ${allResults.length}`);
  console.log(`   ✅ Successful: ${successful.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   📷 Total images: ${totalImages}`);

  if (failed.length > 0) {
    console.log("\n   Failed services:");
    failed.forEach((r) => {
      console.log(`     - ${r.service}: ${r.error}`);
    });
  }

  // Write results to JSON for reference
  const resultsPath = path.join(OUTPUT_DIR, "generation-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📝 Results saved to: ${resultsPath}\n`);
}

main().catch(console.error);
