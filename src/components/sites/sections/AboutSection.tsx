"use client";

import { CheckCircle } from "lucide-react";
import type { SectionProps, AboutContent } from "@/types/site";

// Plumber working under sink
const DEFAULT_ABOUT_IMAGE = "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80";

const DEFAULT_HIGHLIGHTS = [
  "Family owned and operated",
  "Upfront, honest pricing",
  "Clean, uniformed technicians",
  "100% satisfaction guaranteed",
];

export function AboutSection({
  content,
  style,
  globalConfig,
  businessData,
}: SectionProps<AboutContent>) {
  const headline = content?.headline ?? `Why Choose ${businessData.business_name}?`;
  const text =
    content?.text ??
    `For over ${content?.years_in_business ?? 10} years, we've been serving ${businessData.city ?? "the community"} with honest, reliable plumbing services. When you call us, you get a real person - not a call center. We show up on time, explain what we're doing, and never surprise you with hidden fees. That's the ${businessData.business_name} difference.`;
  const imageUrl = content?.image_url ?? DEFAULT_ABOUT_IMAGE;
  const highlights = content?.highlights ?? DEFAULT_HIGHLIGHTS;

  return (
    <section
      id="about"
      className="relative py-24 overflow-hidden"
      style={{
        backgroundColor: style?.background_color ?? globalConfig.primary_color,
      }}
    >
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.1) 40px,
              rgba(255,255,255,0.1) 80px
            )`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <div className="relative">
            {/* Main image */}
            <div
              className="relative aspect-[4/5] bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              {/* Accent border */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full border-4 -z-10"
                style={{ borderColor: globalConfig.accent_color }}
              />
            </div>
            {/* Years badge */}
            {content?.years_in_business && (
              <div
                className="absolute -bottom-6 -left-6 p-6 text-center"
                style={{ backgroundColor: globalConfig.accent_color }}
              >
                <div
                  className="text-4xl font-bold text-black"
                  style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
                >
                  {content.years_in_business}+
                </div>
                <div className="text-sm font-semibold text-black/80 uppercase tracking-wide">
                  Years
                </div>
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="text-white">
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
              style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
            >
              {headline}
            </h2>
            <div
              className="w-16 h-1 mb-8"
              style={{ backgroundColor: globalConfig.accent_color }}
            />
            <p
              className="text-lg text-white/80 leading-relaxed mb-8"
              style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
            >
              {text}
            </p>

            {/* Highlights */}
            <ul className="space-y-4">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: globalConfig.accent_color }}
                  />
                  <span
                    className="text-white/90"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                  >
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>

            {/* Owner name if provided */}
            {content?.owner_name && (
              <div className="mt-10 pt-8 border-t border-white/20">
                <p
                  className="text-white/60 text-sm"
                  style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                >
                  — {content.owner_name}, Owner
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
