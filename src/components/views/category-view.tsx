import Link from "next/link";
import type { Category, CategorySection, Lang, Product } from "@/lib/types";
import { ProductCard } from "@/components/views/cards";
import { VillaBrowser } from "@/components/villa-browser";

type Props = {
  lang: Lang;
  category: Category;
  items: Product[];
  section: CategorySection | null;
  others: { category: Category; image: string | null }[];
};

/** Text on the left, image on the right (data/category-sections.json). */
function CategorySectionBlock({ section }: { section: CategorySection }) {
  return (
    <section className="mt-24 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-5">
        <h2 className="ui-section-title">{section.title}</h2>
        <div className="h-px w-20 bg-primary" />
        <div className="prose max-w-none text-base leading-relaxed sm:text-lg">
          {section.blocks.map((b, i) =>
            b.h3 ? (
              <h3 key={i}>{b.h3}</h3>
            ) : b.ul ? (
              <ul key={i}>
                {b.ul.map((li) => (
                  <li key={li} dangerouslySetInnerHTML={{ __html: li }} />
                ))}
              </ul>
            ) : (
              <p key={i}>{b.p}</p>
            ),
          )}
        </div>
      </div>
      <div className="lg:sticky lg:top-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.image} alt={section.title} loading="lazy" className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[560px]" />
      </div>
    </section>
  );
}

export function CategoryView({ lang, category, items, section, others }: Props) {
  const fr = lang === "fr";
  const banner = items.find((i) => i.images[0])?.images[0]?.src;
  const isVilla = category.type === "accommodation";

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border/40 bg-primary/5">
        {banner && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner} alt={category.name} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/25 to-black/35" />
          </>
        )}
        <div className="relative px-6 py-24 text-center md:py-28">
          <div className="mx-auto max-w-3xl space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/90">{fr ? "La collection" : "The Collection"}</span>
            <h1 className="ui-display text-5xl font-semibold tracking-tight text-white md:text-6xl">{category.name}</h1>
            <p className="text-lg font-light text-white/90">
              {items.length}{" "}
              {fr
                ? items.length > 1
                  ? "adresses sélectionnées à Marrakech"
                  : "adresse sélectionnée à Marrakech"
                : items.length > 1
                  ? "places selected in Marrakech"
                  : "place selected in Marrakech"}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* WordPress category description (SEO intro) */}
        {category.descriptionHtml && (
          <div className="prose mx-auto mb-12 max-w-4xl text-center" dangerouslySetInnerHTML={{ __html: category.descriptionHtml }} />
        )}

        {isVilla ? (
          <VillaBrowser
            lang={lang}
            villas={items.map((v) => ({
              id: v.id,
              path: v.path,
              title: v.title,
              excerpt: v.excerpt,
              image: v.images[0]?.src ?? null,
              location: v.villa?.location ?? null,
              rooms: v.villa?.rooms ?? null,
              people: v.villa?.people ?? null,
              priceFrom: v.villa?.priceFrom ?? null,
            }))}
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} lang={lang} />
            ))}
          </div>
        )}

        {section && <CategorySectionBlock section={section} />}

        {others.length > 0 && (
          <section className="mt-24 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{fr ? "Services complémentaires" : "Additional services"}</span>
              <h2 className="ui-heading text-3xl font-semibold sm:text-4xl">
                {fr ? "Explorez d'autres expériences à Marrakech" : "Explore more experiences in Marrakech"}
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {others.map(({ category: other, image }) => (
                <Link key={other.id} href={other.path} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40">
                  <div className="relative h-52 w-full">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={other.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-primary/25 via-secondary/20 to-background" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">{fr ? "Service complémentaire" : "Additional service"}</p>
                    <h3 className="mt-1 text-2xl font-semibold leading-tight">{other.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
