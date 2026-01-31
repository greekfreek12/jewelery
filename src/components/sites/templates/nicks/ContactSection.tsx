"use client";

import { useState } from "react";
import { Phone, Mail, Clock, MapPin, Send } from "lucide-react";
import type { SectionProps, ContactFormContent } from "@/types/site";

const SERVICE_OPTIONS = [
  "Drain Cleaning",
  "Water Heater",
  "Leak Repair",
  "Pipe Repair",
  "Fixture Installation",
  "Emergency Service",
  "Other",
];

interface ExtendedBusinessData {
  business_name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  working_hours?: string | null;
  is_24_7?: boolean;
  category?: string | null;
}

export function NicksContactSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ContactFormContent> & { businessData: ExtendedBusinessData }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;
  const headline = content?.headline ?? "Get in Touch";
  const subheadline = content?.subheadline ?? "Ready to solve your plumbing problems? Contact us today for a free estimate. We respond to all inquiries within 2 hours during business hours.";
  const buttonText = content?.button_text ?? "Request Free Estimate";

  const location = [businessData.city, businessData.state].filter(Boolean).join(", ");

  // Generate email from business name
  const businessSlug = businessData.business_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
  const email = `info@${businessSlug}.com`;

  // Hours display
  const hoursDisplay = businessData.is_24_7
    ? "24/7 Emergency Service"
    : businessData.working_hours || "Mon-Fri 8am-6pm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API endpoint
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative py-16 md:py-24 px-6 md:px-12"
      style={{ backgroundColor: "#f8f8f6" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left side - Contact Info */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                color: primaryColor,
                fontStyle: "italic",
              }}
            >
              {headline}
            </h2>
            <p
              className="text-base mb-10 leading-relaxed"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                color: "#64748b",
                maxWidth: "440px",
              }}
            >
              {subheadline}
            </p>

            {/* Contact details */}
            <div className="space-y-6">
              {/* Phone */}
              {businessData.phone && (
                <a
                  href={`tel:${businessData.phone}`}
                  className="flex items-start gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{
                        color: "#94a3b8",
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      Phone
                    </span>
                    <span
                      className="text-base font-medium transition-colors group-hover:opacity-80"
                      style={{
                        color: primaryColor,
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      {businessData.phone}
                    </span>
                  </div>
                </a>
              )}

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="flex items-start gap-4 group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{
                      color: "#94a3b8",
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                  >
                    Email
                  </span>
                  <span
                    className="text-base font-medium transition-colors group-hover:opacity-80"
                    style={{
                      color: primaryColor,
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                  >
                    {email}
                  </span>
                </div>
              </a>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{
                      color: "#94a3b8",
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                  >
                    Hours
                  </span>
                  <span
                    className="text-base font-medium"
                    style={{
                      color: primaryColor,
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                  >
                    {hoursDisplay}
                  </span>
                </div>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{
                        color: "#94a3b8",
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      Location
                    </span>
                    <span
                      className="text-base font-medium"
                      style={{
                        color: primaryColor,
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      {location}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            {submitted ? (
              <div
                className="h-full flex flex-col items-center justify-center text-center p-10 rounded-lg shadow-lg"
                style={{ backgroundColor: "#ffffff" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                    color: primaryColor,
                  }}
                >
                  Message Sent!
                </h3>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#64748b",
                  }}
                >
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <div
                className="p-8 md:p-10 rounded-lg shadow-lg"
                style={{ backgroundColor: "#ffffff" }}
              >
                <h3
                  className="text-xl md:text-2xl font-bold mb-6"
                  style={{
                    fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                    color: primaryColor,
                  }}
                >
                  Request a Free Estimate
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Phone row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{
                          color: primaryColor,
                          fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        }}
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-md outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          fontFamily: `"${globalConfig.font_body}", sans-serif`,
                          color: primaryColor,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = accentColor;
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{
                          color: primaryColor,
                          fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-md outline-none transition-all duration-200"
                        style={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          fontFamily: `"${globalConfig.font_body}", sans-serif`,
                          color: primaryColor,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = accentColor;
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: primaryColor,
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-md outline-none transition-all duration-200"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: primaryColor,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Service dropdown */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: primaryColor,
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      Service Needed
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-md outline-none transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: formData.service ? primaryColor : "#94a3b8",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <option value="">Select a service...</option>
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: primaryColor,
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      }}
                    >
                      Tell Us About Your Problem
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-md outline-none transition-all duration-200 resize-none"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontFamily: `"${globalConfig.font_body}", sans-serif`,
                        color: primaryColor,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      placeholder="Describe what's going on..."
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md font-semibold text-white transition-all duration-200"
                    style={{
                      backgroundColor: accentColor,
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Send className="w-4 h-4" />
                    {buttonText}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
