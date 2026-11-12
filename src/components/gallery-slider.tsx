"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { X, ZoomIn } from "lucide-react";

export function GallerySlider({ coverImage, gallery, alt }: { coverImage: string; gallery: string[]; alt: string }) {
  const images = useMemo(() => {
    const unique = new Set([coverImage, ...gallery]);
    return Array.from(unique).filter(Boolean);
  }, [coverImage, gallery]);
  const [index, setIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const prev = useCallback(() => {
    setIndex((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((p) => (p + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isZoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsZoomOpen(false);
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen, next, prev]);

  return (
    <>
      <div className="space-y-3">
      <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-border/70 bg-white/60">
        <button
          type="button"
          className="absolute inset-0 z-10"
          onClick={() => setIsZoomOpen(true)}
          aria-label="Open image in zoom view"
        />
        <Image src={images[index] ?? coverImage} alt={alt} fill className="object-cover transition-all duration-500 hover:scale-[1.02]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/15" />
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/45 bg-black/35 p-2 text-white backdrop-blur">
          <ZoomIn className="h-4 w-4" />
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/45"
            >
              {"<"}
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/45"
            >
              {">"}
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              className={`relative h-20 w-28 overflow-hidden rounded-xl border-2 transition-all duration-300 ${i === index ? "border-primary shadow-md" : "border-transparent opacity-75 hover:opacity-100"}`}
              onClick={() => setIndex(i)}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-cover transition-transform duration-500 hover:scale-110" />
            </button>
          ))}
        </div>
      )}
      </div>

      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom view"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="rounded-full border border-white/45 bg-black/35 p-2 text-white transition-all hover:scale-105"
              aria-label="Close image zoom"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-5 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all hover:scale-105"
                aria-label="Previous image"
              >
                {"<"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-5 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all hover:scale-105"
                aria-label="Next image"
              >
                {">"}
              </button>
            </>
          )}

          <div className="absolute inset-0 p-6 sm:p-10" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20">
              <Image
                src={images[index] ?? coverImage}
                alt={`${alt} zoomed`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

