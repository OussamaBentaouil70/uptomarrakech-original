#!/usr/bin/env node
/**
 * Export uptomarrakech.com (WordPress + WooCommerce + Polylang + Rank Math) to JSON + images.
 * Read-only: only uses public GET endpoints. Safe to re-run (images already downloaded are skipped).
 *
 *   node scripts/export-wordpress.mjs            # data + SEO + images
 *   node scripts/export-wordpress.mjs --no-images
 *   node scripts/export-wordpress.mjs --images-only
 *
 * Output:
 *   data/raw/*.json          raw API responses (products, store-products, posts, pages, categories, media, ...)
 *   data/urls.json           every URL listed in the sitemaps (what Google has indexed)
 *   data/seo.json            <title>, meta description, canonical, og:image, hreflang for each URL
 *   data/images.json         image manifest (remote URL -> local path, status)
 *   public/wp-content/uploads/...  images at the SAME path as on WordPress
 */
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://uptomarrakech.com";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");
const RAW = join(DATA, "raw");
const PUBLIC = join(ROOT, "public");
const UA = "Mozilla/5.0 (site-migration-export)";

const args = new Set(process.argv.slice(2));
const withImages = !args.has("--no-images");
const imagesOnly = args.has("--images-only");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { json = true, tries = 4 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "*/*" } });
      if (res.status === 404) return { res, body: null };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { res, body: json ? await res.json() : await res.text() };
    } catch (error) {
      if (attempt >= tries) throw new Error(`${url}: ${error.message}`);
      await sleep(1000 * attempt);
    }
  }
}

/** Fetch every page of a paginated WP REST collection. */
async function getAll(path, params = "") {
  const out = [];
  for (let page = 1; ; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const { res, body } = await get(`${BASE}${path}${sep}per_page=100&page=${page}${params}`);
    if (!body || !Array.isArray(body) || body.length === 0) break;
    out.push(...body);
    const totalPages = Number(res.headers.get("x-wp-totalpages") || 1);
    process.stdout.write(`\r  ${path}: ${out.length}`);
    if (page >= totalPages) break;
  }
  process.stdout.write("\n");
  return out;
}

async function save(file, data) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** Run async jobs with limited concurrency. */
async function pool(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

/* ------------------------------------------------------------------ */
/* 1. Content                                                          */
/* ------------------------------------------------------------------ */

async function exportContent() {
  console.log("Exporting content from the REST API…");
  const sets = {
    products: () => getAll("/wp-json/wp/v2/product", "&context=view"),
    "store-products": () => getAll("/wp-json/wc/store/v1/products"),
    posts: () => getAll("/wp-json/wp/v2/posts"),
    pages: () => getAll("/wp-json/wp/v2/pages"),
    "product-categories": () => getAll("/wp-json/wp/v2/product_cat"),
    "post-categories": () => getAll("/wp-json/wp/v2/categories"),
    tags: () => getAll("/wp-json/wp/v2/tags"),
    media: () => getAll("/wp-json/wp/v2/media"),
  };
  const result = {};
  for (const [name, load] of Object.entries(sets)) {
    result[name] = await load();
    await save(join(RAW, `${name}.json`), result[name]);
  }
  const { body: site } = await get(`${BASE}/wp-json/`);
  await save(join(RAW, "site.json"), { name: site?.name, description: site?.description, url: site?.url });
  return result;
}

/* ------------------------------------------------------------------ */
/* 2. Sitemap URLs + SEO head of every page                            */
/* ------------------------------------------------------------------ */

const locs = (xml) => [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim(),
  lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || null,
}));

async function exportUrls() {
  console.log("Reading sitemaps…");
  const { body: index } = await get(`${BASE}/sitemap_index.xml`, { json: false });
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const urls = [];
  for (const sitemap of sitemaps) {
    const { body } = await get(sitemap, { json: false });
    const name = sitemap.split("/").pop().replace(/\d*\.xml$/, "");
    for (const u of locs(body || "")) if (u.loc) urls.push({ ...u, sitemap: name });
  }
  await save(join(DATA, "urls.json"), urls);
  console.log(`  ${urls.length} URLs`);
  return urls;
}

const decode = (s) =>
  (s ?? "")
    .replace(/&#0?39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ");

function attr(tag, name) {
  return tag?.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1];
}

function parseHead(html) {
  const head = html.split(/<\/head>/i)[0] || "";
  const metas = [...head.matchAll(/<meta\s[^>]*>/gi)].map((m) => m[0]);
  const meta = (key, value) => decode(attr(metas.find((t) => new RegExp(`${key}=["']${value}["']`, "i").test(t)), "content"));
  const links = [...head.matchAll(/<link\s[^>]*>/gi)].map((m) => m[0]);
  return {
    title: decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()),
    description: meta("name", "description") || null,
    robots: meta("name", "robots") || null,
    canonical: attr(links.find((t) => /rel=["']canonical["']/i.test(t)), "href") || null,
    ogTitle: meta("property", "og:title") || null,
    ogDescription: meta("property", "og:description") || null,
    ogImage: meta("property", "og:image") || null,
    htmlLang: html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1] || null,
    alternates: links
      .filter((t) => /rel=["']alternate["']/i.test(t) && /hreflang=/i.test(t))
      .map((t) => ({ hreflang: attr(t, "hreflang"), href: attr(t, "href") })),
    jsonLd: [...head.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim()),
  };
}

async function exportSeo(urls) {
  console.log("Reading SEO tags of every indexed page (polite, 3 at a time)…");
  const seo = await readJson(join(DATA, "seo.json"), {});
  const todo = urls.map((u) => u.loc).filter((loc) => !seo[loc]);
  let done = 0;
  await pool(todo, 3, async (loc) => {
    try {
      const { res, body } = await get(loc, { json: false });
      seo[loc] = body ? { status: res.status, finalUrl: res.url, ...parseHead(body) } : { status: 404 };
    } catch (error) {
      seo[loc] = { status: 0, error: error.message };
    }
    done++;
    if (done % 25 === 0) {
      process.stdout.write(`\r  ${done}/${todo.length}`);
      await save(join(DATA, "seo.json"), seo);
    }
  });
  await save(join(DATA, "seo.json"), seo);
  process.stdout.write(`\r  ${todo.length}/${todo.length} done\n`);
  return seo;
}

/* ------------------------------------------------------------------ */
/* 3. Images                                                           */
/* ------------------------------------------------------------------ */

const UPLOADS_RE = /https?:\/\/(?:www\.)?uptomarrakech\.com\/wp-content\/uploads\/[^\s"'()<>]+?\.(?:jpe?g|png|webp|gif|svg|avif)/gi;

function collectImageUrls(content, seo) {
  const set = new Set();
  const add = (u) => u && set.add(u.split("?")[0]);
  for (const m of content.media) add(m.source_url);
  for (const p of content["store-products"]) for (const img of p.images || []) add(img.src);
  const text = JSON.stringify([content.products, content.posts, content.pages, content["product-categories"], seo]);
  for (const m of text.replace(/\\\//g, "/").matchAll(UPLOADS_RE)) add(m[0]);
  return [...set];
}

async function exists(file) {
  try {
    return (await stat(file)).size > 0;
  } catch {
    return false;
  }
}

async function downloadImages(urls) {
  console.log(`Downloading ${urls.length} images to public/wp-content/uploads (4 at a time, resumable)…`);
  const manifest = await readJson(join(DATA, "images.json"), {});
  let done = 0;
  let bytes = 0;
  await pool(urls, 4, async (url) => {
    const path = decodeURIComponent(new URL(url).pathname); // /wp-content/uploads/2024/11/x.jpg
    const file = join(PUBLIC, path);
    if (manifest[url]?.status === "ok" && (await exists(file))) {
      done++;
      return;
    }
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, buf);
      bytes += buf.length;
      manifest[url] = { path, status: "ok", size: buf.length };
    } catch (error) {
      manifest[url] = { path, status: "error", error: error.message };
    }
    done++;
    if (done % 20 === 0) {
      process.stdout.write(`\r  ${done}/${urls.length}  (${(bytes / 1048576).toFixed(0)} MB this run)`);
      await save(join(DATA, "images.json"), manifest);
    }
  });
  await save(join(DATA, "images.json"), manifest);
  const failed = Object.values(manifest).filter((m) => m.status !== "ok").length;
  console.log(`\n  done: ${urls.length - failed} ok, ${failed} failed (see data/images.json)`);
}

/* ------------------------------------------------------------------ */

async function main() {
  let content;
  let seo;
  if (args.has("--seo-missing")) {
    // Pages that exist in WordPress but are not in the sitemaps (e.g. EN category pages)
    const links = [];
    for (const n of ["products", "posts", "pages", "product-categories"]) {
      for (const x of await readJson(join(RAW, `${n}.json`), [])) if (x.link && (n !== "product-categories" || x.count > 0)) links.push(x.link);
    }
    await exportSeo(links.map((loc) => ({ loc })));
    return;
  }
  if (imagesOnly) {
    content = Object.fromEntries(
      await Promise.all(
        ["media", "store-products", "products", "posts", "pages", "product-categories"].map(async (n) => [n, await readJson(join(RAW, `${n}.json`), [])]),
      ),
    );
    seo = await readJson(join(DATA, "seo.json"), {});
  } else {
    content = await exportContent();
    const urls = await exportUrls();
    seo = await exportSeo(urls);
  }
  if (withImages || imagesOnly) await downloadImages(collectImageUrls(content, seo));

  const summary = {
    exportedAt: new Date().toISOString(),
    products: content.products?.length,
    posts: content.posts?.length,
    pages: content.pages?.length,
    media: content.media?.length,
  };
  if (!imagesOnly) await save(join(DATA, "export-summary.json"), summary);
  console.log("Finished.", summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
