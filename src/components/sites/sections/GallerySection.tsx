"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionProps, GalleryContent } from "@/types/site";

const DEFAULT_IMAGES = [
  { url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80", alt: "Professional plumbing work" },
  { url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80", alt: "Water heater installation" },
  { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", alt: "Modern bathroom" },
  { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80", alt: "Kitchen plumbing" },
  { url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80", alt: "Pipe work" },
  { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80", alt: "Bathroom renovation" },
];

export function GallerySection({
  content,
  style,
  globalConfig,
  businessData,
}: SectionProps<GalleryContent>) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const headline = content?.headline ?? "Our Work";
  const images = content?.images ?? DEFAULT_IMAGES;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section
      id="gallery"
      className="py-20"
      style={{
        backgroundColor: style?.background_color ?? globalConfig.primary_color,
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: `"${globalConfig.font_heading}", sans-serif` }}
          >
            {headline}
          </h2>
        </div>

        {/* Uniform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.slice(0, 6).map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden group cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${image.url})` }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt ?? "Gallery image"}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
