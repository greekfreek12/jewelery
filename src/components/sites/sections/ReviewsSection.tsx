"use client";

import { Star, Quote } from "lucide-react";
import type { SectionProps, ReviewsContent, ReviewItem } from "@/types/site";

const DEFAULT_REVIEWS: ReviewItem[] = [
  { id: "1", author: "Sarah M.", rating: 5, text: "Best plumber I've ever used. Showed up when they said they would, fixed the problem fast, and the price was exactly what they quoted.", date: "2 weeks ago" },
  { id: "2", author: "Mike T.", rating: 5, text: "These guys are the real deal. Professional, courteous, and they actually cleaned up after themselves. Rare to find!", date: "1 month ago" },
  { id: "3", author: "Jennifer L.", rating: 5, text: "Had an emergency leak at 10pm and they were here within an hour. Can't recommend them enough!", date: "3 weeks ago" },
];

export function ReviewsSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ReviewsContent>) {
  const headline = content?.headline ?? "What Our Customers Say";
  const reviews = content?.items ?? DEFAULT_REVIEWS;

  return (
    <section id="reviews" className="relative py-20 md:py-28" style={{ backgroundColor: "#161B22" }}>
      {/* Decorative quote */}
      <div className="absolute top-12 right-12 opacity-5">
        <Quote className="w-48 h-48" style={{ color: globalConfig.accent_color }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14">
          <p
            className="text-sm uppercase tracking-[0.25em] mb-4"
            style={{ color: globalConfig.accent_color, fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            Testimonials
          </p>
          <h2
            className="text-4xl md:text-5xl font-black mb-4 leading-tight"
            style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif`, color: "#E6EDF3" }}
          >
            {headline}
          </h2>
          {businessData.rating && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    fill={i < Math.round(businessData.rating || 0) ? globalConfig.accent_color : "transparent"}
                    stroke={globalConfig.accent_color}
                  />
                ))}
              </div>
              <span style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#7D8590" }}>
                {businessData.rating} stars · {businessData.review_count} reviews on Google
              </span>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review) => (
            <article
              key={review.id}
              className="relative p-6 transition-all duration-300 hover:translate-y-[-4px]"
              style={{ backgroundColor: "#0C1117", border: "1px solid #30363D" }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    fill={i < review.rating ? globalConfig.accent_color : "transparent"}
                    stroke={globalConfig.accent_color}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p
                className="leading-relaxed mb-6"
                style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#E6EDF3" }}
              >
                {review.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center font-bold"
                  style={{ backgroundColor: globalConfig.accent_color, color: "#0C1117" }}
                >
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p
                    className="font-semibold"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif`, color: "#E6EDF3" }}
                  >
                    {review.author}
                  </p>
                  {review.date && (
                    <p className="text-sm" style={{ color: "#7D8590" }}>{review.date}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
