"use client";

import { Phone, Menu, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { SectionProps, HeaderContent } from "@/types/site";

export function NicksHeaderSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<HeaderContent>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phoneClean = businessData.phone?.replace(/\D/g, "") || "";
  // Format as (xxx) xxx-xxxx
  let phoneFormatted = "";
  if (phoneClean.length === 11 && phoneClean.startsWith("1")) {
    const digits = phoneClean.slice(1);
    phoneFormatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  } else if (phoneClean.length === 10) {
    phoneFormatted = `(${phoneClean.slice(0,3)}) ${phoneClean.slice(3,6)}-${phoneClean.slice(6)}`;
  } else {
    phoneFormatted = businessData.phone || "";
  }
  const phoneLink = phoneClean ? `tel:${phoneClean}` : "#contact";

  const navLinks = content?.nav_links ?? [
    { label: "Services", href: "#services" },
    { label: "Why Us", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Service Areas", href: "#service-area" },
    { label: "Contact", href: "#contact" },
  ];

  // Colors
  const topBarBg = globalConfig.header_bar_color || "#7f1d1d"; // Deep maroon
  const topBarText = globalConfig.header_bar_text_color || "#ffffff";
  const accentColor = globalConfig.accent_color || "#d97706";

  // Show top bar only if enabled (default true for 24/7 businesses)
  const showTopBar = content?.show_top_bar ?? true;
  const topBarContent = content?.top_bar_text || `24/7 EMERGENCY SERVICE — CALL NOW: ${phoneFormatted}`;
  const tagline = content?.tagline || `${businessData.city?.toUpperCase()}'S TRUSTED PLUMBER`;
  const logoUrl = content?.logo_url;

  return (
    <>
      {/* Styles for nav underline animation and button hover */}
      <style jsx>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
          50% { transform: rotate(0); }
        }
        @keyframes shimmerBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: ${accentColor};
          transition: width 0.3s ease;
        }
        .nav-link-underline:hover {
          color: ${globalConfig.primary_color};
        }
        .nav-link-underline:hover::after {
          width: 100%;
        }
        .header-cta {
          box-shadow: 0 4px 15px color-mix(in srgb, ${accentColor} 30%, transparent);
          animation: shimmerBtn 3s ease infinite;
          transition: all 0.3s ease;
        }
        .header-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px color-mix(in srgb, ${accentColor} 40%, transparent);
        }
        :global(.phone-ring) {
          animation: ring 2s infinite;
          display: inline-block;
        }
      `}</style>

      {/* Top Emergency Bar - desktop only */}
      {showTopBar && (
        <div
          className="hidden md:block w-full py-2.5 text-center"
          style={{
            backgroundColor: topBarBg,
            color: topBarText,
          }}
        >
          <a
            href={phoneLink}
            className="text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity"
            style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
            {topBarContent}
          </a>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "shadow-lg" : ""
        }`}
        style={{
          backgroundColor: scrolled ? "#ffffff" : "#faf9f7",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile Layout */}
          <div className="md:hidden py-3 relative">
            {/* Row 1: Logo or Business Name Centered */}
            <div className="text-center mb-3">
              <a href="#" className="inline-block">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={businessData.business_name}
                    className="max-h-10 max-w-[150px] object-contain"
                  />
                ) : (
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                      color: globalConfig.primary_color,
                      fontSize: "1.5rem",
                    }}
                  >
                    {businessData.business_name}
                  </span>
                )}
              </a>
            </div>

            {/* Row 2: Phone Button Centered, Hamburger Absolute Right */}
            <div className="flex justify-center">
              <a
                href={phoneLink}
                className="header-cta flex items-center gap-2 py-2.5 px-5 rounded-full text-sm font-semibold active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, #4a3520), ${accentColor})`,
                  backgroundSize: "200% 200%",
                  color: "#fff",
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  fontSize: "0.9rem",
                }}
              >
                <Phone className="phone-ring w-4 h-4" strokeWidth={2.5} />
                <span>{phoneFormatted}</span>
              </a>
            </div>

            {/* Hamburger - absolute positioned */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
              style={{
                color: globalConfig.primary_color,
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center h-20 gap-8">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessData.business_name}
                  className="max-h-12 max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: globalConfig.primary_color }}
                  >
                    <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span
                      className="block font-bold text-xl leading-tight"
                      style={{
                        fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                        color: globalConfig.primary_color,
                      }}
                    >
                      {businessData.business_name}
                    </span>
                    <span
                      className="block text-xs font-semibold tracking-wider uppercase"
                      style={{
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: accentColor,
                      }}
                    >
                      {tagline}
                    </span>
                  </div>
                </>
              )}
            </a>

            {/* Desktop Nav - with underline animation */}
            <nav className="flex items-center gap-6 flex-1 justify-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="nav-link-underline relative py-1 text-sm font-medium transition-colors"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#0a1628",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Phone Button */}
            <a
              href={phoneLink}
              className="header-cta flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, #4a3520), ${accentColor})`,
                backgroundSize: "200% 200%",
                color: "#fff",
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              <Phone className="phone-ring w-4 h-4" strokeWidth={2.5} />
              <span>{phoneFormatted}</span>
            </a>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{
            backgroundColor: "#faf9f7",
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          <nav className="px-4 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-base font-medium border-b last:border-0 transition-colors"
                style={{
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  color: globalConfig.primary_color,
                  borderColor: "rgba(0,0,0,0.06)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
