import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  alternatePaths,
  coverOf,
  entityForRoute,
  getCategory,
  getCategoryByType,
  getCategorySection,
  getPage,
  getPageByKind,
  getPost,
  getProduct,
  getRoute,
  listCategories,
  listPosts,
  listProducts,
  routes,
} from "@/lib/content";
import { BLOG_PATH, HOME_PATH, SITE } from "@/lib/site";
import type { CategoryType, Lang, Route, RouteType } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteBreadcrumbs, type Crumb } from "@/components/site-breadcrumbs";
import { WhatsAppFAB } from "@/components/whatsapp-fab";
import { CategoryView } from "@/components/views/category-view";
import { ProductView } from "@/components/views/product-view";
import { BlogIndexView, PostView } from "@/components/views/blog-views";
import { ContactView, ContentPageView, ThankYouView, TransportView } from "@/components/views/page-views";
import { HomeView, type HomeSection } from "@/components/views/home-view";
import { PrivacyView, TermsView } from "@/components/views/legal-views";

/** Every URL of the site, as catch-all segments. */
export function allStaticParams() {
  return routes.map((r) => ({ path: r.path.split("/").filter(Boolean) }));
}

function resolve(segments: string[] | undefined): Route {
  const path = segments?.length ? `/${segments.map(decodeURIComponent).join("/")}/` : "/";
  const route = getRoute(path);
  if (!route) notFound();
  return route;
}

const absolute = (path: string) => `${SITE.url}${path}`;

/** Titles/descriptions for pages that have no WordPress SEO data. */
const STATIC_META: Partial<Record<RouteType, Record<Lang, { title: string; description: string }>>> = {
  "thank-you": {
    fr: { title: `Merci pour votre demande | ${SITE.name}`, description: "Votre demande a bien été envoyée à l’équipe Up To Marrakech. Nous vous répondons très rapidement." },
    en: { title: `Thank you for your request | ${SITE.name}`, description: "Your request has been sent to the Up To Marrakech team. We will get back to you very soon." },
  },
  privacy: {
    fr: {
      title: `Politique de confidentialité | ${SITE.name}`,
      description: "Données personnelles collectées par Up To Marrakech, finalités, durées de conservation, cookies et vos droits (loi 09-08, CNDP, RGPD).",
    },
    en: {
      title: `Privacy policy | ${SITE.name}`,
      description: "Personal data collected by Up To Marrakech, purposes, retention, cookies and your rights under Moroccan Law 09-08 (CNDP) and the GDPR.",
    },
  },
  terms: {
    fr: {
      title: `Conditions générales d’utilisation | ${SITE.name}`,
      description: "Conditions d’utilisation du site Up To Marrakech : demandes de réservation, responsabilité, propriété intellectuelle et droit applicable.",
    },
    en: {
      title: `Terms of use | ${SITE.name}`,
      description: "Terms of use of the Up To Marrakech website: booking requests, liability, intellectual property and governing law.",
    },
  },
};

/** 1200×630 share image (logo over Marrakech photo) for pages without their own photo. */
const OG_DEFAULT = { url: "/assets/og-default.jpg", width: 1200, height: 630 };

export function metadataFor(segments: string[] | undefined): Metadata {
  const route = resolve(segments);
  const entity = entityForRoute(route);
  const seo = entity && "seo" in entity ? entity.seo : null;
  const alternates = alternatePaths(route, entity);
  const fallback = STATIC_META[route.type]?.[route.lang];
  const title = seo?.title || fallback?.title || (entity && ("title" in entity ? entity.title : "name" in entity ? entity.name : null)) || SITE.name;
  const description =
    seo?.description || fallback?.description || (entity && "excerpt" in entity && entity.excerpt ? entity.excerpt.slice(0, 160) : undefined);
  // Products / articles: their own photo. Home + pages without photo: branded 1200×630 image.
  const ownImage =
    route.type === "product" ? coverOf(getProduct(route.id)!) ?? seo?.ogImage : route.type === "post" ? getPost(route.id)?.coverImage ?? seo?.ogImage : null;
  const og = ownImage ? { url: absolute(ownImage) } : { ...OG_DEFAULT, url: absolute(OG_DEFAULT.url) };
  const ogAlt = ownImage ? title : route.lang === "fr" ? "Logo Up To Marrakech sur la place Jemaa el-Fna de nuit" : "Up To Marrakech logo over Jemaa el-Fna square at night";
  const noindex = route.type === "thank-you" || /noindex/i.test(seo?.robots ?? "");

  return {
    title: { absolute: title },
    description,
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    alternates: {
      canonical: absolute(route.path),
      languages: {
        ...(alternates.fr ? { "fr-FR": absolute(alternates.fr), "x-default": absolute(alternates.fr) } : {}),
        ...(alternates.en ? { "en-US": absolute(alternates.en) } : {}),
      },
    },
    openGraph: {
      type: route.type === "post" ? "article" : "website",
      locale: route.lang === "fr" ? "fr_FR" : "en_US",
      siteName: SITE.name,
      url: absolute(route.path),
      title,
      description,
      images: [{ ...og, alt: ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og.url] },
  };
}

function crumbsFor(route: Route): Crumb[] {
  const lang = route.lang;
  const home = { href: HOME_PATH[lang], label: lang === "fr" ? "Accueil" : "Home" };
  switch (route.type) {
    case "home":
      return [];
    case "product": {
      const p = getProduct(route.id)!;
      const c = getCategory(p.categoryId);
      return [home, ...(c ? [{ href: c.path, label: c.name }] : []), { href: p.path, label: p.title }];
    }
    case "post": {
      const p = getPost(route.id)!;
      return [home, { href: BLOG_PATH[lang], label: "Blog" }, { href: p.path, label: p.title }];
    }
    case "category": {
      const c = getCategory(route.id)!;
      return [home, { href: c.path, label: c.name }];
    }
    case "thank-you":
      return [home, { href: route.path, label: lang === "fr" ? "Merci" : "Thank you" }];
    case "privacy":
      return [home, { href: route.path, label: lang === "fr" ? "Politique de confidentialité" : "Privacy policy" }];
    case "terms":
      return [home, { href: route.path, label: lang === "fr" ? "Conditions générales d’utilisation" : "Terms of use" }];
    default: {
      const pg = getPage(route.id)!;
      return [home, { href: pg.path, label: pg.title }];
    }
  }
}

/** Structured data copied from Rank Math (Organization, Product, Article, ...). */
function JsonLd({ blocks }: { blocks: string[] }) {
  return (
    <>
      {blocks.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
    </>
  );
}

const HOME_SECTION_MATCH: [RegExp, CategoryType][] = [
  [/restaurant/i, "restaurant"],
  [/beach/i, "beach_club"],
  [/activit/i, "activity"],
  [/bo[iî]tes|night/i, "night_club"],
  [/transport|voiture|car/i, "car_rental"],
  [/spa/i, "spa"],
  [/h[ée]bergement|accommodation|villa/i, "accommodation"],
];

const firstImageByType = (lang: Lang) => {
  const map = new Map<CategoryType, { src: string; alt: string }>();
  for (const p of listProducts({ lang })) if (p.categoryType && !map.has(p.categoryType) && p.images[0]) map.set(p.categoryType, p.images[0]);
  return map;
};

function renderBody(route: Route) {
  const lang = route.lang;
  switch (route.type) {
    case "product": {
      const item = getProduct(route.id)!;
      const suggestions = listProducts({ lang, categoryType: item.categoryType ?? undefined }).filter((p) => p.id !== item.id).slice(0, 3);
      return <ProductView lang={lang} item={item} category={getCategory(item.categoryId)} suggestions={suggestions} />;
    }
    case "category": {
      const category = getCategory(route.id)!;
      const images = firstImageByType(lang);
      const others = listCategories(lang)
        .filter((c) => c.id !== category.id)
        .map((c) => ({ category: c, image: images.get(c.type)?.src ?? null, imageAlt: images.get(c.type)?.alt }));
      return (
        <CategoryView
          lang={lang}
          category={category}
          items={listProducts({ lang, categoryType: category.type })}
          section={getCategorySection(category.type, lang)}
          others={others}
        />
      );
    }
    case "post": {
      const post = getPost(route.id)!;
      const related = listPosts(lang).filter((p) => p.id !== post.id).slice(0, 3);
      return <PostView lang={lang} post={post} related={related} product={getProduct(post.relatedProductId)} />;
    }
    case "blog":
      return <BlogIndexView lang={lang} page={getPage(route.id)} posts={listPosts(lang)} />;
    case "contact":
      return <ContactView lang={lang} page={getPage(route.id)!} />;
    case "transport":
      return <TransportView lang={lang} page={getPage(route.id)!} />;
    case "page":
      return <ContentPageView lang={lang} page={getPage(route.id)!} />;
    case "thank-you":
      return <ThankYouView lang={lang} />;
    case "privacy":
      return <PrivacyView lang={lang} />;
    case "terms":
      return <TermsView lang={lang} />;
    case "home": {
      const page = getPage(route.id) ?? getPageByKind("home", lang)!;
      const images = firstImageByType(lang);
      const tiles = listCategories(lang).map((c) => ({ category: c, image: images.get(c.type)?.src ?? null, imageAlt: images.get(c.type)?.alt }));
      const h2s = page.blocks.map((b, i) => ({ b, next: page.blocks[i + 1] })).filter(({ b }) => b.tag === "h2");
      const sections: HomeSection[] = [];
      for (const { b, next } of h2s) {
        const type = HOME_SECTION_MATCH.find(([re]) => re.test(b.text))?.[1];
        const category = type ? getCategoryByType(type, lang) : null;
        if (!category || sections.some((s) => s.category.id === category.id)) continue;
        const items = listProducts({ lang, categoryType: type })
          .slice(0, 12)
          .map((p) => ({ id: p.id, path: p.path, title: p.title, image: p.images[0]?.src ?? null, imageAlt: p.images[0]?.alt, label: category.name }));
        sections.push({ heading: b.text, text: next?.tag === "p" ? next.text : "", category, items });
      }
      return <HomeView lang={lang} page={page} tiles={tiles} sections={sections} posts={listPosts(lang).slice(0, 3)} />;
    }
  }
}

export function renderRoute(segments: string[] | undefined) {
  const route = resolve(segments);
  const entity = entityForRoute(route);
  const seo = entity && "seo" in entity ? entity.seo : null;

  return (
    <>
      <JsonLd blocks={seo?.jsonLd ?? []} />
      <SiteHeader lang={route.lang} alternates={alternatePaths(route, entity)} />
      <SiteBreadcrumbs crumbs={crumbsFor(route)} />
      <main className="flex-1">{renderBody(route)}</main>
      <SiteFooter lang={route.lang} />
      <WhatsAppFAB lang={route.lang} />
    </>
  );
}
