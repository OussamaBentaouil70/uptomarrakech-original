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
import type { CategoryType, Lang, Route } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteBreadcrumbs, type Crumb } from "@/components/site-breadcrumbs";
import { WhatsAppFAB } from "@/components/whatsapp-fab";
import { CategoryView } from "@/components/views/category-view";
import { ProductView } from "@/components/views/product-view";
import { BlogIndexView, PostView } from "@/components/views/blog-views";
import { ContactView, ContentPageView, ThankYouView, TransportView } from "@/components/views/page-views";
import { HomeView, type HomeSection } from "@/components/views/home-view";

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

export function metadataFor(segments: string[] | undefined): Metadata {
  const route = resolve(segments);
  const entity = entityForRoute(route);
  const seo = entity && "seo" in entity ? entity.seo : null;
  const alternates = alternatePaths(route, entity);
  const title = seo?.title || (entity && ("title" in entity ? entity.title : "name" in entity ? entity.name : null)) || SITE.name;
  const image = seo?.ogImage || (route.type === "product" ? coverOf(getProduct(route.id)!) : route.type === "post" ? getPost(route.id)?.coverImage : null);
  const noindex = route.type === "thank-you" || /noindex/i.test(seo?.robots ?? "");

  return {
    title: { absolute: title },
    description: seo?.description ?? undefined,
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
      description: seo?.description ?? undefined,
      images: image ? [{ url: absolute(image) }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: seo?.description ?? undefined, images: image ? [absolute(image)] : undefined },
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
  const map = new Map<CategoryType, string>();
  for (const p of listProducts({ lang })) if (p.categoryType && !map.has(p.categoryType) && p.images[0]) map.set(p.categoryType, p.images[0].src);
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
        .map((c) => ({ category: c, image: images.get(c.type) ?? null }));
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
    case "home": {
      const page = getPage(route.id) ?? getPageByKind("home", lang)!;
      const images = firstImageByType(lang);
      const tiles = listCategories(lang).map((c) => ({ category: c, image: images.get(c.type) ?? null }));
      const h2s = page.blocks.map((b, i) => ({ b, next: page.blocks[i + 1] })).filter(({ b }) => b.tag === "h2");
      const sections: HomeSection[] = [];
      for (const { b, next } of h2s) {
        const type = HOME_SECTION_MATCH.find(([re]) => re.test(b.text))?.[1];
        const category = type ? getCategoryByType(type, lang) : null;
        if (!category || sections.some((s) => s.category.id === category.id)) continue;
        const items = listProducts({ lang, categoryType: type })
          .slice(0, 12)
          .map((p) => ({ id: p.id, path: p.path, title: p.title, image: p.images[0]?.src ?? null, label: category.name }));
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
