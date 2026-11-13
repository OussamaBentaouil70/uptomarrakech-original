/**
 * Content access for the static site. Reads the JSON files in data/content/ at build time.
 * To change content, edit those JSON files and push: Cloudflare rebuilds the site.
 */
import "server-only";
import productsJson from "../../data/content/products.json";
import postsJson from "../../data/content/posts.json";
import categoriesJson from "../../data/content/categories.json";
import pagesJson from "../../data/content/pages.json";
import routesJson from "../../data/content/routes.json";
import sectionsJson from "../../data/category-sections.json";
import type { Category, CategorySection, CategoryType, Lang, Page, Post, Product, Route, SectionBlock } from "@/lib/types";

type SectionsFile = Record<string, { image: string } & Record<Lang, { title: string; alt: string; blocks: SectionBlock[] }>>;
const sections = sectionsJson as unknown as SectionsFile;

/** Text + image section for a category page, in the given language (null if none). */
export function getCategorySection(type: CategoryType, lang: Lang): CategorySection | null {
  const s = sections[type];
  return s?.[lang] ? { image: s.image, ...s[lang] } : null;
}

export const products = productsJson as Product[];
export const posts = postsJson as Post[];
export const categories = categoriesJson as Category[];
export const pages = pagesJson as Page[];
export const routes = routesJson as Route[];

const routeByPath = new Map(routes.map((r) => [r.path, r]));
const productById = new Map(products.map((p) => [p.id, p]));
const postById = new Map(posts.map((p) => [p.id, p]));
const categoryById = new Map(categories.map((c) => [c.id, c]));
const pageById = new Map(pages.map((p) => [p.id, p]));

/** "/spas/yemaya-spa/" from Next's catch-all segments. */
export function pathFromSegments(segments: string[] | undefined, prefix = ""): string {
  const parts = [prefix, ...(segments ?? []).map((s) => decodeURIComponent(s))].filter(Boolean);
  return parts.length ? `/${parts.join("/")}/` : "/";
}

export const getRoute = (path: string) => routeByPath.get(path) ?? null;
export const getProduct = (id: number | null) => (id == null ? null : productById.get(id) ?? null);
export const getPost = (id: number | null) => (id == null ? null : postById.get(id) ?? null);
export const getCategory = (id: number | null) => (id == null ? null : categoryById.get(id) ?? null);
export const getPage = (id: number | null) => (id == null ? null : pageById.get(id) ?? null);

export const getPageByKind = (kind: Page["kind"], lang: Lang) => pages.find((p) => p.kind === kind && p.lang === lang) ?? null;

export function listProducts(filter: { lang: Lang; categoryType?: CategoryType }): Product[] {
  return products
    .filter((p) => p.lang === filter.lang && (!filter.categoryType || p.categoryType === filter.categoryType))
    .sort((a, b) => a.title.localeCompare(b.title, filter.lang));
}

export function listPosts(lang: Lang): Post[] {
  return posts.filter((p) => p.lang === lang); // already sorted newest first
}

export function getCategoryByType(type: CategoryType, lang: Lang): Category | null {
  return categories.find((c) => c.type === type && c.lang === lang) ?? null;
}

export function listCategories(lang: Lang): Category[] {
  return categories.filter((c) => c.lang === lang);
}

type Translatable = { lang: Lang; translations: Partial<Record<Lang, number>> };

/** Path of the same content in the other language (for the language switcher + hreflang). */
export function alternatePaths(route: Route, entity: Translatable | null): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = { [route.lang]: route.path };
  if (route.type === "thank-you") return { fr: "/merci/", en: "/en/thank-you/" };
  if (route.type === "privacy") return { fr: "/politique-de-confidentialite/", en: "/en/privacy-policy/" };
  if (route.type === "terms") return { fr: "/conditions-generales-utilisation/", en: "/en/terms-of-use/" };
  if (!entity) return out;
  for (const lang of ["fr", "en"] as Lang[]) {
    if (lang === route.lang) continue;
    const otherId = entity.translations[lang];
    if (!otherId) continue;
    const other = routes.find((r) => r.id === otherId && r.lang === lang);
    if (other) out[lang] = other.path;
  }
  return out;
}

export function entityForRoute(route: Route) {
  switch (route.type) {
    case "product":
      return getProduct(route.id);
    case "post":
      return getPost(route.id);
    case "category":
      return getCategory(route.id);
    case "thank-you":
    case "privacy":
    case "terms":
      return null;
    default:
      return getPage(route.id);
  }
}

/** First image of a product (cover). */
export const coverOf = (p: Product) => p.images[0]?.src ?? null;
