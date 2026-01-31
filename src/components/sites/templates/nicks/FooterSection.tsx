"use client";

import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import type { SectionProps, FooterContent } from "@/types/site";

// Default services for the services column
const DEFAULT_SERVICES = [
  { name: "Drain Cleaning", href: "#services" },
  { name: "Water Heaters", href: "#services" },
  { name: "Leak Detection", href: "#services" },
  { name: "Pipe Repair", href: "#services" },
  { name: "Fixtures", href: "#services" },
  { name: "Emergency Service", href: "#services" },
];

// Company links
const COMPANY_LINKS = [
  { name: "About Us", href: "#about" },
  { name: "Reviews", href: "#reviews" },
  { name: "Service Areas", href: "#service-area" },
  { name: "Contact", href: "#contact" },
];

interface ExtendedBusinessData {
  business_name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  // Optional social/hours fields
  facebook_url?: string | null;
  instagram_url?: string | null;
  is_24_7?: boolean;
  category?: string | null;
}

export function NicksFooterSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<FooterContent> & { businessData: ExtendedBusinessData }) {
  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;

  // Generate email from business name slug
  const businessSlug = businessData.business_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
  const email = `info@${businessSlug}.com`;

  // Location string
  const location = [businessData.city, businessData.state]
    .filter(Boolean)
    .join(", ");

  // Category for description (default to "plumber")
  const category = businessData.category || "plumber";

  // Check if 24/7
  const is24_7 = businessData.is_24_7 ?? false;

  // Social links - only show if they exist
  const hasFacebook = !!businessData.facebook_url;
  const hasInstagram = !!businessData.instagram_url;
  const hasSocial = hasFacebook || hasInstagram;

  return (
    <footer
      id="footer"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Main footer content */}
      <div className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* Column 1: Brand & Description */}
            <div className="lg:col-span-1">
              {/* Logo & Name */}
              <div className="flex items-center gap-3 mb-5">
                {/* Checkmark icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
                >
                  {businessData.business_name}
                </span>
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Your trusted local {category} serving {businessData.city || "your area"} and
                surrounding areas. Licensed, insured, and committed to excellence.
              </p>

              {/* Social Icons - only if they have them */}
              {hasSocial && (
                <div className="flex gap-3">
                  {hasFacebook && (
                    <a
                      href={businessData.facebook_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <Facebook className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {hasInstagram && (
                    <a
                      href={businessData.instagram_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <Instagram className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Services */}
            <div>
              <h3
                className="text-sm font-bold tracking-wide uppercase mb-5 text-white"
                style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
              >
                Services
              </h3>
              <ul className="space-y-3">
                {DEFAULT_SERVICES.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      className="text-sm transition-colors duration-200"
                      style={{
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: "rgba(255,255,255,0.6)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      }}
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h3
                className="text-sm font-bold tracking-wide uppercase mb-5 text-white"
                style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
              >
                Company
              </h3>
              <ul className="space-y-3">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: "rgba(255,255,255,0.6)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3
                className="text-sm font-bold tracking-wide uppercase mb-5 text-white"
                style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
              >
                Contact
              </h3>
              <ul className="space-y-4">
                {/* Phone */}
                {businessData.phone && (
                  <li>
                    <a
                      href={`tel:${businessData.phone}`}
                      className="flex items-center gap-3 text-sm text-white transition-colors duration-200"
                      style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "white";
                      }}
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                      {businessData.phone}
                    </a>
                  </li>
                )}

                {/* Email */}
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-sm transition-colors duration-200"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: "rgba(255,255,255,0.6)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                    }}
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                    {email}
                  </a>
                </li>

                {/* Location */}
                {location && (
                  <li className="flex items-center gap-3 text-sm text-white"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                    {location}
                  </li>
                )}

                {/* 24/7 Emergency - only if is_24_7 is true */}
                {is24_7 && (
                  <li className="flex items-center gap-3 text-sm font-semibold"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: accentColor,
                    }}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    24/7 Emergency Service
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-6 md:px-12 py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="max-w-7xl mx-auto">
          <p
            className="text-xs text-center md:text-left"
            style={{
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2026 {businessData.business_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
