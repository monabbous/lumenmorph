import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { aggregateSupport, supportState } from "../scripts/browser-support-data.mjs";

test("Caniuse percentages are a dated feature snapshot, not a library-support claim", async () => {
  const data = JSON.parse(await readFile(new URL("../public/lab/assets/browser-support.json", import.meta.url), "utf8"));
  const html = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  assert.match(data.commit, /^[a-f0-9]{40}$/);
  assert.deepEqual(data.features.map(feature => feature.id), ["css-backdrop-filter", "css-masks", "css-variables", "background-clip-text"]);
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
  const summary = html.match(/<!-- Caniuse summary: begin -->([\s\S]*?)<!-- Caniuse summary: end -->/)[1];
  assert.ok(summary.includes(`${data.overall.full.toFixed(2)}%`));
  assert.ok(summary.includes('aria-haspopup="dialog"'));
  assert.ok(html.indexOf("Caniuse summary: begin") > html.indexOf('class="example-actions"'));
  assert.equal(data.method, "intersection-of-browser-version-global-usage");
  assert.ok(data.browsers.length > 10);
  assert.ok(data.overall.full <= Math.min(...data.features.map(feature => feature.full)) + .05);
  assert.ok(Math.abs(data.browsers.reduce((sum, browser) => sum + browser.coverage.full, 0) - data.overall.full) < .00001);
});

test("combined support counts usage intersections, never averages or unknown versions", () => {
  const result = aggregateSupport({
    agents: { demo: { browser: "Demo", versions: ["1", "2", "3", "4"], usage_global: { "1": 10, "2": 20, "3": 30, "4": 40 } } },
    data: {
      first: { stats: { demo: { "1": "y x", "2": "a", "3": "n", "4": "y" } } },
      second: { stats: { demo: { "1": "y", "2": "y", "3": "y", "4": "u" } } },
    },
  }, ["first", "second"]);
  assert.deepEqual(result.overall, { full: 10, partial: 20, none: 30, unknown: 40 });
  assert.equal(result.browsers[0].version, "4");
  assert.equal(supportState("y d #1"), "none");
  assert.equal(supportState(undefined), "unknown");
});
