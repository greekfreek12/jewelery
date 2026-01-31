import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const targets = [
  "B M Septic Tank Company, LLC",
  "Fitzgerald’s Plumbing Repair",
  "Mr Installer LLC",
];

const overrides: Record<
  string,
  {
    hero?: { headline: string; subheadline: string };
    about?: { text: string; highlights: string[] };
    badges?: Array<{ icon: string; text: string }>;
  }
> = {
  "B M Septic Tank Company, LLC": {
    hero: {
      headline: "Septic Pumping & Repairs in Limestone, TN",
      subheadline:
        "Fast response, honest pricing, and clean, professional septic service.",
    },
    about: {
      text:
        "From routine pumping to urgent septic issues, we make it easy to get dependable service. You get clear communication, fair pricing, and a crew that respects your property.",
      highlights: [
        "Locally owned and operated",
        "Upfront, honest pricing",
        "Fast response times",
        "Clean, professional crews",
      ],
    },
    badges: [
      { icon: "shield", text: "Licensed & Insured" },
      { icon: "clock", text: "Fast Response" },
      { icon: "star", text: "200+ 5‑Star Reviews" },
      { icon: "pricing", text: "Upfront Pricing" },
    ],
  },
  "Fitzgerald’s Plumbing Repair": {
    hero: {
      headline: "24/7 Plumbing Repair in Georgetown, TN",
      subheadline:
        "On‑call service for leaks, water heaters, clogs, and emergencies.",
    },
    about: {
      text:
        "When plumbing problems hit, you need fast, reliable help. We show up on time, explain the fix, and do clean work that lasts.",
      highlights: [
        "24/7 emergency availability",
        "Clear, upfront pricing",
        "Respectful, clean technicians",
        "Work backed by warranty",
      ],
    },
    badges: [
      { icon: "clock", text: "24/7 Service" },
      { icon: "star", text: "5‑Star Rated" },
      { icon: "shield", text: "Licensed & Insured" },
      { icon: "pricing", text: "Upfront Pricing" },
    ],
  },
  "Mr Installer LLC": {
    hero: {
      headline: "Trusted Plumbing in Newport, TN",
      subheadline:
        "Straightforward pricing, clean workmanship, and quick scheduling.",
    },
    about: {
      text:
        "We focus on quality repairs and straightforward service. You’ll get honest recommendations and work done right the first time.",
      highlights: [
        "Honest recommendations",
        "Clean, respectful service",
        "Quick scheduling",
        "Reliable repairs",
      ],
    },
    badges: [
      { icon: "shield", text: "Licensed & Insured" },
      { icon: "pricing", text: "Upfront Pricing" },
      { icon: "users", text: "Locally Owned" },
      { icon: "clock", text: "Fast Scheduling" },
    ],
  },
};

type SiteConfig = {
  global: Record<string, unknown>;
  sections: Array<{
    id: string;
    type: string;
    enabled: boolean;
    order?: number;
    content?: Record<string, unknown>;
    style?: Record<string, unknown>;
  }>;
};

function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
}

function upsertSection(config: SiteConfig, type: string, content: Record<string, unknown>) {
  const sections = config.sections || [];
  const existing = sections.find((s) => s.type === type);
  if (existing) {
    existing.enabled = true;
    existing.content = { ...(existing.content || {}), ...content };
  } else {
    sections.push({
      id: type,
      type,
      enabled: true,
      order: sections.length,
      content,
    });
  }
  config.sections = sections;
}

function buildServices(isSeptic: boolean, photos: string[]) {
  const septicFallbacks = [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80",
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80",
  ];
  const plumbingFallbacks = [
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&q=80",
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=80",
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&q=80",
  ];
  const usePhotos = (i: number) =>
    photos[i] || (isSeptic ? septicFallbacks[i] : plumbingFallbacks[i]);

  if (isSeptic) {
    return [
      {
        id: "septic-pumping",
        name: "Septic Pumping",
        description: "Routine pumping to keep your system healthy and prevent backups.",
        slug: "/septic-pumping",
        image_url: usePhotos(0),
      },
      {
        id: "septic-inspections",
        name: "Septic Inspections",
        description: "Thorough inspections for home sales and peace of mind.",
        slug: "/septic-inspections",
        image_url: usePhotos(1),
      },
      {
        id: "septic-repairs",
        name: "Septic Repairs",
        description: "Fast fixes for alarms, odors, and drain field issues.",
        slug: "/septic-repairs",
        image_url: usePhotos(2),
      },
      {
        id: "system-install",
        name: "System Installation",
        description: "Complete septic system design and installation done right.",
        slug: "/septic-installation",
        image_url: usePhotos(3),
      },
      {
        id: "drain-field",
        name: "Drain Field Service",
        description: "Drain field repair, replacement, and restoration.",
        slug: "/drain-field",
        image_url: usePhotos(4),
      },
      {
        id: "grease-trap",
        name: "Grease Trap Cleaning",
        description: "Commercial grease trap pumping and maintenance.",
        slug: "/grease-trap-cleaning",
        image_url: usePhotos(5),
      },
    ];
  }

  return [
    {
      id: "drain-cleaning",
      name: "Drain Cleaning",
      description: "Clear stubborn clogs and keep drains flowing freely.",
      slug: "/drain-cleaning",
      image_url: usePhotos(0),
    },
    {
      id: "water-heaters",
      name: "Water Heaters",
      description: "Repair, replacement, and installs for all heater types.",
      slug: "/water-heaters",
      image_url: usePhotos(1),
    },
    {
      id: "leak-repair",
      name: "Leak Detection & Repair",
      description: "Find and fix leaks before they cause damage.",
      slug: "/leak-repair",
      image_url: usePhotos(2),
    },
    {
      id: "pipe-repair",
      name: "Pipe Repair & Repiping",
      description: "Reliable repairs and whole-home repiping solutions.",
      slug: "/pipe-repair",
      image_url: usePhotos(3),
    },
    {
      id: "sewer-camera",
      name: "Sewer & Camera Inspection",
      description: "Video inspections and sewer line repair.",
      slug: "/sewer-services",
      image_url: usePhotos(4),
    },
    {
      id: "emergency",
      name: "Emergency Plumbing",
      description: "24/7 response for burst pipes and urgent repairs.",
      slug: "/emergency-plumbing",
      image_url: usePhotos(5),
    },
  ];
}

function buildReviews(reviews: any[]) {
  const clean = reviews
    .filter((r) => r && r.rating >= 4 && r.text && r.text.length > 20)
    .slice(0, 3)
    .map((r, i) => ({
      id: `review-${i + 1}`,
      author: r.author || "Customer",
      rating: r.rating || 5,
      text: r.text,
      date: r.relativeDate || r.date,
      source: "Google",
    }));
  return clean;
}

async function main() {
  for (const name of targets) {
    const { data: lead } = await supabase
      .from("leads_raw")
      .select("*")
      .eq("name", name)
      .single();

    if (!lead) {
      console.log(`Lead not found: ${name}`);
      continue;
    }

    let site = null as any;
    const { data: siteByName } = await supabase
      .from("sites")
      .select("*")
      .eq("business_name", name)
      .single();

    if (siteByName) {
      site = siteByName;
    } else if (lead.id) {
      const { data: siteByLead } = await supabase
        .from("sites")
        .select("*")
        .eq("lead_id", lead.id)
        .single();
      site = siteByLead;
    }

    if (!site) {
      console.log(`Site not found for: ${name}`);
      continue;
    }

    const isSeptic = (lead.category || "").toLowerCase().includes("septic");
    const phone = lead.phone || site.phone || "";
    const phoneClean = normalizePhone(phone);
    const city = lead.city || site.city || "your area";
    const state = lead.state || site.state || "";
    const reviewCount = Number(lead.reviews || 0);

    const photos: string[] = Array.isArray(lead.google_photos) ? lead.google_photos : [];
    const reviews: any[] = Array.isArray(lead.google_reviews) ? lead.google_reviews : [];
    const custom = overrides[name] || {};

    const config: SiteConfig = site.config || { global: {}, sections: [] };

    upsertSection(config, "hero", {
      headline:
        custom.hero?.headline ??
        (isSeptic
          ? `Septic Pumping & Repairs in ${city}${state ? `, ${state}` : ""}`
          : `Trusted Plumbing in ${city}${state ? `, ${state}` : ""}`),
      subheadline:
        custom.hero?.subheadline ??
        "Fast response, honest pricing, and clean, professional work.",
      cta_primary_text: phone ? `Call Now: ${phone}` : "Call Now",
      cta_primary_link: phoneClean ? `tel:${phoneClean.replace("+", "")}` : "#contact",
      cta_secondary_text: "Get a Free Estimate",
      cta_secondary_link: "#contact",
      show_rating: reviewCount >= 20,
      background_image: photos[0] || undefined,
    });

    upsertSection(config, "trust_badges", {
      badges:
        custom.badges ??
        [
          { icon: "shield", text: "Licensed & Insured" },
          {
            icon: "star",
            text: reviewCount >= 50 ? `${reviewCount}+ 5‑Star Reviews` : "5‑Star Rated",
          },
          { icon: "clock", text: "Same‑Day Service" },
          { icon: "pricing", text: "Upfront Pricing" },
        ],
    });

    upsertSection(config, "services", {
      headline: isSeptic ? "Septic Services" : "Plumbing Services",
      subheadline: `Fast, reliable help for ${city} homes and small businesses.`,
      items: buildServices(isSeptic, photos),
    });

    upsertSection(config, "about", {
      headline: `Why Choose ${name}?`,
      text:
        custom.about?.text ??
        "You get a real person, clear pricing, and a tech who respects your home. We show up on time, keep the job clean, and explain what we’re doing before any work begins.",
      highlights:
        custom.about?.highlights ?? [
          "Local, family‑owned business",
          "Upfront, honest pricing",
          "Clean, respectful technicians",
          "Work backed by warranty",
        ],
    });

    const reviewItems = buildReviews(reviews);
    upsertSection(config, "reviews", {
      headline: "What Customers Say",
      items: reviewItems,
    });

    upsertSection(config, "gallery", {
      headline: "Recent Work",
      subheadline: "Quality workmanship on every job",
      images: photos.slice(0, 8).map((url, i) => ({
        url,
        alt: `${name} project ${i + 1}`,
      })),
    });

    upsertSection(config, "service_area", {
      headline: "Service Area",
      subheadline: `Proudly serving ${city} and nearby communities`,
      areas: [city, "Surrounding Areas", `${city} Area`].filter(Boolean),
      show_map: true,
    });

    const { error: updateError } = await supabase
      .from("sites")
      .update({ config })
      .eq("id", site.id);

    if (updateError) {
      console.log(`Failed to update ${name}: ${updateError.message}`);
    } else {
      console.log(`Updated site: ${name} (${site.slug})`);
    }
  }
}

main().catch(console.error);
