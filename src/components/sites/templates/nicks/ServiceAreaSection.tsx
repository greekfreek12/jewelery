"use client";

import { MapPin, Phone, CheckCircle2 } from "lucide-react";
import type { SectionProps, ServiceAreaContent } from "@/types/site";

export function NicksServiceAreaSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ServiceAreaContent>) {
  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;

  const headline = content?.headline ?? "Service Area";
  const subheadline = content?.subheadline ?? `Proudly serving ${businessData.city || "your area"} and surrounding communities`;

  // Default areas based on city
  const defaultAreas = businessData.city
    ? [
        businessData.city,
        `Greater ${businessData.city} Area`,
        "Surrounding Communities",
      ]
    : ["Your Area", "Surrounding Communities"];

  const areas = content?.areas?.length ? content.areas : defaultAreas;

  return (
    <section
      id="service-area"
      className="relative py-20 md:py-28 px-6 md:px-12 overflow-hidden"
      style={{ backgroundColor: "#faf9f7" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left - Content */}
          <div>
            <span
              className="inline-block text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{
                color: accentColor,
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              Service Area
            </span>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{
                fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                color: primaryColor,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </h2>

            <p
              className="text-base md:text-lg leading-relaxed mb-8"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                color: "#64748b",
              }}
            >
              {subheadline}
            </p>

            {/* Areas list */}
            <div className="space-y-3 mb-8">
              {areas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 transition-all duration-200 hover:translate-x-1"
                  style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
                >
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: accentColor }}
                  />
                  <span
                    className="font-medium"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: primaryColor,
                    }}
                  >
                    {area}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <p
              className="text-sm mb-4"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                color: "#94a3b8",
              }}
            >
              Not sure if we service your area? Give us a call!
            </p>

            {businessData.phone && (
              <a
                href={`tel:${businessData.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 hover:translate-y-[-2px]"
                style={{
                  backgroundColor: accentColor,
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                }}
              >
                <Phone className="w-4 h-4" />
                Call {businessData.phone}
              </a>
            )}
          </div>

          {/* Right - Map placeholder / Visual */}
          <div className="relative">
            {/* Stylized map representation */}
            <div
              className="relative aspect-square rounded-lg overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Radial highlight for service area */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at center, ${accentColor}30 0%, transparent 60%)`,
                }}
              />

              {/* Center pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Ripple effect */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-20 animate-ping"
                  style={{ backgroundColor: accentColor, animationDuration: "2s" }}
                />
              </div>

              {/* City label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                <span
                  className="inline-block px-4 py-2 text-sm font-bold text-white"
                  style={{
                    backgroundColor: accentColor,
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  }}
                >
                  {businessData.city || "Your Area"}{businessData.state ? `, ${businessData.state}` : ""}
                </span>
              </div>

              {/* Corner accents */}
              <div
                className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <div
                className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <div
                className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <div
                className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
