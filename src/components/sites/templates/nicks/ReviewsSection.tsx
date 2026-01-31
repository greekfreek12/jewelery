"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { SectionProps, ReviewsContent, ReviewItem } from "@/types/site";

// Default reviews
const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "1",
    author: "Happy Customer",
    rating: 5,
    text: "Great service! They showed up on time and fixed the problem quickly. Very professional and fair pricing.",
    date: "Recently",
    source: "Google",
  },
  {
    id: "2",
    author: "Satisfied Homeowner",
    rating: 5,
    text: "Called them for an emergency leak and they were here within the hour. Highly recommend!",
    date: "Recently",
    source: "Google",
  },
  {
    id: "3",
    author: "Local Resident",
    rating: 5,
    text: "Honest, reliable, and reasonably priced. Will definitely use them again for future plumbing needs.",
    date: "Recently",
    source: "Google",
  },
];

// Background image for reviews section
const DEFAULT_BG_IMAGE =
  "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80";

interface ExtendedBusinessData {
  business_name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  reviews_link?: string | null;
}

export function NicksReviewsSection({
  content,
  globalConfig,
  businessData,
}: SectionProps<ReviewsContent> & { businessData: ExtendedBusinessData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;

  const headline = content?.headline ?? "What Our Customers Say";
  const reviews = content?.items?.length ? content.items : DEFAULT_REVIEWS;
  const reviewsLink = (businessData as ExtendedBusinessData).reviews_link;
  const bgImage = (content as any)?.background_image ?? DEFAULT_BG_IMAGE;

  // Auto-advance carousel
  useEffect(() => {
    if (isAutoPlaying && reviews.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, reviews.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    goToSlide((currentIndex - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % reviews.length);
  };

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-5 h-5"
          fill={star <= rating ? accentColor : "transparent"}
          stroke={star <= rating ? accentColor : "rgba(255,255,255,0.3)"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );

  const currentReview = reviews[currentIndex];

  return (
    <section
      id="reviews"
      className="relative py-20 md:py-28 overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: primaryColor, opacity: 0.92 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-bold tracking-[0.3em] uppercase mb-4"
            style={{
              color: accentColor,
              fontFamily: `"${globalConfig.font_body}", sans-serif`,
            }}
          >
            Reviews
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white"
            style={{
              fontFamily: `"${globalConfig.font_heading}", sans-serif`,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </h2>

          {/* Overall rating */}
          {businessData.rating && businessData.review_count && businessData.review_count > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <StarRating rating={Math.round(businessData.rating)} />
              <span
                className="text-white/70 text-sm"
                style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
              >
                {businessData.rating.toFixed(1)} from {businessData.review_count} reviews
              </span>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Review Card */}
          <div
            className="text-center px-4 md:px-12 py-8"
            style={{ minHeight: "280px" }}
          >
            {/* Quote mark */}
            <div
              className="text-6xl md:text-7xl leading-none mb-4 opacity-30"
              style={{
                fontFamily: "Georgia, serif",
                color: accentColor,
              }}
            >
              &ldquo;
            </div>

            {/* Review text */}
            <p
              className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 text-white/90"
              style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
            >
              {currentReview.text}
            </p>

            {/* Stars */}
            <div className="flex justify-center mb-4">
              <StarRating rating={currentReview.rating} />
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-white font-semibold"
                style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
              >
                {currentReview.author}
              </span>
              {currentReview.date && (
                <>
                  <span className="text-white/40">·</span>
                  <span
                    className="text-white/50 text-sm"
                    style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
                  >
                    {currentReview.date}
                  </span>
                </>
              )}
            </div>

            {/* Google badge */}
            <div className="flex items-center justify-center gap-1.5 mt-3 text-white/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-xs">Verified Google Review</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-6" : ""
                }`}
                style={{
                  backgroundColor: index === currentIndex ? accentColor : "rgba(255,255,255,0.3)",
                }}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View all link */}
        {reviewsLink && (
          <div className="text-center mt-10">
            <a
              href={reviewsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all duration-200 hover:gap-3"
              style={{
                backgroundColor: "transparent",
                border: `2px solid ${accentColor}`,
                color: accentColor,
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              View All Reviews on Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
