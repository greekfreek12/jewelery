"use client";

import { MapPin } from "lucide-react";
import type { SectionProps, ServiceAreaContent } from "@/types/site";

export function ServiceAreaSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ServiceAreaContent>) {
  const headline = content?.headline ?? "Service Area";
  const subheadline =
    content?.subheadline ??
    `Proudly serving ${businessData.city ?? "the area"} and surrounding communities`;
  const areas = content?.areas ?? [
    businessData.city ?? "Downtown",
    "Surrounding Areas",
  ];

  // Create map URL based on city/state
  const mapQuery = encodeURIComponent(
    `${businessData.city || ""}, ${businessData.state || "Tennessee"}`
  );

  return (
    <section id="service-area" className="relative py-20 md:py-28" style={{ backgroundColor: "#0C1117" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Map */}
          <div className="relative aspect-square md:aspect-[4/3] overflow-hidden" style={{ border: "1px solid #30363D" }}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}&zoom=10`}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, filter: "grayscale(100%) invert(92%) contrast(83%)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Right - Content */}
          <div>
            <p
              className="text-sm uppercase tracking-[0.25em] mb-4"
              style={{ color: globalConfig.accent_color, fontFamily: `"${globalConfig.font_body}", sans-serif` }}
            >
              Areas We Serve
            </p>
            <h2
              className="text-4xl md:text-5xl font-black mb-6 leading-tight"
              style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif`, color: "#E6EDF3" }}
            >
              {headline}
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#7D8590" }}
            >
              {subheadline}
            </p>

            {/* Areas list */}
            <div className="grid grid-cols-2 gap-3">
              {areas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ backgroundColor: "#161B22", border: "1px solid #30363D" }}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: globalConfig.accent_color }} />
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#E6EDF3" }}
                  >
                    {area}
                  </span>
                </div>
              ))}
            </div>

            <p
              className="mt-6 text-sm"
              style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#7D8590" }}
            >
              Don&apos;t see your area? Give us a call — we may still be able to help!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
