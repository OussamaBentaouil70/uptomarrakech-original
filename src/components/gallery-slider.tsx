"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export function GallerySlider({ coverImage, gallery, alt }: { coverImage: string; gallery: string[]; alt: string }) {
  const images = useMemo(() => {
    const unique = new Set([coverImage, ...gallery]);
    return Array.from(unique).filter(Boolean);
  }, [coverImage, gallery]);
  const [index, setIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Keep the active thumbnail visible in the scrolling strip (without scrolling the page).
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [index]);

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
      <div className="min-w-0 space-y-3">
      <div
        className="relative h-72 w-full touch-pan-y overflow-hidden rounded-3xl border border-border/70 bg-white/60 sm:h-96"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) > 40) (dx > 0 ? prev : next)(); // swipe on phones
        }}
      >
        <button
          type="button"
          className="absolute inset-0 z-10"
          onClick={() => setIsZoomOpen(true)}
          aria-label="Open image in zoom view"
        />
        <Image src={images[index] ?? coverImage} alt={alt} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-all duration-500 hover:scale-[1.02]" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/15" />
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/45 bg-black/35 p-2 text-white backdrop-blur">
          <ZoomIn className="h-4 w-4" />
        </div>
        {images.length > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/45 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/45 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        // Fixed-size thumbnails in a horizontally scrolling strip (never squeezed).
        <div
          ref={stripRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/40"
        >
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-20 sm:w-28 ${i === index ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
              onClick={() => setIndex(i)}
            >
              <Image src={img} alt="" fill sizes="112px" className="object-cover transition-transform duration-500 hover:scale-110" />
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

