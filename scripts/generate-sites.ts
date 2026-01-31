/**
 * Generate sites for all active leads that don't have one yet
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Default site config
// Get full-size logo URL (Google uses s44 for tiny thumbnails)
const getFullSizeLogo = (logoUrl: string | null): string | null => {
  if (!logoUrl) return null;
  return logoUrl.replace("/s44-", "/s0-");
};

const createSiteConfig = (lead: any) => {
  const reviews = lead.google_reviews || [];
  const photos = lead.google_photos || [];
  const logoUrl = getFullSizeLogo(lead.logo);

  // Pick up to 6 reviews with 4+ stars
  const featuredReviews = reviews
    .filter((r: any) => r.rating >= 4 && r.text && r.text.length > 20)
    .slice(0, 6)
    .map((r: any, i: number) => ({
      id: `review-${i}`,
      author: r.author || "Customer",
      rating: r.rating || 5,
      text: r.text,
      date: r.relativeDate || r.date,
      source: "Google",
    }));

  // Gallery images from scraped photos
  const galleryImages = photos.slice(0, 12).map((url: string, i: number) => ({
    url,
    alt: `${lead.name} work photo ${i + 1}`,
  }));

  // Determine if plumber or septic based on category
  const isSeptic = lead.category?.toLowerCase().includes("septic");

  const services = isSeptic
    ? [
        { id: "s1", name: "Septic Pumping", description: "Regular pumping to keep your system running smoothly and prevent backups." },
        { id: "s2", name: "Septic Inspections", description: "Thorough inspections for home sales, real estate transactions, and peace of mind." },
        { id: "s3", name: "System Repairs", description: "Fast, reliable repairs for all septic system issues, big or small." },
        { id: "s4", name: "New Installations", description: "Complete septic system design and installation done right the first time." },
        { id: "s5", name: "Drain Field Service", description: "Drain field repair, replacement, and restoration services." },
        { id: "s6", name: "Grease Trap Cleaning", description: "Commercial grease trap pumping and maintenance." },
      ]
    : [
        { id: "s1", name: "Drain Cleaning", description: "Clear stubborn clogs and keep your drains flowing freely." },
        { id: "s2", name: "Water Heater Services", description: "Installation, repair, and maintenance for all water heater types." },
        { id: "s3", name: "Leak Detection & Repair", description: "Find and fix leaks fast to prevent water damage and high bills." },
        { id: "s4", name: "Pipe Repair & Replacement", description: "From minor repairs to complete repiping, we do it all." },
        { id: "s5", name: "Fixture Installation", description: "Faucets, toilets, sinks, and more installed professionally." },
        { id: "s6", name: "Emergency Plumbing", description: "24/7 emergency service when you need us most." },
      ];

  return {
    global: {
      primary_color: "#1a1a1a",
      accent_color: "#d97706",
      font_heading: "Bebas Neue",
      font_body: "Source Sans 3",
    },
    sections: [
      {
        id: "header",
        type: "header",
        enabled: true,
        order: 0,
        content: {
          show_logo: !!logoUrl,
          logo_url: logoUrl,
          cta_text: "Call Now",
        },
      },
      {
        id: "hero",
        type: "hero",
        enabled: true,
        order: 1,
        content: {
          headline: lead.name,
          subheadline: `${lead.city}'s Trusted ${isSeptic ? "Septic" : "Plumbing"} Experts`,
          show_rating: true,
          cta_primary_text: `Call Now: ${lead.phone || "Contact Us"}`,
          cta_primary_link: lead.phone ? `tel:${lead.phone.replace(/\D/g, "")}` : "#contact",
        },
      },
      {
        id: "trust_badges",
        type: "trust_badges",
        enabled: true,
        order: 2,
        content: {
          badges: [
            { icon: "shield", text: "Licensed & Insured" },
            { icon: "star", text: "5-Star Rated" },
            { icon: "clock", text: "Same-Day Service" },
            { icon: "check", text: "Satisfaction Guaranteed" },
          ],
        },
      },
      {
        id: "services",
        type: "services",
        enabled: true,
        order: 3,
        content: {
          headline: "Our Services",
          subheadline: `Professional ${isSeptic ? "septic" : "plumbing"} solutions for ${lead.city} and surrounding areas`,
          items: services,
        },
      },
      {
        id: "about",
        type: "about",
        enabled: true,
        order: 4,
        content: {
          headline: `Why Choose ${lead.name}?`,
          text: `With ${lead.reviews || "many"} five-star reviews, ${lead.name} has built a reputation for honest, reliable service. We treat every property like our own, showing up on time and getting the job done right the first time.`,
          highlights: [
            "Family owned and operated",
            "Upfront, honest pricing",
            "Clean, professional technicians",
            "100% satisfaction guaranteed",
          ],
        },
      },
      {
        id: "reviews",
        type: "reviews",
        enabled: featuredReviews.length >= 2,
        order: 5,
        content: {
          headline: "What Our Customers Say",
          items: featuredReviews,
        },
      },
      {
        id: "gallery",
        type: "gallery",
        enabled: galleryImages.length >= 3,
        order: 6,
        content: {
          headline: "Our Work",
          subheadline: "Quality craftsmanship on every job",
          images: galleryImages,
        },
      },
      {
        id: "service_area",
        type: "service_area",
        enabled: true,
        order: 7,
        content: {
          headline: "Service Area",
          subheadline: `Proudly serving ${lead.city} and surrounding communities`,
          areas: [lead.city, "Surrounding Areas"].filter(Boolean),
        },
      },
      {
        id: "cta",
        type: "cta",
        enabled: true,
        order: 8,
        content: {
          headline: "Ready to Get Started?",
          subheadline: "Call now for a free estimate. No obligation, no pressure.",
          button_text: `Call Now: ${lead.phone || "Contact Us"}`,
          button_link: lead.phone ? `tel:${lead.phone.replace(/\D/g, "")}` : "#contact",
        },
      },
      {
        id: "footer",
        type: "footer",
        enabled: true,
        order: 9,
        content: {
          show_hours: true,
          show_contact: true,
        },
      },
    ],
  };
};

// Generate URL-friendly slug
const generateSlug = (name: string, city: string | null): string => {
  const base = `${name}${city ? `-${city}` : ""}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
};

async function main() {
  console.log("Fetching active leads without sites...\n");

  // Get leads that don't have a site yet
  const { data: leads, error: leadsError } = await supabase
    .from("leads_raw")
    .select("*")
    .eq("status", "active");

  if (leadsError) {
    console.error("Error fetching leads:", leadsError);
    return;
  }

  // Get existing sites to check for duplicates
  const { data: existingSites } = await supabase
    .from("sites")
    .select("lead_id, slug");

  const existingLeadIds = new Set(existingSites?.map((s) => s.lead_id) || []);
  const existingSlugs = new Set(existingSites?.map((s) => s.slug) || []);

  const leadsWithoutSites = leads?.filter((l) => !existingLeadIds.has(l.id)) || [];

  console.log(`Found ${leadsWithoutSites.length} leads without sites\n`);

  let created = 0;
  let errors = 0;

  for (const lead of leadsWithoutSites) {
    // Generate unique slug
    let slug = generateSlug(lead.name, lead.city);
    let slugSuffix = 1;
    while (existingSlugs.has(slug)) {
      slug = `${generateSlug(lead.name, lead.city)}-${slugSuffix}`;
      slugSuffix++;
    }
    existingSlugs.add(slug);

    const config = createSiteConfig(lead);
    const reviewCount = parseInt(lead.reviews || "0", 10);
    const rating = parseFloat(lead.rating || "0");

    const site = {
      lead_id: lead.id,
      slug,
      status: "draft",
      business_name: lead.name,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      category: lead.category,
      place_id: lead.place_id,
      rating: rating || null,
      review_count: reviewCount || null,
      config,
      meta_title: `${lead.name} | ${lead.city}, ${lead.state}`,
      meta_description: `Professional plumbing services in ${lead.city}, ${lead.state}. Call ${lead.name} for fast, reliable service.`,
      // Social, hours, and reviews link from lead
      reviews_link: lead.reviews_link || null,
      facebook_url: lead.facebook || null,
      instagram_url: lead.instagram || null,
      working_hours: lead.working_hours || null,
      is_24_7: lead.working_hours?.toLowerCase().includes("24") || false,
    };

    const { error: insertError } = await supabase.from("sites").insert(site);

    if (insertError) {
      console.error(`Error creating site for ${lead.name}:`, insertError.message);
      errors++;
    } else {
      console.log(`Created: ${slug}`);
      created++;
    }
  }

  console.log(`\nDone! Created ${created} sites, ${errors} errors.`);
}

main().catch(console.error);
