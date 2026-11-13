"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ArrowRight } from "lucide-react";

export type SlideItem = { id: number; path: string; title: string; image: string | null; imageAlt?: string; label: string };

/** Same slider as the mymarrakechtrip home page (image cards, autoplay, arrows). */
export function ProductSlider({ items, cta }: { items: SlideItem[]; cta: string }) {
  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      spaceBetween={24}
      slidesPerView={1.1}
      breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3.2 } }}
      autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      navigation
      className="pb-12!"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <Link
            href={item.path}
            className="group/card relative block h-[340px] overflow-hidden rounded-3xl bg-secondary/30 transition-all duration-500 hover:shadow-2xl"
          >
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover/card:scale-110" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover/card:opacity-90" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <div className="translate-y-4 transition-transform duration-500 group-hover/card:translate-y-0">
                <span className="mb-3 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur-md">
                  {item.label}
                </span>
                <h3 className="ui-heading mb-2 text-2xl font-semibold leading-tight text-white! md:text-3xl">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-0 transition-all duration-500 group-hover/card:opacity-100">
                  {cta} <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
