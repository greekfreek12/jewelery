"use client";

import type { Site, SiteConfig, SectionType, GlobalConfig } from "@/types/site";
import {
  NicksHeaderSection,
  NicksHeroSection,
  NicksServicesWithImagesSection,
  NicksWhyChooseUsSection,
  NicksAboutSection,
  NicksGallerySection,
  NicksReviewsSection,
  NicksServiceAreaSection,
  NicksContactSection,
  NicksFooterSection,
} from "./templates/nicks";
import { ChatWidget } from "./ChatWidget";

// Placeholder for sections not yet built
function PlaceholderSection({ content, globalConfig, businessData }: any) {
  return null; // Will be replaced as we build each section
}

// Nicks template - all sections built
const SECTION_COMPONENTS: Record<SectionType, React.ComponentType<any>> = {
  header: NicksHeaderSection,
  hero: NicksHeroSection,
  trust_badges: PlaceholderSection,
  services: NicksServicesWithImagesSection,
  why_choose_us: NicksWhyChooseUsSection,
  about: NicksAboutSection,
  reviews: NicksReviewsSection,
  gallery: NicksGallerySection,
  service_area: NicksServiceAreaSection,
  contact_form: NicksContactSection,
  cta: PlaceholderSection,
  footer: NicksFooterSection,
};

interface SiteRendererProps {
  site: Site;
}

export function SiteRenderer({ site }: SiteRendererProps) {
  const config = site.config;
  const globalConfig = config.global;

  const businessData = {
    business_name: site.business_name,
    phone: site.phone,
    city: site.city,
    state: site.state,
    rating: site.rating,
    review_count: site.review_count,
    // Optional fields for footer/contact/reviews
    facebook_url: site.facebook_url,
    instagram_url: site.instagram_url,
    working_hours: site.working_hours,
    is_24_7: site.is_24_7,
    category: site.category,
    reviews_link: site.reviews_link,
  };

  // Sort sections by order if specified
  const sortedSections = [...config.sections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#faf9f7", // Warm off-white
        ["--primary" as string]: globalConfig.primary_color,
        ["--accent" as string]: globalConfig.accent_color,
      }}
    >
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=${globalConfig.font_heading.replace(/ /g, "+")}:wght@400;700;900&family=${globalConfig.font_body.replace(/ /g, "+")}:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Render each enabled section */}
      {sortedSections
        .filter((section) => section.enabled)
        .map((section) => {
          const SectionComponent = SECTION_COMPONENTS[section.type];

          if (!SectionComponent) {
            console.warn(`Unknown section type: ${section.type}`);
            return null;
          }

          return (
            <SectionComponent
              key={section.id}
              content={section.content ?? {}}
              style={section.style}
              globalConfig={globalConfig}
              businessData={businessData}
            />
          );
        })}

      {/* Chat Widget */}
      <ChatWidget
        accentColor={globalConfig.accent_color}
        fontBody={globalConfig.font_body}
        phone={site.phone}
        businessName={site.business_name}
      />
    </div>
  );
}

// Default config for new sites - Nick's template
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  global: {
    primary_color: "#1e293b",
    accent_color: "#ea580c",
    font_heading: "Outfit",
    font_body: "DM Sans",
    template: "nicks",
  },
  sections: [
    { id: "header", type: "header", enabled: true, order: 0, content: {} },
    { id: "hero", type: "hero", enabled: true, order: 1, content: {} },
    { id: "about", type: "about", enabled: true, order: 2, content: {} },
    { id: "services", type: "services", enabled: true, order: 3, content: {} },
    { id: "reviews", type: "reviews", enabled: true, order: 4, content: {} },
    { id: "gallery", type: "gallery", enabled: true, order: 5, content: {} },
    { id: "service_area", type: "service_area", enabled: true, order: 6, content: {} },
    { id: "contact_form", type: "contact_form", enabled: true, order: 7, content: {} },
    { id: "footer", type: "footer", enabled: true, order: 8, content: {} },
  ],
};
