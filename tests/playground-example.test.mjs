import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { playgroundDocument, cardMarkup, previewLayout } from "../public/lab/playground-example.mjs";

test("runnable export and lab use the same star-card markup and layout", async () => {
  assert.equal(await readFile(new URL("../public/lab/playground/index.html", import.meta.url), "utf8"), playgroundDocument());
  const lab = await readFile(new URL("../public/lab/index.html", import.meta.url), "utf8");
  assert.ok(lab.includes(cardMarkup()));
  assert.equal(await readFile(new URL("../public/lab/playground-layout.css", import.meta.url), "utf8"), previewLayout);
  assert.doesNotMatch(lab, /id="settings-preview"|settings-workbench|Workspace settings/);
  const document = playgroundDocument();
  assert.match(document, /lumenmorph@0\.3\.2\/dist\/css\/lumenmorph\.min\.css/);
  assert.match(document, /class="lumenmorph-text"/);
  assert.equal(document.match(/trackPointer\(\)/g).length, 1);
  assert.doesNotMatch(document, /lab\.css|showcase\.css|editor-runtime|backdrop-filter:|mask-composite:|box-shadow:/);
});

test("export respects theme and pointer options and escapes custom content", () => {
  assert.ok(playgroundDocument({ values: { "glow-color": "#70d5c5" } }).includes("--lumen-glow-color: #70d5c5"));
  assert.doesNotMatch(playgroundDocument({ tracking: false, smoothing: false }), /<script|motion\.min\.css/);
  assert.throws(() => playgroundDocument({ values: { bg: "red; } </style><script>" } }), /Invalid theme value/);
  const text = '<img src=x onerror="alert(1)">';
  const document = playgroundDocument({ text });
  assert.ok(!document.includes(text));
  assert.ok(document.includes("&lt;img"));
  assert.ok(playgroundDocument({ text: "</script><script>alert(1)</script>" }).includes("&lt;/script&gt;&lt;script&gt;"));
  assert.equal(document.match(/<script type="module">/g).length, 1);
});
