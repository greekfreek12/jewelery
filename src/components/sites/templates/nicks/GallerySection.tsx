"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionProps, GalleryContent } from "@/types/site";

export function NicksGallerySection({
  content,
  globalConfig,
  businessData,
}: SectionProps<GalleryContent>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const primaryColor = globalConfig.primary_color;
  const accentColor = globalConfig.accent_color;

  const headline = content?.headline ?? "Our Work";
  const subheadline = content?.subheadline ?? `Quality craftsmanship on every job`;
  const images = content?.images ?? [];

  // Don't render if less than 3 images
  if (images.length < 3) {
    return null;
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };
  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <section
        id="gallery"
        className="relative py-20 md:py-28 px-6 md:px-12"
        style={{ backgroundColor: "#faf9f7" }}
      >
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center">
            <span
              className="inline-block text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{
                color: accentColor,
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
              }}
            >
              Gallery
            </span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{
                fontFamily: `"${globalConfig.font_heading}", sans-serif`,
                color: primaryColor,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{
                fontFamily: `"${globalConfig.font_body}", sans-serif`,
                color: "#64748b",
              }}
            >
              {subheadline}
            </p>
          </div>
        </div>

        {/* Uniform grid - all same size */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.slice(0, 8).map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden cursor-pointer group aspect-square"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${businessData.business_name} work ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}80` }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
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
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Number badge on last image if more exist */}
                {index === 7 && images.length > 8 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}90` }}
                  >
                    <span
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
                    >
                      +{images.length - 8}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: `${primaryColor}f0` }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt || "Gallery image"}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Counter */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm"
            style={{ fontFamily: `"${globalConfig.font_body}", sans-serif` }}
          >
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
