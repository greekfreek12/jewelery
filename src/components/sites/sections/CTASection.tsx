"use client";

import { Phone, ArrowRight } from "lucide-react";
import type { SectionProps, CTAContent } from "@/types/site";

export function CTASection({
  content,
  style,
  globalConfig,
  businessData,
}: SectionProps<CTAContent>) {
  const headline = content?.headline ?? "Ready to Get Started?";
  const subheadline =
    content?.subheadline ??
    "Call now for a free estimate. No obligation, no pressure.";
  const buttonText = content?.button_text ?? "Call Now";
  const phoneLink = businessData.phone
    ? `tel:${businessData.phone.replace(/\D/g, "")}`
    : "#contact";
  const phoneDisplay = businessData.phone ?? "Contact Us";

  return (
    <section
      id="contact"
      className="relative py-24 overflow-hidden"
      style={{
        backgroundColor: style?.background_color ?? globalConfig.accent_color,
      }}
    >
      {/* Geometric pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(0,0,0,0.1) 20px,
              rgba(0,0,0,0.1) 40px
            )`,
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-black"
          style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
        >
          {headline}
        </h2>
        <p
          className="text-xl text-black/70 mb-10 max-w-xl mx-auto"
          style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
        >
          {subheadline}
        </p>

        <a
          href={phoneLink}
          className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105 group"
          style={{
            backgroundColor: globalConfig.primary_color,
            color: "white",
            fontFamily: `"${globalConfig.font_body}", sans-serif`,
          }}
        >
          <Phone className="w-6 h-6" />
          {buttonText}: {phoneDisplay}
          <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        </a>
      </div>
    </section>
  );
}
