"use client";

import type { Site, SiteConfig, SectionType, GlobalConfig } from "@/types/site";
import {
  HeaderSection,
  HeroSection,
  TrustBadgesSection,
  ServicesSection,
  AboutSection,
  ReviewsSection,
  GallerySection,
  ServiceAreaSection,
  ContactFormSection,
  CTASection,
  FooterSection,
} from "./sections";
import { ChatWidget } from "./ChatWidget";

// Section component registry
const SECTION_COMPONENTS: Record<SectionType, React.ComponentType<any>> = {
  header: HeaderSection,
  hero: HeroSection,
  trust_badges: TrustBadgesSection,
  services: ServicesSection,
  about: AboutSection,
  reviews: ReviewsSection,
  gallery: GallerySection,
  service_area: ServiceAreaSection,
  contact_form: ContactFormSection,
  cta: CTASection,
  footer: FooterSection,
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
  };

  // Sort sections by order if specified
  const sortedSections = [...config.sections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#0C1117",
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

// Default config for new sites - Industrial Refined theme
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  global: {
    primary_color: "#0C1117",
    accent_color: "#C97D4A",
    font_heading: "Archivo Black",
    font_body: "IBM Plex Sans",
  },
  sections: [
    { id: "header", type: "header", enabled: true, order: 0, content: {} },
    { id: "hero", type: "hero", enabled: true, order: 1, content: {} },
    { id: "trust_badges", type: "trust_badges", enabled: true, order: 2, content: {} },
    { id: "services", type: "services", enabled: true, order: 3, content: {} },
    { id: "about", type: "about", enabled: true, order: 4, content: {} },
    { id: "reviews", type: "reviews", enabled: true, order: 5, content: {} },
    { id: "gallery", type: "gallery", enabled: true, order: 6, content: {} },
    { id: "service_area", type: "service_area", enabled: true, order: 7, content: {} },
    { id: "contact_form", type: "contact_form", enabled: true, order: 8, content: {} },
    { id: "footer", type: "footer", enabled: true, order: 9, content: {} },
  ],
};
