"use client";

import { Phone, MapPin, Clock, Facebook, Instagram, Mail } from "lucide-react";
import type { SectionProps, FooterContent } from "@/types/site";

const DEFAULT_HOURS: Record<string, string> = {
  "Mon-Fri": "8:00 AM - 5:00 PM",
  "Saturday": "By Appointment",
  "Sunday": "Closed",
};

export function FooterSection({
  content,
  style,
  globalConfig,
  businessData,
}: SectionProps<FooterContent>) {
  const showHours = content?.show_hours !== false;
  const showContact = content?.show_contact !== false;
  const showSocial = content?.show_social !== false;
  const socialLinks = content?.social_links ?? {};

  const phoneDisplay = businessData.phone ?? "Contact Us";
  const address = `${businessData.city ?? ""}, ${businessData.state ?? ""}`;

  return (
    <footer
      className="relative pt-16 pb-8"
      style={{
        backgroundColor: style?.background_color ?? "#0a0a0a",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div>
            <h3
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
            >
              {businessData.business_name}
            </h3>
            <p
              className="text-white/60 leading-relaxed"
              style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
            >
              Professional plumbing services you can trust. Serving{" "}
              {businessData.city ?? "your community"} and surrounding areas with honesty,
              integrity, and quality workmanship.
            </p>
          </div>

          {/* Contact Column */}
          {showContact && (
            <div>
              <h4
                className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4"
                style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
              >
                Contact
              </h4>
              <ul className="space-y-3">
                {businessData.phone && (
                  <li>
                    <a
                      href={`tel:${businessData.phone.replace(/\D/g, "")}`}
                      className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                      style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                    >
                      <Phone className="w-4 h-4" style={{ color: globalConfig.accent_color }} />
                      {phoneDisplay}
                    </a>
                  </li>
                )}
                <li className="flex items-center gap-3 text-white/80">
                  <MapPin className="w-4 h-4" style={{ color: globalConfig.accent_color }} />
                  <span style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}>
                    {address}
                  </span>
                </li>
              </ul>

              {/* Social Links */}
              {showSocial && Object.keys(socialLinks).length > 0 && (
                <div className="flex gap-4 mt-6">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.email && (
                    <a
                      href={`mailto:${socialLinks.email}`}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hours Column */}
          {showHours && (
            <div>
              <h4
                className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4"
                style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
              >
                Business Hours
              </h4>
              <ul className="space-y-2">
                {Object.entries(DEFAULT_HOURS).map(([day, hours]) => (
                  <li
                    key={day}
                    className="flex justify-between text-white/80 text-sm"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                  >
                    <span>{day}</span>
                    <span>{hours}</span>
                  </li>
                ))}
              </ul>
              <p
                className="mt-4 text-sm"
                style={{
                  fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  color: globalConfig.accent_color,
                }}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                24/7 Emergency Service Available
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p
            className="text-white/40 text-sm"
            style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            {content?.copyright_text ??
              `© ${new Date().getFullYear()} ${businessData.business_name}. All rights reserved.`}
          </p>
          <div className="flex gap-6 text-white/40 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
