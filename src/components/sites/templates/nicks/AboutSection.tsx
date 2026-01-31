"use client";

import Image from "next/image";
import type { SectionProps, AboutContent } from "@/types/site";

// Default about image
const DEFAULT_ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=800&fit=crop";

export function NicksAboutSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<AboutContent>) {
  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;

  const headline = content?.headline ?? `About ${businessData.business_name}`;
  const aboutImage = content?.image_url ?? DEFAULT_ABOUT_IMAGE;

  // Generate default text
  const defaultText = `We're not just plumbers — we're your neighbors. Born and raised in ${businessData.city || "the area"}, we understand the unique challenges local homeowners face.\n\nWhen you call ${businessData.business_name}, you get a real person who cares about doing the job right. Our team shows up on time, explains every option clearly, and never pushes services you don't need.`;
  const text = content?.text ?? defaultText;

  // Split text into paragraphs
  const paragraphs = text.split("\n").filter((p) => p.trim());

  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#faf9f7" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left - Image (full height) */}
        <div className="relative h-[400px] lg:h-auto lg:min-h-[500px]">
          <Image
            src={aboutImage}
            alt={`${businessData.business_name} team`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Subtle overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, transparent 70%, ${primaryColor}10 100%)`,
            }}
          />
        </div>

        {/* Right - Content */}
        <div className="flex items-center px-8 md:px-12 lg:px-16 py-16 lg:py-20">
          <div className="max-w-lg">
            {/* Section label */}
            <span
              className="inline-block text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{
                color: accentColor,
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              Our Story
            </span>

            {/* Headline */}
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                color: primaryColor,
                lineHeight: 1.15,
              }}
            >
              {headline}
            </h2>

            {/* Text paragraphs */}
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base leading-relaxed"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#52525b",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <p
                className="text-sm"
                style={{
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  color: "#71717a",
                }}
              >
                — The {businessData.business_name} Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
