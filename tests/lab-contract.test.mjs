import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("lab supplies content and relative assets, leaving site chrome and fonts to the host", async () => {
  const html = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/lab/lab.css", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<(?:header|footer)\b|data-nabous-shell|lab-shell\.css|lab-light\.js/);
  assert.doesNotMatch(css, /fonts\.googleapis|@font-face|@import/);
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    assert.ok(match[1].startsWith("./"), `Asset must be relative: ${match[1]}`);
  }
  assert.match(html, /class="slidebox" type="checkbox" role="switch"/);
  assert.match(html, /data-preset="ember" aria-pressed="true"/);
});
