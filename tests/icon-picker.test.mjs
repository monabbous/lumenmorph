import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { transform } from "esbuild";
import { compile as compileSvelte } from "svelte/compiler";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import { parseTemplate } from "@angular/compiler";
import { componentSnippets } from "../public/lab/snippets.mjs";

test("lazy icon catalog includes every bundled free solid, regular, and brand SVG", async () => {
  const catalog = JSON.parse(await readFile(new URL("../public/lab/assets/fontawesome-icons.json", import.meta.url), "utf8"));
  const ids = new Set(catalog.icons.map(icon => icon.id));
  assert.equal(ids.size, catalog.icons.length);
  for (const style of ["solid", "regular", "brands"]) {
    const files = (await readdir(new URL(`../node_modules/@fortawesome/fontawesome-free/svgs/${style}/`, import.meta.url))).filter(file => file.endsWith(".svg"));
    assert.equal(catalog.icons.filter(icon => icon.style === style).length, files.length);
    for (const file of files) assert.ok(ids.has(`${style}/${file.slice(0, -4)}`));
  }
  assert.equal(catalog.version, "6.5.1");
  assert.ok(catalog.icons.every(icon => icon.path.length < 50000 && icon.viewBox.split(" ").length === 4));
});

test("selected SVG geometry and edited text compile in the copied framework snippets", async () => {
  const options = { text: 'Your "own" <words> {safe}', iconPaths: "M0 0H24V24H0Z", iconViewBox: "0 0 24 24", iconLabel: "Square" };
  const react = componentSnippets("react", options)[0].code;
  await transform(react, { loader: "jsx" });
  const vue = componentSnippets("vue", options)[0].code;
  const { descriptor } = parse(vue);
  compileScript(descriptor, { id: "preview" });
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, id: "preview", filename: "Preview.vue" }).errors, []);
  compileSvelte(componentSnippets("svelte", options)[0].code, { generate: "client" });
  const angular = componentSnippets("angular", options)[0].code;
  assert.deepEqual(parseTemplate(angular.match(/template: `([\s\S]*?)`/)[1], "preview.component.ts").errors, null);
  for (const framework of ["react", "vue", "svelte", "angular", "web-component"]) {
    const code = componentSnippets(framework, options).map(block => block.code).join("\n");
    assert.ok(code.includes(options.iconPaths));
    assert.ok(code.includes(options.iconViewBox));
    assert.ok(code.includes(options.iconLabel));
    assert.ok(!code.includes("SVGGlassMorph"));
  }
});
