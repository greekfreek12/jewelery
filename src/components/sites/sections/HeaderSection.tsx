"use client";

import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import type { SectionProps, HeaderContent } from "@/types/site";

export function HeaderSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<HeaderContent>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneClean = businessData.phone?.replace(/\D/g, "") || "";
  const phoneLink = phoneClean ? `tel:${phoneClean}` : "#contact";

  const navLinks = content?.nav_links ?? [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ backgroundColor: "rgba(12, 17, 23, 0.95)", backdropFilter: "blur(8px)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Business Name */}
          <a
            href="#"
            className="text-xl md:text-2xl font-black tracking-tight"
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              color: "#E6EDF3",
            }}
          >
            {businessData.business_name}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-wider transition-colors hover:opacity-100"
                style={{
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  color: "#7D8590",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Phone CTA */}
          <a
            href={phoneLink}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: globalConfig.accent_color,
              color: "#0C1117",
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            <Phone className="w-4 h-4" />
            {businessData.phone || "Call Us"}
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: "#E6EDF3" }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden py-6 border-t"
            style={{ borderColor: "rgba(125, 133, 144, 0.2)" }}
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base uppercase tracking-wider"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#7D8590",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={phoneLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-bold mt-2"
                style={{
                  backgroundColor: globalConfig.accent_color,
                  color: "#0C1117",
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                }}
              >
                <Phone className="w-5 h-5" />
                {businessData.phone || "Call Us"}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
