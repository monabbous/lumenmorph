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
  assert.match(html, /class="slidebox" data-slidebox-thumb-layers type="checkbox" role="switch"/);
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
  assert.match(html, /href="\.\/skins\/slidebox\.css"/);
  assert.match(html, /href="\.\/material-picker-layout\.css"/);
  assert.match(html, /<form id="controls" class="lumenmorph-slidebox">/);
  assert.doesNotMatch(html, /href="\.\/(?:material-picker\.css|assets\/preset-highlight\.css)"/);
  assert.doesNotMatch(layout, /(?:background(?:-image|-color)?|backdrop-filter|box-shadow)\s*:/);
  assert.doesNotMatch(layout, /--lumen-(?:bg|blur|border-width):/);
});

test("gallery and editor runtime consume the same exported Slidebox skin", async () => {
  const gallery = await readFile(new URL("../public/lab/examples/index.html", import.meta.url), "utf8");
  const runtime = JSON.parse(await readFile(new URL("../public/lab/editor-runtime.json", import.meta.url), "utf8"));
  const skin = await readFile(new URL("../skins/slidebox.css", import.meta.url), "utf8");
  assert.match(gallery, /href="\.\.\/skins\/slidebox\.css"/);
  assert.doesNotMatch(gallery, /href="\.\.\/(?:material-picker\.css|assets\/preset-highlight\.css)"/);
  assert.equal(runtime.css.split(skin).length - 1, 1, "Editor embeds the exported CSS once, not another skin implementation");
  assert.doesNotMatch(runtime.css, /Frozen pre-integration|Generated from the canonical Lumenmorph surface\. Slidebox owns indicator/);
  assert.match(gallery, /class="showcase lumenmorph-slidebox"/);
  for (const input of gallery.matchAll(/<input[^>]*class="slidebox"[^>]*>/g)) {
    assert.match(input[0], /data-slidebox-thumb-layers/, "Every example switch opts into thumb layers");
  }
  const showcaseCss = await readFile(new URL("../public/lab/showcase.css", import.meta.url), "utf8");
  assert.doesNotMatch(showcaseCss, /\[data-slidebox-range-visual\][^{]*\{[^}]*background/);
  for (const id of ["climate", "foil", "checklist"]) {
    const source = JSON.parse(await readFile(new URL(`../public/lab/examples/${id}/source.json`, import.meta.url), "utf8"));
    assert.match(source.html, /showcase lumenmorph-slidebox/);
    assert.match(source.js, /enhanceSlideboxRange\(input, \{\s*layers: true/);
    if (id !== "climate") assert.match(source.html, /data-slidebox-thumb-layers/);
  }
});
