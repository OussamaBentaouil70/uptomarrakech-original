#!/usr/bin/env node
/**
 * Turns the raw WordPress export (data/raw/*.json + data/seo.json) into the clean JSON
 * the site reads, and generates the Cloudflare redirects.
 *
 *   node scripts/build-content.mjs
 *
 * Output (all committed to git, edit them by hand to change content):
 *   data/content/products.json    villas, restaurants, spas, ... (one entry per language)
 *   data/content/posts.json       blog articles (one entry per language)
 *   data/content/categories.json  category pages
 *   data/content/pages.json       home, blog, contact, transport, range rover (+ extracted text blocks)
 *   data/content/routes.json      every URL the site must serve -> what to render
 *   public/_redirects             301s for deleted WordPress URLs (Cloudflare Pages format)
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "data", "content");
const ORIGIN = "https://uptomarrakech.com";

const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));
const save = async (p, d) => {
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(d, null, 2) + "\n");
};

const [products, store, posts, pages, cats, media, seo, images] = await Promise.all([
  readJson(join(RAW, "products.json")),
  readJson(join(RAW, "store-products.json")),
  readJson(join(RAW, "posts.json")),
  readJson(join(RAW, "pages.json")),
  readJson(join(RAW, "product-categories.json")),
  readJson(join(RAW, "media.json")),
  readJson(join(ROOT, "data", "seo.json")),
  readJson(join(ROOT, "data", "images.json")),
]);

/* ----------------------------- helpers ----------------------------- */

const ENTITIES = {
  "&amp;": "&", "&quot;": '"', "&#039;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " ",
  "&rsquo;": "’", "&lsquo;": "‘", "&rdquo;": "”", "&ldquo;": "“", "&hellip;": "…", "&ndash;": "–", "&mdash;": "—",
  "&eacute;": "é", "&egrave;": "è", "&agrave;": "à", "&ccedil;": "ç", "&ecirc;": "ê", "&ocirc;": "ô", "&euro;": "€",
};
const decode = (s = "") =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#0?39;/gi, (m) => ENTITIES[m] ?? m);
const text = (html = "") => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** Absolute site URL -> site path ("/spas/yemaya-spa/"). */
const toPath = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url, ORIGIN);
    return u.hostname.replace(/^www\./, "") === "uptomarrakech.com" ? u.pathname : url;
  } catch {
    return url;
  }
};

const missingImages = new Set(Object.entries(images).filter(([, v]) => v.status !== "ok").map(([k]) => k));

/** Clean WordPress HTML: local image/link paths, drop srcset/sizes, remove dead images. */
function cleanHtml(html = "") {
  return html
    .replace(/\s(srcset|sizes)="[^"]*"/g, "")
    .replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (tag, src) => (missingImages.has(src.split("?")[0]) ? "" : tag))
    .replace(/https?:\/\/(www\.)?uptomarrakech\.com(?=\/)/g, "")
    .replace(/\sloading="lazy"/g, "")
    .replace(/<img /g, '<img loading="lazy" ')
    .trim();
}

const localImage = (url) => (url && !missingImages.has(url.split("?")[0]) ? toPath(url.split("?")[0]) : null);

const mediaById = new Map(media.map((m) => [m.id, m]));
const storeById = new Map(store.map((s) => [s.id, s]));

function seoFor(link) {
  const s = seo[link];
  if (!s) return null;
  return {
    title: s.title || null,
    description: s.description || null,
    robots: s.robots || null,
    ogImage: localImage(s.ogImage),
    jsonLd: s.jsonLd?.length ? s.jsonLd.map((j) => j.replace(/https?:\/\/(www\.)?uptomarrakech\.com/g, ORIGIN)) : [],
  };
}

/* --------------------------- categories ---------------------------- */

const CATEGORY_TYPE = {
  restaurants: "restaurant",
  "beach-club-marrakech": "beach_club",
  "beach-club": "beach_club",
  activites: "activity",
  activities: "activity",
  "boites-de-nuit": "night_club",
  "night-club": "night_club",
  spas: "spa",
  "location-villas": "accommodation",
  "rent-villa": "accommodation",
  "location-de-voiture": "car_rental",
  "car-rental": "car_rental",
  "organisation-evenements": "event",
  "event-organization": "event",
};

const categories = cats
  .filter((c) => CATEGORY_TYPE[c.slug] && c.count > 0)
  .map((c) => ({
    id: c.id,
    lang: c.lang,
    slug: c.slug,
    type: CATEGORY_TYPE[c.slug],
    path: toPath(c.link),
    name: decode(c.name),
    descriptionHtml: cleanHtml(c.description || ""),
    translations: c.translations || {},
    seo: seoFor(c.link),
  }));
const categoryById = new Map(categories.map((c) => [c.id, c]));

/* ---------------------------- products ----------------------------- */

// Villa details (location, bedrooms, guests, price) from scripts/export-villa-details.mjs. Edit data/villa-details.json.
const villaDetails = await readJson(join(ROOT, "data", "villa-details.json")).catch(() => ({}));

const productItems = products.map((p) => {
  const s = storeById.get(p.id);
  const cat = (p.product_cat || []).map((id) => categoryById.get(id)).find(Boolean);
  const imgs = (s?.images || [])
    .map((i) => ({ src: localImage(i.src), alt: decode(i.alt || "") }))
    .filter((i) => i.src);
  return {
    id: p.id,
    lang: p.lang,
    slug: p.slug,
    path: toPath(p.link),
    title: text(p.title.rendered),
    excerptHtml: cleanHtml(p.excerpt.rendered),
    excerpt: text(p.excerpt.rendered),
    contentHtml: cleanHtml(p.content.rendered),
    categoryType: cat?.type || null,
    categoryId: cat?.id || null,
    villa: villaDetails[toPath(p.link)] ?? null,
    images: imgs,
    translations: p.translations || {},
    date: p.date,
    modified: p.modified,
    seo: seoFor(p.link),
  };
});

/* ------------------------------ posts ------------------------------ */

// Only the articles listed in data/blog-keep.json are published; each one is linked to a
// product page whose photos are used as the cover. All other articles 301-redirect (see below).
const blogKeep = await readJson(join(ROOT, "data", "blog-keep.json"));
const productByPath = new Map(productItems.map((p) => [p.path, p]));
const keepByPath = new Map(blogKeep.map((k) => [k.post, productByPath.get(k.product)]));
for (const k of blogKeep) if (!productByPath.has(k.product)) throw new Error(`blog-keep.json: unknown product ${k.product}`);

const removedPosts = [];
const postItems = posts
  .filter((p) => {
    if (keepByPath.has(toPath(p.link))) return true;
    removedPosts.push(p);
    return false;
  })
  .map((p) => {
    const m = mediaById.get(p.featured_media);
    const product = keepByPath.get(toPath(p.link));
    const fallback = product?.images[0] ? { src: product.images[0].src, alt: product.images[0].alt || product.title } : null;
    return {
      id: p.id,
      lang: p.lang,
      slug: p.slug,
      path: toPath(p.link),
      title: text(p.title.rendered),
      excerpt: text(p.excerpt.rendered),
      contentHtml: cleanHtml(p.content.rendered),
      coverImage: localImage(m?.source_url) || fallback?.src || null,
      coverAlt: decode(m?.alt_text || "") || fallback?.alt || "",
      relatedProductId: product?.id ?? null,
      translations: p.translations || {},
      date: p.date,
      modified: p.modified,
      seo: seoFor(p.link),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

/* ------------------------------ pages ------------------------------ */

const PAGE_KIND = {
  accueil: "home",
  home: "home",
  blog: "blog",
  "contactez-nous": "contact",
  "contact-us": "contact",
  "transport-touristique": "transport",
  "tourist-transportation": "transport",
  "location-range-rover-a-marrakech": "content",
  "range-rover-rental-in-marrakech": "content",
};

/** Headings / paragraphs of an Elementor page, in order, for SEO text reuse. */
function textBlocks(html) {
  const blocks = [];
  for (const m of html.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = text(m[2]);
    if (t && t.length > 1 && blocks.at(-1)?.text !== t) blocks.push({ tag: m[1].toLowerCase(), text: t });
  }
  return blocks;
}

const pageItems = pages.map((p) => {
  const kind = PAGE_KIND[p.slug] || "content";
  const isBuilder = /elementor/.test(p.content.rendered);
  return {
    id: p.id,
    lang: p.lang,
    slug: p.slug,
    kind,
    path: toPath(p.link),
    title: text(p.title.rendered),
    contentHtml: isBuilder ? "" : cleanHtml(p.content.rendered),
    blocks: isBuilder ? textBlocks(p.content.rendered) : [],
    images: isBuilder
      ? [...new Set([...p.content.rendered.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => localImage(m[1])).filter(Boolean))]
      : [],
    translations: p.translations || {},
    seo: seoFor(p.link),
  };
});

/* ------------------------------ routes ----------------------------- */

const routes = [];
const addRoute = (path, type, ref, lang) => routes.push({ path, type, id: ref, lang });

for (const p of pageItems) addRoute(p.path, p.kind === "content" ? "page" : p.kind, p.id, p.lang);
for (const c of categories) addRoute(c.path, "category", c.id, c.lang);
for (const p of productItems) addRoute(p.path, "product", p.id, p.lang);
for (const p of postItems) addRoute(p.path, "post", p.id, p.lang);
// Thank-you pages for the forms (not indexed)
addRoute("/merci/", "thank-you", null, "fr");
addRoute("/en/thank-you/", "thank-you", null, "en");

const seen = new Map();
for (const r of routes) {
  if (seen.has(r.path)) console.warn("Duplicate route", r.path, r.type, "vs", seen.get(r.path).type);
  seen.set(r.path, r);
}

/* ---------------------------- redirects ---------------------------- */

const redirects = [];
for (const [url, s] of Object.entries(seo)) {
  const from = toPath(url);
  const to = s.finalUrl ? toPath(s.finalUrl) : null;
  if (to && to !== from && !seen.has(from)) redirects.push(`${from} ${to} 301`);
}
// Old canonical quirk: /en/blog/en/ -> /en/blog/
if (!seen.has("/en/blog/en/")) redirects.push("/en/blog/en/ /en/blog/ 301");

// Removed blog articles -> closest category page (keeps their Google ranking), else the blog.
const TOPIC_TARGET = [
  [/restaurant|diner|dinner|dejeuner|lunch|table|gastronom|brunch|food|cuisine|chef|tajine/, { fr: "/restaurants/", en: "/en/restaurants/" }],
  [/club|nightlife|\bnuit|soiree|party|\bdj\b|cocktail|\bbars?\b|lounge|rooftop|chicha/, { fr: "/boites-de-nuit/", en: "/en/night-club/" }],
  [/beach|plage|piscine|pool/, { fr: "/beach-club-marrakech/", en: "/en/beach-club/" }],
  [/\bspas?\b|hammam|massage|bien-etre|wellness|beaut/, { fr: "/spas/", en: "/en/spas/" }],
  [/villa|riad|hebergement|sejour|\bstay|hotel|palace/, { fr: "/location-villas/", en: "/en/rent-villa/" }],
  [/voiture|\bcars?\b|chauffeur|transfer|navette|vtc|transport|voiturier|valet|limousine/, { fr: "/location-de-voiture/", en: "/en/car-rental/" }],
  [/mariage|wedding|evenement|event|anniversaire|birthday|seminaire|seminar|incentive|gala/, { fr: "/organisation-evenements/", en: "/en/event-organization/" }],
  [/activit|desert|agafay|quad|buggy|golf|balloon|montgolfi|chameau|camel|excursion|ourika|atlas|essaouira|visite|tour|souk|medina|jardin|garden/, { fr: "/activites/", en: "/en/activities/" }],
];
const normTitle = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
for (const p of removedPosts) {
  const from = toPath(p.link);
  if (seen.has(from)) continue;
  const lang = p.lang === "en" ? "en" : "fr";
  const t = normTitle(text(p.title.rendered));
  const target = TOPIC_TARGET.find(([re]) => re.test(t))?.[1][lang] ?? (lang === "en" ? "/en/blog/" : "/blog/");
  redirects.push(`${from} ${target} 301`);
}

/* ------------------------- sitemap + robots ------------------------ */
const lastmodById = new Map([...productItems, ...postItems].map((x) => [x.id, x.modified]));
const sitemapUrls = routes
  .filter((r) => r.type !== "thank-you")
  .map((r) => {
    const lastmod = lastmodById.get(r.id);
    return `  <url><loc>${ORIGIN}${r.path}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
  });
await writeFile(
  join(ROOT, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`,
);
await writeFile(join(ROOT, "public", "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
// Old WordPress / Rank Math sitemap URLs -> new sitemap
for (const old of ["/sitemap_index.xml", "/wp-sitemap.xml", "/post-sitemap.xml", "/page-sitemap.xml", "/product-sitemap.xml", "/product_cat-sitemap.xml"]) {
  redirects.push(`${old} /sitemap.xml 301`);
}
for (let i = 1; i <= 4; i++) redirects.push(`/post-sitemap${i}.xml /sitemap.xml 301`);

/* ------------------------------ output ----------------------------- */

await save(join(OUT, "products.json"), productItems);
await save(join(OUT, "posts.json"), postItems);
await save(join(OUT, "categories.json"), categories);
await save(join(OUT, "pages.json"), pageItems);
await save(join(OUT, "routes.json"), routes);
await mkdir(join(ROOT, "public"), { recursive: true });
await writeFile(
  join(ROOT, "public", "_redirects"),
  "# 301 redirects for removed WordPress URLs (generated by scripts/build-content.mjs)\n" + [...new Set(redirects)].sort().join("\n") + "\n",
);

/* --------------------------- search index -------------------------- */
// Small per-language index loaded by the home page search box (public/search/<lang>.json).
const TYPE_LABEL = {
  fr: { product: "Adresse", post: "Article", category: "Catégorie" },
  en: { product: "Place", post: "Article", category: "Category" },
};
for (const lang of ["fr", "en"]) {
  const entries = [
    ...categories.filter((c) => c.lang === lang).map((c) => ({ t: c.name, p: c.path, k: TYPE_LABEL[lang].category, x: "" })),
    ...productItems.filter((p) => p.lang === lang).map((p) => ({ t: p.title, p: p.path, k: TYPE_LABEL[lang].product, x: p.excerpt.slice(0, 140), i: p.images[0]?.src })),
    ...postItems.filter((p) => p.lang === lang).map((p) => ({ t: p.title, p: p.path, k: TYPE_LABEL[lang].post, x: p.excerpt.slice(0, 140), i: p.coverImage || undefined })),
  ];
  await mkdir(join(ROOT, "public", "search"), { recursive: true });
  await writeFile(join(ROOT, "public", "search", `${lang}.json`), JSON.stringify(entries));
}

const count = (arr, key) => arr.reduce((m, x) => ((m[x[key]] = (m[x[key]] || 0) + 1), m), {});
console.log({
  products: productItems.length,
  productsWithoutCategory: productItems.filter((p) => !p.categoryType).map((p) => p.path),
  productTypes: count(productItems, "categoryType"),
  posts: postItems.length,
  categories: categories.length,
  pages: count(pageItems, "kind"),
  routes: routes.length,
  redirects: new Set(redirects).size,
});
