import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PNG } from "pngjs";

test("lab supplies content and relative assets, leaving site chrome and fonts to the host", async () => {
  const html = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/lab/lab.css", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<(?:header|footer)\b|data-nabous-shell|lab-shell\.css|lab-light\.js/);
  assert.doesNotMatch(css, /fonts\.googleapis|@font-face|@import/);
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    assert.ok(match[1].startsWith("./"), `Asset must be relative: ${match[1]}`);
  }
  assert.match(html, /class="slidebox" type="checkbox" role="switch"/);
  assert.match(html, /data-preset="ember" checked/);
});

test("article and lab listing share the recorded 16:9 cover, with a static social fallback", async () => {
  const blog = await readFile(new URL("../public/blog.md", import.meta.url), "utf8");
  assert.match(blog, /cover_image: assets\/lumenmorph-header.webp/);
  assert.match(blog, /social_image: assets\/lumenmorph-header.png/);
  const poster = PNG.sync.read(await readFile(new URL("../public/assets/lumenmorph-header.png", import.meta.url)));
  assert.equal(poster.width, 1280);
  assert.equal(poster.height, 720);
  const animation = await readFile(new URL("../public/assets/lumenmorph-header.webp", import.meta.url));
  assert.equal(animation.toString("ascii", 0, 4), "RIFF");
  assert.ok(animation.includes(Buffer.from("ANIM")));
  assert.ok(animation.length < 4_000_000, "Public preview exceeds the 4 MB budget");
});

test("main lab consumes the exported Slidebox skin without legacy group paint", async () => {
  const html = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  const layout = await readFile(new URL("../public/lab/material-picker-layout.css", import.meta.url), "utf8");
  assert.match(html, /href="\.\/assets\/lumenmorph-slidebox\.css"/);
  assert.match(html, /href="\.\/material-picker-layout\.css"/);
  assert.doesNotMatch(html, /href="\.\/(?:material-picker\.css|assets\/preset-highlight\.css)"/);
  assert.doesNotMatch(layout, /(?:background(?:-image|-color)?|backdrop-filter|box-shadow)\s*:/);
  assert.match(layout, /--lumen-bg: initial/);
  assert.match(layout, /--lumen-blur: initial/);
});
