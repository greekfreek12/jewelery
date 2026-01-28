import { SiteRenderer, DEFAULT_SITE_CONFIG } from "@/components/sites/SiteRenderer";
import type { Site } from "@/types/site";

// Demo site data - simulating a real business
const DEMO_SITE: Site = {
  id: "demo",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lead_id: null,
  slug: "demo",
  custom_domain: null,
  status: "published",
  business_name: "Dirty Pants Plumbing",
  phone: "+1 865-805-6167",
  city: "Karns",
  state: "Tennessee",
  place_id: "ChIJdV9VP_A9ng8RE4kjDhFqzW8",
  rating: 5.0,
  review_count: 30,
  meta_title: "Dirty Pants Plumbing | Karns, TN Plumber",
  meta_description: "Trusted plumbing services in Karns, Tennessee. 5-star rated, licensed & insured.",
  config: {
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
          nav_links: [
            { label: "Services", href: "#services" },
            { label: "About", href: "#about" },
            { label: "Reviews", href: "#reviews" },
            { label: "Gallery", href: "#gallery" },
            { label: "Contact", href: "#contact" },
          ],
        },
      },
      {
        id: "hero",
        type: "hero",
        enabled: true,
        order: 1,
        content: {
          headline: "Dirty Pants Plumbing",
          subheadline: "Honest Work. Fair Prices. No Surprises.",
          background_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80",
          cta_primary_text: "Call Now",
          cta_secondary_text: "Get Free Quote",
          show_rating: true,
        },
        style: {
          background_overlay: "rgba(0,0,0,0.7)",
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
            { icon: "award", text: "5-Star Rated" },
            { icon: "clock", text: "Same-Day Service" },
            { icon: "thumbsup", text: "Satisfaction Guaranteed" },
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
          subheadline: "Professional plumbing solutions for Karns homes and businesses",
          items: [
            {
              id: "1",
              name: "Emergency Repairs",
              description: "24/7 emergency plumbing service when you need it most.",
              icon: "wrench",
            },
            {
              id: "2",
              name: "Water Heaters",
              description: "Installation, repair, and maintenance for all types.",
              icon: "flame",
            },
            {
              id: "3",
              name: "Drain Cleaning",
              description: "Professional drain cleaning to clear clogs fast.",
              icon: "droplets",
            },
            {
              id: "4",
              name: "Leak Detection",
              description: "Find and fix hidden leaks before they cause damage.",
              icon: "gauge",
            },
            {
              id: "5",
              name: "Bathroom Plumbing",
              description: "Complete bathroom services from faucets to remodels.",
              icon: "shower",
            },
            {
              id: "6",
              name: "Pipe Repair",
              description: "Expert pipe repair and replacement services.",
              icon: "pipe",
            },
          ],
        },
      },
      {
        id: "about",
        type: "about",
        enabled: true,
        order: 4,
        content: {
          headline: "Why Choose Us?",
          text: "When you call Dirty Pants Plumbing, you get a real person - not a call center. We show up on time, explain what we're doing, and never surprise you with hidden fees. That's the Dirty Pants difference.",
          years_in_business: 12,
          highlights: [
            "Family owned and operated",
            "Upfront, honest pricing",
            "Clean, uniformed technicians",
            "100% satisfaction guaranteed",
          ],
        },
      },
      {
        id: "reviews",
        type: "reviews",
        enabled: true,
        order: 5,
        content: {
          headline: "What Our Customers Say",
          items: [
            {
              id: "1",
              author: "Sarah M.",
              rating: 5,
              text: "Best plumber I've ever used. Showed up when they said they would, fixed the problem fast, and the price was exactly what they quoted!",
              date: "2 weeks ago",
            },
            {
              id: "2",
              author: "Mike T.",
              rating: 5,
              text: "These guys are the real deal. Professional, courteous, and they actually cleaned up after themselves. Rare to find!",
              date: "1 month ago",
            },
            {
              id: "3",
              author: "Jennifer L.",
              rating: 5,
              text: "Had an emergency leak at 10pm and they were here within an hour. Can't recommend them enough!",
              date: "3 weeks ago",
            },
          ],
        },
      },
      {
        id: "gallery",
        type: "gallery",
        enabled: true,
        order: 6,
        content: {
          headline: "Our Work",
        },
      },
      {
        id: "service_area",
        type: "service_area",
        enabled: true,
        order: 7,
        content: {
          headline: "Service Area",
          subheadline: "Proudly serving Karns and surrounding communities",
          areas: ["Karns", "Knoxville", "Powell", "Halls", "Farragut", "Oak Ridge"],
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
          button_text: "Call Now",
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
  },
};

export default function DemoSitePage() {
  return <SiteRenderer site={DEMO_SITE} />;
}
