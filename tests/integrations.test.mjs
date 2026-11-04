import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import { compileString } from "sass";
import less from "less";
import postcss from "postcss";
import tailwind from "tailwindcss";
import { compile } from "@tailwindcss/node";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { LumenText, LumenIcon } from "../react/index.mjs";
import { highlight } from "../lab/highlight.mjs";
import { installationSnippets, foundationSnippets, componentSnippets } from "../public/lab/snippets.mjs";

const require = createRequire(import.meta.url);
const css = await readFile(new URL("../dist/css/lumenmorph.css", import.meta.url), "utf8");
const mixins = await readFile(new URL("../less/lumenmorph.less", import.meta.url), "utf8");

function declarations(source, selector, property) {
  const values = [];
  postcss.parse(source).walkRules(rule => {
    if (rule.selectors.includes(selector)) rule.walkDecls(property, decl => values.push(decl.value));
  });
  return values;
}

test("SCSS and Less preserve core declarations and accessibility rules", async () => {
  const sass = compileString('@use "mixins" as lumen; .card { @include lumen.lumenmorph((glow-size: 480px)); @include lumen.border(); } .label { @include lumen.text(); }', { loadPaths: [new URL("../scss", import.meta.url).pathname] }).css;
  const lessCSS = (await less.render(`${mixins}\n.card { .lumenmorph(@glow-size: 480px); .lumenmorph-border(); } .label { .lumenmorph-text(); }`)).css;
  for (const compiled of [sass, lessCSS]) {
    assert.deepEqual(declarations(compiled, ".card", "background-image"), declarations(css, ".lumenmorph", "background-image"));
    assert.deepEqual(declarations(compiled, ".card::before", "background-image"), declarations(css, ".lumenmorph-border::before", "background-image"));
    assert.deepEqual(declarations(compiled, ".card", "--lumen-glow-size"), ["480px"]);
    assert.match(compiled, /forced-colors: active/);
    assert.match(compiled, /prefers-reduced-transparency: reduce/);
    assert.match(compiled, /mask-composite: exclude/);
    assert.deepEqual(declarations(compiled, ".label", "background-image"), declarations(css, ".lumenmorph-text", "background-image"));
  }
});

test("original HTML text class remains an alias without a blur or visible stroke", () => {
  assert.deepEqual(declarations(css, ".glassmorphism-text", "background-image"), declarations(css, ".lumenmorph-text", "background-image"));
  assert.deepEqual(declarations(css, ".lumenmorph-text", "backdrop-filter"), ["none"]);
  assert.deepEqual(declarations(css, ".lumenmorph-text", "-webkit-text-stroke"), ["var(--lumen-text-stroke-width, 2px) transparent", "0"]);
});

test("SCSS entry point emits ready-to-use classes", () => {
  const output = compileString('@use "lumenmorph";', { loadPaths: [new URL("../scss", import.meta.url).pathname] }).css;
  assert.match(output, /\.lumenmorph-border::before/);
  assert.match(output, /\.lumenmorph-text/);
});

test("Less ready-made classes match CSS for surfaces and HTML text", async () => {
  const source = await readFile(new URL("../less/classes.less", import.meta.url), "utf8");
  const output = (await less.render(source)).css;
  for (const selector of [".lumenmorph", ".lumenmorph-border::before", ".lumenmorph-text", ".glassmorphism-text"]) {
    assert.deepEqual(declarations(output, selector, "background-image"), declarations(css, selector, "background-image"));
  }
});

test("implementation blocks separate foundations from all SVG adapters", () => {
  for (const format of ["css", "scss", "less"]) {
    const blocks = foundationSnippets(format, { "glow-size": "460px" }, { tracking: true, smoothing: true });
    assert.equal(blocks.length, 3);
    assert.match(blocks[0].code, /--lumen-glow-size: 460px/);
    assert.match(blocks[2].code, /trackPointer/);
    assert.equal(foundationSnippets(format, {}, { tracking: false, smoothing: false }).length, 2);
  }
  for (const framework of ["react", "vue", "svelte", "angular", "web-component"]) {
    const blocks = componentSnippets(framework);
    assert.ok(blocks.length >= 1);
    assert.match(blocks.map(block => block.code).join("\n"), /LumenIcon|lumen-icon|lumenIcon/);
    assert.doesNotMatch(blocks.map(block => block.code).join("\n"), /trackPointer\(/);
  }
});

test("CDN snippets use minified CSS and browser-resolvable imports with optional motion", () => {
  assert.match(installationSnippets("css", {})[0].code, /npm install @monabbous\/lumenmorph/);
  const install = installationSnippets("cdn", { smoothing: true })[0].code;
  assert.match(install, /@0\.2\.2\/dist\/css\/lumenmorph\.min\.css/);
  assert.match(install, /motion\.min\.css/);
  assert.doesNotMatch(installationSnippets("cdn", { smoothing: false })[0].code, /motion/);
  const blocks = foundationSnippets("cdn", { "glow-color": "#ffaa71" }, { tracking: true, smoothing: true });
  assert.match(blocks[0].code, /--lumen-glow-color: #ffaa71/);
  assert.doesNotMatch(blocks[0].code, /@import/);
  assert.match(blocks[1].code, /lumenmorph-motion/);
  assert.match(blocks[2].code, /<script type="module">/);
  assert.match(blocks[2].code, /https:\/\/cdn\.jsdelivr\.net\/npm\/@monabbous\/lumenmorph@0\.2\.2\/js\/pointer\.mjs/);
  assert.equal(foundationSnippets("cdn", {}, { tracking: false, smoothing: false }).length, 2);
});

test("code highlighting escapes markup and colors supported languages", () => {
  assert.match(highlight('const value = "light";', "javascript"), /hljs-keyword/);
  assert.match(highlight('<script>alert("x")</script>', "xml"), /&lt;/);
  assert.doesNotMatch(highlight('<script>alert("x")</script>', "xml"), /<script>/);
});

test("Tailwind v3 compiles components, theme colors, arbitrary values, and variants", async () => {
  const output = await postcss([tailwind({
    content: [{ raw: '<div class="lumenmorph lumenmorph-border lumenmorph-text lumen-glow-cyan-300 lumen-glow-size-[480px] hover:lumen-glow-opacity-50 lumen-bg-[#11223380] lumen-radius-xl"></div>' }],
    plugins: [require("../tailwind/index.cjs")],
  })]).process("@tailwind utilities;", { from: undefined });
  assert.match(output.css, /--lumen-glow-size: 480px/);
  assert.match(output.css, /--lumen-glow-opacity: 0.5/);
  assert.match(output.css, /--lumen-glow-color: #67e8f9/);
  assert.match(output.css, /forced-colors: active/);
  assert.match(output.css, /mask-composite: exclude/);
});

test("Tailwind v4 compiles the same plugin through @plugin", async () => {
  const compiler = await compile('@import "tailwindcss-v4"; @plugin "./tailwind/index.cjs";', { base: new URL("..", import.meta.url).pathname, onDependency() {} });
  const output = compiler.build(["lumenmorph", "lumenmorph-border", "lumenmorph-text", "lumen-glow-cyan-300", "lumen-glow-size-[480px]", "hover:lumen-glow-opacity-50"]);
  assert.match(output, /--lumen-glow-size: 480px/);
  assert.match(output, /--lumen-glow-opacity: 0.5/);
  assert.match(output, /--lumen-glow-color: (?:oklch\(|var\(--color-cyan-300\))/);
  assert.match(output, /mask-composite: exclude/);
});

test("React SVG is accessible, server-renderable, and uses distinct stable mask IDs", () => {
  const render = () => renderToString(createElement("div", null, createElement(LumenText, { width: 640, height: 120 }, "Glass & light"), createElement(LumenText, null, "Another")));
  const output = render();
  const ids = [...output.matchAll(/<mask id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, 4);
  assert.equal(output, render());
  assert.match(output, /aria-label="Glass &amp; light"/);
  assert.match(output, /foreignObject/);
  assert.equal([...output.matchAll(/dominant-baseline="middle"/g)].length, 6);
  assert.doesNotMatch(output, /Math.random/);
});

test("React SVG text preserves explicit baseline and positioning overrides", () => {
  const output = renderToString(createElement(LumenText, {
    textProps: { dominantBaseline: "alphabetic", x: 12, y: 95 },
  }, "Custom baseline"));
  assert.equal([...output.matchAll(/dominant-baseline="alphabetic"/g)].length, 3);
  assert.equal([...output.matchAll(/x="12" y="95"/g)].length, 3);
});

test("React icon ports filled silhouettes with explicit or decorative semantics", () => {
  const output = renderToString(createElement(LumenIcon, { paths: ["M8 8h48v48H8Z"], label: "Square", viewBox: "0 0 64 64" }));
  assert.match(output, /aria-label="Square"/);
  assert.equal([...output.matchAll(/<path /g)].length, 3);
  assert.match(output, /feMorphology/);
  assert.match(renderToString(createElement(LumenIcon, { paths: "M8 8h48v48H8Z" })), /aria-hidden="true"/);
  assert.throws(() => renderToString(createElement(LumenIcon, { paths: "M0 0", viewBox: "0 0 0 10" })), /viewBox/);
});

test("client-only entry points import safely without a browser", async () => {
  await import("../vue/index.mjs");
  const web = await import("../web-component/index.mjs");
  assert.throws(() => web.defineLumenText(), /browser/);
  assert.throws(() => web.defineLumenIcon(), /browser/);
});

test("core CSS and pointer helper stay within small gzip budgets", async () => {
  const js = await readFile(new URL("../js/pointer.mjs", import.meta.url));
  assert.ok(gzipSync(css).length < 1800, "CSS exceeds 1.8 kB gzip budget");
  assert.ok(gzipSync(js).length < 1800, "Pointer helper exceeds 1.8 kB gzip budget");
});

test("Slidebox skin reuses canonical paint without replacing native geometry or private controls", async () => {
  const output = await readFile(new URL("../dist/css/slidebox.css", import.meta.url), "utf8");
  const lab = await readFile(new URL("../public/lab/assets/lumenmorph-slidebox.css", import.meta.url), "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.exports["./slidebox"], "./dist/css/slidebox.css");
  assert.equal(output, lab);
  assert.match(output, /@media \(forced-colors: none\)/);
  assert.match(output, /prefers-reduced-transparency: reduce/);
  assert.match(output, /var\(--lumen-blur, 40px\)/);
  assert.match(output, /var\(--slidebox-track, Field\) 40%, transparent/);
  assert.match(output, /18%, #102a3166/);
  assert.match(output, /2\.5%, transparent/);
  assert.match(output, /var\(--lumen-blur, 12px\)/);
  assert.match(output, /var\(--lumen-blur, 2px\)/);
  assert.match(output, /mask-composite: exclude/);
  assert.match(output, /::-webkit-slider-thumb/);
  assert.match(output, /::-moz-range-thumb/);
  assert.doesNotMatch(output, /var\(--_(?!lumen-)/);
  assert.doesNotMatch(output, /(?:^|[;{])\s*(?:width|height|margin(?:-[a-z-]+)?|transition(?:-[a-z-]+)?|transform)\s*:/);
  assert.doesNotMatch(output, /--(?:slidebox|lumen)-(?:size|width|spacing|deform|duration|easing|bg|blur)\s*:/);
});

test("motion is optional, inherited, and only transitions its coordinate owner", async () => {
  const motion = await readFile(new URL("../dist/css/motion.css", import.meta.url), "utf8");
  const sass = compileString('@use "motion";', { loadPaths: [new URL("../scss", import.meta.url).pathname] }).css;
  const lessCSS = (await less.render(await readFile(new URL("../less/motion.less", import.meta.url), "utf8"))).css;
  for (const output of [motion, sass, lessCSS]) {
    assert.match(output, /@property --lumen-x/);
    assert.match(output, /inherits: true/);
    assert.match(output, /prefers-reduced-motion: reduce/);
    assert.deepEqual(declarations(output, ".lumenmorph", "transition"), []);
    assert.equal(declarations(output, ".lumenmorph-motion", "transition").length, 2);
  }
  assert.doesNotMatch(css, /@property|transition:/);
});

test("native Tailwind v4 utilities resolve theme colors, presets, arbitrary controls, and variants", async () => {
  const compiler = await compile('@import "tailwindcss-v4"; @import "./tailwind/lumenmorph.css";', { base: new URL("..", import.meta.url).pathname, onDependency() {} });
  const output = compiler.build(["lumenmorph", "lumenmorph-border", "lumenmorph-text", "lumen-glow-color-lilac", "hover:lumen-glow-color-teal-400", "lumen-glow-size-[480px]", "lumen-glow-opacity-35", "lumen-border-opacity-[0.7]", "md:lumen-radius-[4px]", "lumen-border-width-1.5"]);
  assert.match(output, /--lumen-color-lilac: #c4a1ff/);
  assert.match(output, /--lumen-glow-color: var\(--lumen-color-lilac\)/);
  assert.match(output, /--lumen-glow-color: var\(--color-teal-400\)/);
  assert.match(output, /--lumen-glow-size: 480px/);
  assert.match(output, /--lumen-glow-opacity: calc\(35 \/ 100\)/);
  assert.match(output, /--lumen-border-opacity: (?:0)?\.7/);
  assert.match(output, /mask-composite: exclude/);
  assert.match(output, /forced-colors: active/);
  assert.match(output, /prefers-reduced-transparency: reduce/);
});

test("UI themes reuse canonical paint and accessibility without taking over focus or Mantine loading", async () => {
  for (const [name, surface, border] of [
    ["mui", ".lumenmorph-mui.lumenmorph-mui", ".lumenmorph-mui.lumenmorph-mui"],
    ["mantine", ".lumenmorph-mantine.lumenmorph-mantine", ".lumenmorph-mantine-border.lumenmorph-mantine-border"],
    ["taiga-ui", '[tuiAppearance][data-appearance="lumenmorph"]', '[tuiAppearance][data-appearance="lumenmorph"]'],
  ]) {
    const theme = await readFile(new URL(`../dist/css/${name}.css`, import.meta.url), "utf8");
    assert.deepEqual(declarations(theme, surface, "background-image"), declarations(css, ".lumenmorph", "background-image"));
    assert.deepEqual(declarations(theme, border + "::before", "background-image"), declarations(css, ".lumenmorph-border::before", "background-image"));
    assert.match(theme, /forced-colors: active/);
    assert.match(theme, /prefers-reduced-transparency: reduce/);
    assert.doesNotMatch(theme, /outline:|opacity:|transition:|!important/);
    if (name === "mantine") assert.deepEqual(declarations(theme, surface + "::before", "content"), []);
  }
});

test("Tailwind lab exports compile both @apply defaults and direct utilities", async () => {
  const values = { "glow-color": "#ffaa71", "border-glow-color": "#ffd4a3", "glow-size": "460px", "glow-opacity": "0.3", "border-opacity": "0.9", blur: "32px", saturation: "1.6", radius: "4px", "border-width": "1.5px", bg: "#302028b3" };
  const blocks = foundationSnippets("tailwind", values, { tracking: true, smoothing: true });
  const setup = blocks[0].code.replace('"tailwindcss"', '"tailwindcss-v4"').replace('"@monabbous/lumenmorph/motion"', '"./dist/css/motion.css"').replace('"@monabbous/lumenmorph/tailwind/css"', '"./tailwind/lumenmorph.css"');
  const applied = blocks.find(block => block.code.includes("@apply")).code;
  const direct = blocks.find(block => block.title.startsWith("B.")).code;
  const compiler = await compile(setup + "\n" + applied, { base: new URL("..", import.meta.url).pathname, onDependency() {} });
  const classes = [...direct.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/));
  const output = compiler.build(classes);
  for (const [key, value] of Object.entries(values)) {
    assert.ok(declarations(output, ".material", `--lumen-${key}`).includes(value), `@apply should set ${key}`);
    assert.ok(declarations(output, `.lumen-${key === "border-glow-color" ? "border-glow" : key}-\\[${value.replaceAll("#", "\\#").replaceAll(".", "\\.")}\\]`, `--lumen-${key}`).includes(value), `direct utility should set ${key}`);
  }
  assert.match(blocks.at(-1).code, /trackPointer/);
});
