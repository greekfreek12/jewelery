"use client";

import { Phone } from "lucide-react";
import Image from "next/image";
import type { SectionProps, HeroContent } from "@/types/site";

// Professional bathroom image - same as about section default
const DEFAULT_HERO_IMAGE =
  "https://assets.cdn.filesafe.space/EchQ3sghLIgNquggIoLN/media/c93cecbc-8e34-4e37-9fbd-2d1c5e5a5580.jpeg";

export function NicksHeroSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<HeroContent>) {
  // Use hero_city if set, otherwise fall back to business city
  const heroCity = content?.hero_city || businessData.city || "Your Area";
  const backgroundImage = content?.background_image ?? DEFAULT_HERO_IMAGE;

  const defaultSubheadline = `Fast response, fair prices, and quality work you can count on. Licensed, insured, and ready to help.`;
  const subheadline = content?.subheadline ?? defaultSubheadline;

  const phoneClean = businessData.phone?.replace(/\D/g, "") || "";
  // Strip +1, format as (xxx) xxx-xxxx
  let phoneFormatted = businessData.phone?.replace(/^\+?1?\s?/, "").trim() || "";
  if (phoneClean.length === 11 && phoneClean.startsWith("1")) {
    const digits = phoneClean.slice(1);
    phoneFormatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  } else if (phoneClean.length === 10) {
    phoneFormatted = `(${phoneClean.slice(0,3)}) ${phoneClean.slice(3,6)}-${phoneClean.slice(6)}`;
  }
  const phoneLink = content?.cta_primary_link ?? (phoneClean ? `tel:${phoneClean}` : "#contact");
  const ctaPrimaryText = content?.cta_primary_text ?? `Call ${phoneFormatted}`;
  const ctaSecondaryText = content?.cta_secondary_text ?? "Get Free Estimate";
  const ctaSecondaryLink = content?.cta_secondary_link ?? "#contact";

  const accentColor = globalConfig.accent_color;

  const openChat = () => {
    if (typeof window !== "undefined" && (window as any).openChatWidget) {
      (window as any).openChatWidget();
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex items-center">
      {/* Button animations */}
      <style jsx>{`
        @keyframes shimmerBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-title {
          animation: fadeInUp 0.8s ease 0.1s both;
        }
        .hero-description {
          animation: fadeInUp 0.8s ease 0.2s both;
        }
        .hero-buttons {
          animation: fadeInUp 0.8s ease 0.3s both;
        }
        .btn-primary {
          animation: shimmerBtn 3s ease infinite;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          filter: brightness(1.1);
        }
        .btn-secondary {
          animation: fadeInUp 0.8s ease 0.35s both;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.6);
          box-shadow: 0 0 20px rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Background Image */}
      <Image
        src={backgroundImage}
        alt={businessData.business_name}
        fill
        sizes="100vw"
        className="object-cover"
        priority={true}
        quality={85}
      />

      {/* Dark overlay - lighter for better image visibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.35)",
        }}
      />

      {/* Content - centered on desktop */}
      <div className="relative z-10 w-full px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            {/* Main Headline */}
            <h1 className="hero-title mb-6">
              <span
                className="block text-white leading-[1.1]"
                style={{
                  fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 700,
                }}
              >
                Expert Plumbing in
              </span>
              <span
                className="block leading-[1.1]"
                style={{
                  fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 700,
                  color: accentColor,
                }}
              >
                {heroCity}
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="hero-description mb-9 mx-auto"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                fontSize: "1.25rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.9)",
                maxWidth: "540px",
              }}
            >
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={phoneLink}
                className="btn-primary inline-flex items-center justify-center gap-2.5 rounded-full"
                style={{
                  color: "#fff",
                  padding: "18px 36px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, #4a3520), ${accentColor})`,
                  backgroundSize: "200% 200%",
                  boxShadow: `0 8px 30px color-mix(in srgb, ${accentColor} 40%, transparent)`,
                }}
              >
                <Phone className="w-5 h-5" strokeWidth={2.5} />
                {ctaPrimaryText}
              </a>

              {ctaSecondaryLink === "#contact" ? (
                <button
                  onClick={openChat}
                  className="btn-secondary inline-flex items-center justify-center gap-2.5 rounded-full text-white"
                  style={{
                    padding: "18px 36px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    background: "transparent",
                  }}
                >
                  {ctaSecondaryText}
                </button>
              ) : (
                <a
                  href={ctaSecondaryLink}
                  className="btn-secondary inline-flex items-center justify-center gap-2.5 rounded-full text-white"
                  style={{
                    padding: "18px 36px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {ctaSecondaryText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
