import Link from "next/link";
import { BedDouble, MapPin, Phone, Users } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import type { Category, Lang, Product, VillaDetails } from "@/lib/types";
import { getCategoryLabel } from "@/lib/locale";
import { SITE, whatsappHref } from "@/lib/site";
import { GallerySlider } from "@/components/gallery-slider";
import { InquiryForm } from "@/components/inquiry-form";
import { HotAirBalloonForm } from "@/components/hot-air-balloon-form";
import { ProductCard } from "@/components/views/cards";

type Props = { lang: Lang; item: Product; category: Category | null; suggestions: Product[] };

function ContactCard({ lang, villa }: { lang: Lang; villa: VillaDetails | null }) {
  const fr = lang === "fr";
  return (
    <div className="ui-surface space-y-6 border-primary/20 bg-card/60 p-8 backdrop-blur-xl">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{fr ? "Réservation" : "Reservation"}</p>
        {villa?.priceFrom ? (
          <p className="ui-heading text-3xl font-bold">
            <span className="text-sm font-normal text-muted-foreground">{fr ? "À partir de " : "From "}</span>
            {villa.priceFrom.toLocaleString(fr ? "fr-FR" : "en-GB")}€
            <span className="ml-1 text-sm font-normal text-muted-foreground">/ {fr ? "nuit" : "night"}</span>
          </p>
        ) : (
          <p className="ui-heading text-2xl font-bold">{fr ? "Prix sur demande" : "Price on request"}</p>
        )}
        {villa && (villa.rooms || villa.people || villa.location) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-zinc-700">
            {villa.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {villa.location}</span>}
            {villa.rooms != null && <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary" /> {villa.rooms} {fr ? "chambres" : "bedrooms"}</span>}
            {villa.people != null && <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {villa.people} {fr ? "personnes" : "guests"}</span>}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {fr ? "Réservation gratuite • Paiement sur place • Assistance 7j/7" : "Free booking • Pay on site • 7/7 support"}
        </p>
      </div>
      <div className="space-y-3 border-t border-border/30 pt-4">
        <a href={SITE.phoneHref} className="flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-4 w-4" />
          </span>
          {SITE.phoneDisplay}
        </a>
        <a href={whatsappHref()} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" />
          </span>
          {fr ? "Concierge WhatsApp" : "WhatsApp concierge"}
        </a>
      </div>
    </div>
  );
}

export function ProductView({ lang, item, category, suggestions }: Props) {
  const fr = lang === "fr";
  const cover = item.images[0]?.src ?? "";
  const categoryType = item.categoryType ?? "activity";
  const isHotAirBalloon = /hot-air-balloon|montgolfiere/i.test(item.slug) || /hot\s*air\s*balloon|montgolfi/i.test(item.title);
  const form = isHotAirBalloon ? (
    <HotAirBalloonForm itemId={String(item.id)} itemSlug={item.slug} categoryType={categoryType} />
  ) : (
    <InquiryForm itemId={String(item.id)} itemSlug={item.slug} categoryType={categoryType} />
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[60vh] w-full overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={item.images[0]?.alt || item.title} className="h-full w-full object-cover" fetchPriority="high" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-center px-6 pb-20">
          <div className="w-full max-w-4xl space-y-4 text-center">
            {category && (
              <Link
                href={category.path}
                className="inline-block rounded-full border border-primary bg-primary/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white backdrop-blur-md"
              >
                {category.name}
              </Link>
            )}
            <h1 className="ui-display text-5xl font-bold tracking-tight md:text-7xl">{item.title}</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="min-w-0 space-y-16 lg:col-span-2">
            {item.images.length > 0 && (
              <GallerySlider
                coverImage={cover}
                gallery={item.images.slice(1).map((i) => i.src)}
                alt={item.title}
                altBySrc={Object.fromEntries(item.images.map((i) => [i.src, i.alt]))}
              />
            )}
            <div className="space-y-8">
              <h2 className="ui-heading border-l-4 border-primary pl-6 text-3xl font-semibold">
                {fr ? "À propos de cette expérience" : "About this experience"}
              </h2>
              <div
                className="prose max-w-none min-w-0 wrap-anywhere text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.contentHtml || item.excerptHtml }}
              />
            </div>
            <div className="space-y-6 lg:hidden">
              <div className="ui-surface border-primary/15 bg-linear-to-b from-white to-card p-6 shadow-2xl">{form}</div>
              <ContactCard lang={lang} villa={item.villa} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <div className="ui-surface border-primary/15 bg-linear-to-b from-white to-card p-6 shadow-2xl sm:p-8">{form}</div>
              <ContactCard lang={lang} villa={item.villa} />
            </div>
          </aside>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mx-auto max-w-7xl space-y-6 px-6 pb-20">
          <div className="border-b border-border/40 pb-4">
            <h2 className="ui-heading text-3xl font-semibold md:text-4xl">
              {fr ? "Autres suggestions" : "Other suggestions"}
              {item.categoryType && <span className="sr-only"> – {getCategoryLabel(lang, item.categoryType)}</span>}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s) => (
              <ProductCard key={s.id} item={s} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
