export const CATEGORY_TYPES = [
  "accommodation",
  "night_club",
  "activity",
  "beach_club",
  "spa",
  "car_rental",
  "tourist_transport",
  "restaurant",
  "event",
] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export type Lang = "fr" | "en";

/** SEO tags copied from the original WordPress (Rank Math) pages. */
export type Seo = {
  title: string | null;
  description: string | null;
  robots: string | null;
  ogImage: string | null;
  jsonLd: string[];
};

export type ContentImage = { src: string; alt: string };

export type VillaDetails = { location: string | null; rooms: number | null; people: number | null; priceFrom: number | null };

/** Text + image section shown after the products of a category (data/category-sections.json). */
export type SectionBlock = { h3?: string; p?: string; ul?: string[] };
export type CategorySection = { image: string; alt: string; title: string; blocks: SectionBlock[] };

/** Translations map from Polylang: { fr: <id>, en: <id> } */
export type Translations = Partial<Record<Lang, number>>;

export type Product = {
  id: number;
  lang: Lang;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  excerptHtml: string;
  contentHtml: string;
  categoryType: CategoryType | null;
  categoryId: number | null;
  /** Villas only (data/villa-details.json). */
  villa: VillaDetails | null;
  images: ContentImage[];
  translations: Translations;
  date: string;
  modified: string;
  seo: Seo | null;
};

export type Post = {
  id: number;
  lang: Lang;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string | null;
  coverAlt: string;
  /** Product page this article is about (see data/blog-keep.json). */
  relatedProductId: number | null;
  translations: Translations;
  date: string;
  modified: string;
  seo: Seo | null;
};

export type Category = {
  id: number;
  lang: Lang;
  slug: string;
  type: CategoryType;
  path: string;
  name: string;
  descriptionHtml: string;
  translations: Translations;
  seo: Seo | null;
};

export type PageKind = "home" | "blog" | "contact" | "transport" | "content";

export type TextBlock = { tag: string; text: string };

export type Page = {
  id: number;
  lang: Lang;
  slug: string;
  kind: PageKind;
  path: string;
  title: string;
  contentHtml: string;
  blocks: TextBlock[];
  images: string[];
  translations: Translations;
  seo: Seo | null;
};

export type RouteType = "home" | "blog" | "contact" | "transport" | "page" | "category" | "product" | "post" | "thank-you" | "privacy" | "terms";

export type Route = { path: string; type: RouteType; id: number | null; lang: Lang };
