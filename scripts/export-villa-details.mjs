#!/usr/bin/env node
/**
 * Reads the villa details shown on the live WordPress villa listing (location, bedrooms,
 * guests, "from" price) and saves them to data/villa-details.json (edit that file by hand later).
 *
 *   node scripts/export-villa-details.mjs
 */
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LISTINGS = ["https://uptomarrakech.com/location-villas/", "https://uptomarrakech.com/en/rent-villa/"];
const UA = "Mozilla/5.0 (site-migration-export)";

const text = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

async function fetchPage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return res.ok ? res.text() : null;
}

const details = {};
for (const base of LISTINGS) {
  for (let page = 1; page <= 10; page++) {
    const html = await fetchPage(page === 1 ? base : `${base}page/${page}/`);
    if (!html) break;
    // Each card is an Elementor loop item
    const items = html.split(/class="[^"]*\be-loop-item\b/).slice(1);
    let found = 0;
    for (const item of items) {
      const link = item.match(/product_title[^>]*>\s*<a href="([^"]+)"/)?.[1];
      if (!link) continue;
      const path = new URL(link).pathname;
      if (details[path]) continue;
      const texts = [...item.matchAll(/elementor-icon-list-text">([\s\S]*?)<\/span>/g)].map((m) => text(m[1]));
      const all = text(item);
      const rooms = all.match(/(\d+)\s*(?:Chambres?|Rooms?|Bedrooms?)/i)?.[1];
      const people = all.match(/(\d+)\s*(?:Personnes?|Persons?|People|Guests?)/i)?.[1];
      const price = all.match(/(?:partir de|From)\s*([\d\s.,]+)\s*€/i)?.[1]?.replace(/[\s.,]/g, "");
      details[path] = {
        location: texts[0] && !/chambre|room|personne|person|guest/i.test(texts[0]) ? texts[0] : null,
        rooms: rooms ? Number(rooms) : null,
        people: people ? Number(people) : null,
        priceFrom: price ? Number(price) : null,
      };
      found++;
    }
    console.log(`${base} page ${page}: ${found} villas`);
    if (!found) break;
  }
}

await writeFile(join(ROOT, "data", "villa-details.json"), JSON.stringify(details, null, 2) + "\n");
console.log(`Saved ${Object.keys(details).length} villas to data/villa-details.json`);
