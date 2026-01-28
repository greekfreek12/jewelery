"use client";

import { Wrench, Droplets, Flame, ShowerHead, PipetteIcon, AlertTriangle } from "lucide-react";
import type { SectionProps, ServicesContent, ServiceItem } from "@/types/site";

const ICON_MAP: Record<string, React.ElementType> = {
  wrench: Wrench,
  droplets: Droplets,
  flame: Flame,
  shower: ShowerHead,
  pipe: PipetteIcon,
  emergency: AlertTriangle,
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "1", name: "Emergency Repairs", description: "24/7 emergency service when you need it most. Fast response, reliable fixes.", icon: "emergency" },
  { id: "2", name: "Water Heaters", description: "Installation, repair, and maintenance for tankless and traditional units.", icon: "flame" },
  { id: "3", name: "Drain Cleaning", description: "Professional drain clearing and clog removal to keep pipes flowing.", icon: "droplets" },
  { id: "4", name: "Leak Detection", description: "Advanced leak detection to find and fix hidden problems.", icon: "pipe" },
  { id: "5", name: "Bathroom Plumbing", description: "Faucets, toilets, showers, and full bathroom remodels.", icon: "shower" },
  { id: "6", name: "Pipe Repair", description: "Expert pipe repair, replacement, and repiping services.", icon: "wrench" },
];

export function ServicesSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ServicesContent>) {
  const headline = content?.headline ?? "Our Services";
  const subheadline = content?.subheadline ?? `Professional plumbing solutions for ${businessData.city ?? "your area"} homes and businesses.`;
  const services = content?.items ?? DEFAULT_SERVICES;

  return (
    <section id="services" className="py-20 md:py-28" style={{ backgroundColor: "#0C1117" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14">
          <p
            className="text-sm uppercase tracking-[0.25em] mb-4"
            style={{ color: globalConfig.accent_color, fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            What We Do
          </p>
          <h2
            className="text-4xl md:text-5xl font-black mb-4 leading-tight"
            style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif`, color: "#E6EDF3" }}
          >
            {headline}
          </h2>
          <p
            className="text-lg max-w-2xl"
            style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#7D8590" }}
          >
            {subheadline}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service) => {
            const IconComponent = ICON_MAP[service.icon || "wrench"] ?? Wrench;

            return (
              <article
                key={service.id}
                className="group p-6 transition-all duration-300 hover:translate-y-[-4px]"
                style={{ backgroundColor: "#161B22", border: "1px solid #30363D" }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(201, 125, 74, 0.1)" }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: globalConfig.accent_color }} />
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif`, color: "#E6EDF3" }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#7D8590" }}
                >
                  {service.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
