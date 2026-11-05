import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Caniuse percentages are a dated feature snapshot, not a library-support claim", async () => {
  const data = JSON.parse(await readFile(new URL("../public/lab/assets/browser-support.json", import.meta.url), "utf8"));
  const html = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  assert.match(data.commit, /^[a-f0-9]{40}$/);
  assert.equal(data.features.length, 2);
  assert.ok(Number.isFinite(Date.parse(data.retrievedAt)));
  for (const feature of data.features) {
    assert.ok(feature.full >= 0 && feature.partial >= 0 && feature.full + feature.partial <= 100.01);
    assert.ok(html.includes(`${feature.full.toFixed(2)}%`));
    assert.ok(html.includes(`${feature.partial.toFixed(2)}%`));
    assert.ok(html.includes(feature.url));
  }
  assert.ok(html.includes(data.retrievedAt.slice(0, 10)));
  assert.ok(html.includes("not a percentage of Lumenmorph compatibility"));
  assert.ok(html.includes("CC BY 4.0"));
});
