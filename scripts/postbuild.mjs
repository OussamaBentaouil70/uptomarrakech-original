#!/usr/bin/env node
/** After `next build`: set <html lang="en"> on every exported page under /en/ (French is the default). */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out", "en");
let count = 0;

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".html")) {
      const html = await readFile(full, "utf8");
      const fixed = html.replace(/<html lang="fr"/, '<html lang="en"');
      if (fixed !== html) {
        await writeFile(full, fixed);
        count++;
      }
    }
  }
}

await walk(OUT);
console.log(`postbuild: set lang="en" on ${count} pages`);
