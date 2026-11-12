"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Partner = { name: string; logo: string; href: string };

/** Partner logos: 4 visible on desktop, endless smooth loop, arrows on both sides. */
export function PartnersSlider({ partners }: { partners: Partner[] }) {
  // Loop mode needs more slides than are visible: repeat the list.
  const slides = partners.length < 8 ? [...partners, ...partners, ...partners].slice(0, Math.max(8, partners.length)) : partners;

  return (
    <div className="relative px-12 md:px-16">
      <button
        type="button"
        aria-label="Previous"
        className="partners-prev absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-zinc-800 shadow-md transition-all hover:border-primary hover:bg-primary hover:text-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        className="partners-next absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-zinc-800 shadow-md transition-all hover:border-primary hover:bg-primary hover:text-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <Swiper
        modules={[Autoplay, Navigation]}
        loop
        speed={900}
        spaceBetween={24}
        slidesPerView={2}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
        autoplay={{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{ prevEl: ".partners-prev", nextEl: ".partners-next" }}
      >
        {slides.map((p, i) => (
          <SwiperSlide key={`${p.name}-${i}`}>
            <Link
              href={p.href}
              title={p.name}
              className="group flex h-36 items-center justify-center rounded-3xl border border-border/50 bg-white px-6 py-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl md:h-40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
