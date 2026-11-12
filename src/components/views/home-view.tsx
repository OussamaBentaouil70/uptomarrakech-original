import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Category, Lang, Page, Post } from "@/lib/types";
import { BLOG_PATH, HOME_ABOUT_IMAGE, HOME_HERO_IMAGE, NAV, PARTNERS } from "@/lib/site";
import { PostCard } from "@/components/views/cards";
import { toSections } from "@/components/views/page-views";
import { HeroSearch } from "@/components/hero-search";
import { ProductSlider, type SlideItem } from "@/components/product-slider";
import { PartnersSlider } from "@/components/partners-slider";

export type HomeSection = { heading: string; text: string; category: Category; items: SlideItem[] };

type Props = {
  lang: Lang;
  page: Page;
  tiles: { category: Category; image: string | null }[];
  sections: HomeSection[];
  posts: Post[];
};

export function HomeView({ lang, page, tiles, sections, posts }: Props) {
  const fr = lang === "fr";
  const blocks = page.blocks;
  const h1 = blocks.find((b) => b.tag === "h1")?.text ?? page.title;
  const firstH1 = blocks.findIndex((b) => b.tag === "h1");
  const subtitle = blocks.slice(firstH1 + 1).find((b) => b.tag === "p")?.text;
  const badges = blocks.filter((b) => b.tag === "li").slice(0, 3).map((b) => b.text.replace(/[*\s​]+$/, ""));
  const all = toSections(blocks);
  const explore = all.find((s) => s.tag === "h2");
  const about = all.find((s) => /référence|reference|go-to/i.test(s.heading) && s.paragraphs.length);
  const partners = all.find((s) => /partenaires|partners/i.test(s.heading));
  const contactHref = NAV[lang].find((l) => "href" in l && /contact/.test(l.href)) as { href: string } | undefined;

  return (
    <div className="bg-background">
      {/* Hero with site search */}
      <section className="relative flex min-h-[min(92vh,980px)] items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HOME_HERO_IMAGE} alt={h1} className="h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/40" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-16 pt-32 text-center text-white">
          <h1 className="ui-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-7xl">{h1}</h1>
          {subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-white/90 sm:text-xl">{subtitle}</p>}
          <HeroSearch lang={lang} />
          {badges.length > 0 && (
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {badges.map((b) => (
                <li key={b} className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4" /> {b}
                </li>
              ))}
            </ul>
          )}
          {contactHref && (
            <div className="mt-8">
              <Link
                href={contactHref.href}
                className="inline-block rounded-full border border-white/70 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-zinc-900"
              >
                {fr ? "Nous contacter" : "Contact us"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Explore by category */}
      <section id="explorer" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
        <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
          <p className="ui-eyebrow">{fr ? "Nos services" : "Our services"}</p>
          <h2 className="ui-section-title">{explore?.heading ?? (fr ? "Explorez Marrakech à votre façon" : "Explore Marrakech your way")}</h2>
          {explore?.paragraphs[0] && <p className="ui-prose text-lg">{explore.paragraphs[0]}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tiles.map(({ category, image }) => (
            <Link key={category.id} href={category.path} className="group relative h-48 overflow-hidden rounded-3xl md:h-60">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={category.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <h3 className="text-xl font-semibold leading-tight md:text-2xl">{category.name}</h3>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* One slider per category, with the WordPress wording */}
      {sections.map((s, i) => (
        <section key={s.category.id} className={i % 2 === 0 ? "bg-primary/5" : ""}>
          <div className="mx-auto max-w-7xl space-y-10 px-6 py-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <h2 className="ui-section-title">{s.heading}</h2>
                {s.text && <p className="ui-prose text-lg">{s.text}</p>}
              </div>
              <Link href={s.category.path} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline">
                {fr ? "Tout voir" : "See all"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductSlider items={s.items} cta={fr ? "Découvrir" : "Discover"} />
          </div>
        </section>
      ))}

      {about && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-5">
              <p className="ui-eyebrow">{fr ? "Qui sommes-nous" : "About us"}</p>
              <h2 className="ui-section-title">{about.heading}</h2>
              <div className="h-px w-20 bg-primary" />
              {about.paragraphs.map((p) => (
                <p key={p} className="ui-prose text-lg leading-relaxed">{p}</p>
              ))}
              {contactHref && (
                <Link
                  href={contactHref.href}
                  className="inline-flex items-center gap-2 pt-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  {fr ? "Parlons de votre séjour" : "Let's plan your stay"} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HOME_ABOUT_IMAGE}
                alt={fr ? "Porte de la médersa Ben Youssef à Marrakech" : "Doorway of the Ben Youssef Madrasa in Marrakech"}
                loading="lazy"
                className="h-[420px] w-full rounded-[2rem] object-cover shadow-2xl sm:h-[520px]"
              />
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl space-y-10 px-6 pb-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="ui-section-title">{fr ? "Derniers articles du blog" : "Latest from the blog"}</h2>
            <Link href={BLOG_PATH[lang]} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:underline">
              Blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {/* Partners (same logos and links as the WordPress home page) */}
      <section className="border-t border-border/50 bg-white/60">
        <div className="mx-auto max-w-7xl space-y-10 px-6 py-16 text-center">
          <div className="mx-auto max-w-2xl space-y-3">
            <h2 className="ui-section-title">{partners?.heading ?? (fr ? "Nos partenaires" : "Our partners")}</h2>
            {partners?.paragraphs[0] && <p className="ui-prose">{partners.paragraphs[0]}</p>}
          </div>
          <PartnersSlider partners={PARTNERS.map((p) => ({ name: p.name, logo: p.logo, href: p.href[lang] }))} />
        </div>
      </section>
    </div>
  );
}
