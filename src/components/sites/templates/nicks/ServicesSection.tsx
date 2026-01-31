"use client";

import {
  Droplets,
  Flame,
  Search,
  Wrench,
  ShowerHead,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { SectionProps, ServicesContent } from "@/types/site";

// Icon mapping
const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  flame: Flame,
  search: Search,
  wrench: Wrench,
  shower: ShowerHead,
  alert: AlertTriangle,
};

// Default services for plumbers
const DEFAULT_SERVICES = [
  {
    id: "1",
    title: "Drain Cleaning",
    description: "Clear stubborn clogs in kitchen, bath, and main lines. Same-day service available.",
    icon: "droplets",
  },
  {
    id: "2",
    title: "Water Heaters",
    description: "Tank and tankless installation, repair, and maintenance. All major brands.",
    icon: "flame",
  },
  {
    id: "3",
    title: "Leak Detection",
    description: "Find hidden leaks fast with advanced equipment. Stop damage before it spreads.",
    icon: "search",
  },
  {
    id: "4",
    title: "Pipe Repair",
    description: "Burst pipes, corrosion, repiping. We fix it right the first time.",
    icon: "wrench",
  },
  {
    id: "5",
    title: "Fixtures",
    description: "Faucets, toilets, sinks, showers. Professional installation guaranteed.",
    icon: "shower",
  },
  {
    id: "6",
    title: "Emergency",
    description: "24/7 emergency response. We answer when you need us most.",
    icon: "alert",
  },
];

export function NicksServicesSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ServicesContent>) {
  const services = content?.items?.length ? content.items : DEFAULT_SERVICES;
  const headline = content?.headline ?? "What We Do";
  const subheadline = content?.subheadline ?? `Straightforward plumbing solutions for ${businessData.city} homes and businesses`;
  const accentColor = globalConfig.accent_color;
  const primaryColor = globalConfig.primary_color;

  return (
    <section id="services" className="relative py-24 px-6 md:px-12 overflow-hidden">
      {/* Subtle grid background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Accent corner detail */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${accentColor}, transparent)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header - left aligned for editorial feel */}
        <div className="mb-16 max-w-xl">
          <div
            className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-[0.2em] uppercase"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              color: accentColor,
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            Services
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[0.95]"
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              color: primaryColor,
            }}
          >
            {headline}
          </h2>
          <p
            className="text-lg"
            style={{
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            {subheadline}
          </p>
        </div>

        {/* Services Grid - asymmetric sizing for visual interest */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service: any, index: number) => {
            const IconComponent = ICONS[service.icon] || Wrench;
            const isFeature = index === 0 || index === 5; // First and last get emphasis

            return (
              <div
                key={service.id}
                className={`group relative p-7 transition-all duration-300 ${
                  isFeature ? 'md:col-span-1 lg:row-span-1' : ''
                }`}
                style={{
                  backgroundColor: "#ffffff",
                  borderLeft: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = accentColor;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Service number - industrial detail */}
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold tracking-wider opacity-20"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: primaryColor,
                  }}
                >
                  0{index + 1}
                </span>

                {/* Icon with accent background */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-5 transition-all duration-300"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                  }}
                >
                  <IconComponent
                    className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: accentColor }}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                    color: primaryColor,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {service.title || service.name}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#64748b",
                  }}
                >
                  {service.description}
                </p>

                {/* Bottom accent line that grows on hover */}
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p
            className="text-sm mb-4"
            style={{
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
              color: "#94a3b8",
            }}
          >
            Don&apos;t see your issue listed?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
            style={{
              color: accentColor,
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            Contact us — we handle it all
            <span>→</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
