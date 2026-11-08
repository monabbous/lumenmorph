import { readFile, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
const root = new URL("../public/lab/examples/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));
// The collection thumbnail uses the gallery's real markup and material styles.
const gallery = await readFile(new URL("index.html", root), "utf8");
const runtime = JSON.parse(await readFile(new URL("../editor-runtime.json", root), "utf8"));
const showcaseCss = await readFile(new URL("../showcase.css", root), "utf8");
const columns = [["type", "foil"], ["climate", "player"], ["weather", "rating"]];
const cards = new Map([...gallery.matchAll(/<article class="example" data-example="([^"]+)" data-category="[^"]+">([\s\S]*?)<\/article>/g)].map(([, id, content]) => [id, content.split('<div class="example-caption">')[0]]));
const collection = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${runtime.css}\n${showcaseCss}\n
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#171715;color:#f6f1e5;font:14px/1.6 ui-monospace,monospace}
.lm-lab{padding:32px 36px}.lm-lab .showcase{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;padding:0;--lumen-x:670px;--lumen-y:220px}
.collection-column{display:grid;gap:18px;align-content:start}.collection-column:first-child{margin-top:-85px}.collection-column:last-child{margin-top:-34px}
.lm-lab .example{border-radius:4px}button,input{font:inherit}*{animation:none!important;transition:none!important}
</style></head><body><main class="lm-lab"><section class="showcase">${columns.map(ids => `<div class="collection-column">${ids.map(id => {
  if (!cards.has(id)) throw new Error(`Missing thumbnail example: ${id}`);
  return `<article class="example">${cards.get(id)}</article>`;
}).join("")}</div>`).join("")}</section></main></body></html>`;
const entries = [...manifest.map(entry => ({ ...entry, image: `${entry.id}/og.png` })), { id: "collection", image: "collection.png", hash: createHash("sha256").update(collection).digest("hex").slice(0, 16), source: collection }];
const file = new URL("previews.json", root);
const previous = await readFile(file, "utf8").then(JSON.parse).catch(() => ({}));
const pending = [];
for (const entry of entries) {
  const exists = await access(new URL(entry.image, root)).then(() => true).catch(() => false);
  if (!exists || previous[entry.id] !== entry.hash || process.argv.includes("--force")) pending.push(entry);
}
if (process.argv.includes("--check")) {
  if (pending.length) throw new Error(`Social previews are stale: ${pending.map(entry => entry.id).join(", ")}. Run npm run build:lab and commit the generated files.`);
  console.log(`All ${manifest.length} social previews and the collection thumbnail are current.`);
} else if (pending.length) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: "dark" });
    await page.route("**/*", route => route.abort());
    for (const entry of pending) {
      await page.setContent(entry.source ?? await readFile(new URL(`${entry.id}/preview.html`, root), "utf8"), { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: new URL(entry.image, root).pathname, animations: "disabled" });
      console.log(`Rendered ${entry.image}`);
    }
    await writeFile(file, JSON.stringify(Object.fromEntries(entries.map(entry => [entry.id, entry.hash])), null, 2) + "\n");
  } finally { await browser.close(); }
} else console.log("Social previews are already current.");
