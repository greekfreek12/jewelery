"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Users, BadgeDollarSign } from "lucide-react";
import type { SectionProps } from "@/types/site";

interface WhyChooseUsContent {
  headline?: string;
  background_image?: string;
  points?: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon?: string;
  }>;
}

// Default parallax background
const DEFAULT_BG_IMAGE =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80";

// Default trust points
const DEFAULT_POINTS = [
  {
    id: "1",
    title: "Integrity First",
    subtitle: "Honest recommendations. No upselling.",
    icon: "heart",
  },
  {
    id: "2",
    title: "Family Owned",
    subtitle: "Local roots, local values.",
    icon: "users",
  },
  {
    id: "3",
    title: "Transparent Pricing",
    subtitle: "No surprises, no hidden fees.",
    icon: "dollar",
  },
];

const ICONS: Record<string, typeof Heart> = {
  heart: Heart,
  users: Users,
  dollar: BadgeDollarSign,
};

export function NicksWhyChooseUsSection({
  content,
  globalConfig,
}: SectionProps<WhyChooseUsContent>) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const accentColor = globalConfig.accent_color;
  const primaryColor = globalConfig.primary_color;

  const headline = content?.headline ?? "Why Choose Us";
  const bgImage = content?.background_image ?? DEFAULT_BG_IMAGE;
  const points = content?.points?.length ? content.points : DEFAULT_POINTS;

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setScrollY(progress * 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-choose-us"
      className="relative py-16 md:py-24 overflow-hidden"
    >
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${scrollY * 0.25}px)`,
          willChange: "transform",
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: primaryColor, opacity: 0.88 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Headline */}
        <div className="text-center mb-10 md:mb-14">
          <span
            className={`inline-block text-xs font-bold tracking-[0.3em] uppercase mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: accentColor, fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            The Difference
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {headline}
          </h2>
        </div>

        {/* Trust Points - Horizontal on desktop, compact stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {points.map((point, index) => {
            const IconComponent = ICONS[point.icon || "heart"] || Heart;
            return (
              <div
                key={point.id}
                className={`text-center transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${150 + index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  <IconComponent className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{
                    fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                    color: "#ffffff",
                  }}
                >
                  {point.title}
                </h3>

                {/* Subtitle */}
                <p
                  className="text-sm md:text-base"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.5,
                  }}
                >
                  {point.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
    </section>
  );
}
