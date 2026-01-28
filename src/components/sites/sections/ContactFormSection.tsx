"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import type { SectionProps, ContactFormContent } from "@/types/site";

export function ContactFormSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ContactFormContent>) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });

  const headline = content?.headline ?? "Get a Free Quote";
  const subheadline = content?.subheadline ?? "Fill out the form below and we'll get back to you within the hour.";
  const buttonText = content?.button_text ?? "Send Message";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative py-20 md:py-28"
      style={{ backgroundColor: "#161B22" }}
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: globalConfig.accent_color }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left side - Text */}
          <div>
            <p
              className="text-sm uppercase tracking-[0.25em] mb-4"
              style={{
                color: globalConfig.accent_color,
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              Contact Us
            </p>
            <h2
              className="text-4xl md:text-5xl font-black mb-6 leading-tight"
              style={{
                fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                color: "#E6EDF3",
              }}
            >
              {headline}
            </h2>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                color: "#7D8590",
              }}
            >
              {subheadline}
            </p>

            {/* Quick contact info */}
            <div className="space-y-3">
              {businessData.phone && (
                <p
                  className="text-base"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#E6EDF3",
                  }}
                >
                  <span style={{ color: "#7D8590" }}>Phone: </span>
                  <a
                    href={`tel:${businessData.phone.replace(/\D/g, "")}`}
                    className="hover:underline"
                    style={{ color: globalConfig.accent_color }}
                  >
                    {businessData.phone}
                  </a>
                </p>
              )}
              {businessData.city && businessData.state && (
                <p
                  className="text-base"
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#E6EDF3",
                  }}
                >
                  <span style={{ color: "#7D8590" }}>Serving: </span>
                  {businessData.city}, {businessData.state} and surrounding areas
                </p>
              )}
            </div>
          </div>

          {/* Right side - Form */}
          <div
            className="p-8 md:p-10"
            style={{ backgroundColor: "#0C1117" }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: globalConfig.accent_color }}
                />
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                    color: "#E6EDF3",
                  }}
                >
                  Message Sent!
                </h3>
                <p
                  style={{
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    color: "#7D8590",
                  }}
                >
                  We&apos;ll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    className="block text-sm uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: "#7D8590",
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 text-base outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      color: "#E6EDF3",
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                    placeholder="John Smith"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    className="block text-sm uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: "#7D8590",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 text-base outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      color: "#E6EDF3",
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    className="block text-sm uppercase tracking-wider mb-2"
                    style={{
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                      color: "#7D8590",
                    }}
                  >
                    How can we help?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-base outline-none transition-all focus:ring-2 resize-none"
                    style={{
                      backgroundColor: "#161B22",
                      border: "1px solid #30363D",
                      color: "#E6EDF3",
                      fontFamily: `"${globalConfig.font_body}", sans-serif`,
                    }}
                    placeholder="Describe your plumbing issue..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-base font-bold transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: globalConfig.accent_color,
                    color: "#0C1117",
                    fontFamily: `"${globalConfig.font_body}", sans-serif`,
                  }}
                >
                  <Send className="w-5 h-5" />
                  {buttonText}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
