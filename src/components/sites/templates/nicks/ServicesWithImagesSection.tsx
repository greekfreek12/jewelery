"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SectionProps, ServicesContent } from "@/types/site";

// Default services with stock images
const DEFAULT_SERVICES = [
  {
    id: "1",
    title: "Drain Cleaning",
    description: "Clear stubborn clogs in kitchen, bath, and main lines.",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Water Heaters",
    description: "Tank and tankless installation, repair, and maintenance.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Leak Detection",
    description: "Find hidden leaks fast. Stop damage before it spreads.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    title: "Pipe Repair",
    description: "Burst pipes, corrosion, repiping done right.",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop",
  },
  {
    id: "5",
    title: "Fixtures",
    description: "Faucets, toilets, sinks installed professionally.",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop",
  },
  {
    id: "6",
    title: "Emergency",
    description: "24/7 emergency response when you need us most.",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop",
  },
];

// Individual service card with scroll reveal
function ServiceCard({
  service,
  index,
  accentColor,
  primaryColor,
  globalConfig,
}: {
  service: any;
  index: number;
  accentColor: string;
  primaryColor: string;
  globalConfig: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden"
      style={{ minHeight: '340px' }}
    >
      {/* Image */}
      <Image
        src={service.image}
        alt={service.title || service.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay - darker on mobile for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${primaryColor} 0%, ${primaryColor}95 40%, ${primaryColor}60 70%, transparent 100%)`,
        }}
      />

      {/* Content - centered on mobile, bottom-left on desktop */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-center md:text-left">
        {/* Service number */}
        <span
          className={`block text-xs font-bold tracking-[0.2em] mb-2 transition-all duration-500 ${
            isVisible ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            color: accentColor,
            fontFamily: `"${globalConfig.font_body}", sans-serif`,
            transitionDelay: `${index * 100}ms`,
          }}
        >
          0{index + 1}
        </span>

        {/* Title */}
        <h3
          className={`text-2xl md:text-2xl font-bold mb-3 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            fontFamily: `"${globalConfig.font_heading}", sans-serif`,
            color: "#ffffff",
            transitionDelay: `${index * 100 + 100}ms`,
          }}
        >
          {service.title || service.name}
        </h3>

        {/* Description - revealed on scroll */}
        <p
          className={`text-base md:text-sm leading-relaxed transition-all duration-500 mx-auto md:mx-0 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            fontFamily: `"${globalConfig.font_body}", sans-serif`,
            color: "rgba(255,255,255,0.9)",
            maxWidth: "320px",
            transitionDelay: `${index * 100 + 200}ms`,
          }}
        >
          {service.description}
        </p>

        {/* Accent bar - centered on mobile */}
        <div
          className={`mt-4 h-[3px] mx-auto md:mx-0 transition-all duration-700 ${
            isVisible ? 'w-16' : 'w-0'
          }`}
          style={{
            backgroundColor: accentColor,
            transitionDelay: `${index * 100 + 300}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function NicksServicesWithImagesSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ServicesContent>) {
  const services = content?.items?.length ? content.items : DEFAULT_SERVICES;
  const headline = content?.headline ?? "What We Do";
  const subheadline = content?.subheadline ?? `Professional plumbing for ${businessData.city}`;
  const accentColor = globalConfig.accent_color;
  const primaryColor = globalConfig.primary_color;

  return (
    <section id="services-images" className="relative py-24 px-6 md:px-12" style={{ backgroundColor: primaryColor }}>
      {/* Diagonal accent stripe */}
      <div
        className="absolute top-0 left-0 w-full h-2"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent 50%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header - centered, light text on dark */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-bold tracking-[0.3em] uppercase mb-4"
            style={{
              color: accentColor,
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            Our Services
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5"
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            {headline}
          </h2>
          <p
            className="text-lg max-w-lg mx-auto"
            style={{
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {subheadline}
          </p>
        </div>

        {/* Services - Grid with scroll reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any, index: number) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              accentColor={accentColor}
              primaryColor={primaryColor}
              globalConfig={globalConfig}
            />
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-sm transition-all duration-300 hover:gap-4"
            style={{
              backgroundColor: accentColor,
              color: "#ffffff",
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            Get a Free Estimate
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
