"use client";

import { Phone } from "lucide-react";
import type { SectionProps, HeroContent } from "@/types/site";

// Actual plumber working - not generic
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80";

export function HeroSection({
  content,
  style,
  globalConfig,
  businessData,
}: SectionProps<HeroContent>) {
  const headline = content?.headline ?? `${businessData.business_name}`;
  const subheadline =
    content?.subheadline ??
    `Professional plumbing services in ${businessData.city || "your area"}. Licensed, insured, and ready 24/7.`;
  const backgroundImage = content?.background_image ?? DEFAULT_HERO_IMAGE;
  const ctaText = content?.cta_primary_text ?? "Call Now";

  const phoneClean = businessData.phone?.replace(/\D/g, "") || "";
  const phoneLink = phoneClean ? `tel:${phoneClean}` : "#contact";
  const phoneDisplay = businessData.phone || "Contact Us";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Gradient Overlay - darker at bottom for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(12, 17, 23, 0.7) 0%,
            rgba(12, 17, 23, 0.85) 50%,
            rgba(12, 17, 23, 0.95) 100%
          )`,
        }}
      />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C97D4A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          {/* Small tagline */}
          <p
            className="text-sm md:text-base uppercase tracking-[0.25em] mb-6 opacity-80"
            style={{
              color: globalConfig.accent_color,
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            {businessData.city}, {businessData.state} • Licensed & Insured
          </p>

          {/* Main Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight"
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              color: "#E6EDF3",
            }}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
            style={{
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
              color: "#7D8590",
            }}
          >
            {subheadline}
          </p>

          {/* CTA Button */}
          <a
            href={phoneLink}
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              backgroundColor: globalConfig.accent_color,
              color: "#0C1117",
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            <Phone className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span>{ctaText}</span>
          </a>

          {/* Rating Badge - if available */}
          {businessData.rating && businessData.rating >= 4 && (
            <div className="mt-8 inline-flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill={i < Math.round(businessData.rating || 0) ? globalConfig.accent_color : "transparent"}
                    stroke={globalConfig.accent_color}
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span
                className="text-sm"
                style={{
                  color: "#7D8590",
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                }}
              >
                {businessData.rating} rating · {businessData.review_count} reviews
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: globalConfig.accent_color }}
      />
    </section>
  );
}
