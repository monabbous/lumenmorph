import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import postcss from "postcss";
import { format } from "prettier";
import { examples } from "../public/lab/example-behaviors.mjs";

const root = new URL("../public/lab/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
const source = await read("examples/index.html");
const allCss = await read("showcase.css");
const runtime = await build({ entryPoints: [new URL("../lab/example-runtime.mjs", import.meta.url).pathname], bundle: true, write: false, format: "iife", globalName: "LumenExample", minify: true });
const runtimeJs = runtime.outputFiles[0].text;
const runtimeCss = (await Promise.all(["assets/lumenmorph.css", "assets/slidebox.css", "assets/slidebox-range.css"].map(read))).join("\n");
await writeFile(new URL("editor-runtime.json", root), JSON.stringify({ css: runtimeCss, js: runtimeJs }) + "\n");
// Keep icons local so the gallery and editor do not depend on a CDN.
for (const file of ["css/all.min.css", "webfonts/fa-solid-900.woff2", "webfonts/fa-brands-400.woff2", "webfonts/fa-regular-400.woff2", "LICENSE.txt"]) {
  const destination = new URL(`assets/fontawesome/${file}`, root);
  await mkdir(new URL("./", destination), { recursive: true });
  await copyFile(new URL(`../node_modules/@fortawesome/fontawesome-free/${file}`, import.meta.url), destination);
}
const generator = await readFile(new URL(import.meta.url), "utf8");
await build({ entryPoints: [new URL("../lab/code-editor.mjs", import.meta.url).pathname, new URL("../lab/code-formatter.mjs", import.meta.url).pathname], bundle: true, minify: true, format: "esm", outdir: new URL("assets/", root).pathname, outExtension: { ".js": ".mjs" }, splitting: true, chunkNames: "editor-chunk-[hash]", legalComments: "eof", metafile: true }).then(async result => {
  const packages = new Set(Object.keys(result.metafile.inputs).flatMap(path => path.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)?.[1] ?? []));
  const notices = [];
  for (const name of packages) {
    for (const file of ["LICENSE", "LICENSE.md"]) {
      try { notices.push(`${name}\n${await readFile(new URL(`../node_modules/${name}/${file}`, import.meta.url), "utf8")}`); break; } catch (error) { if (error.code !== "ENOENT") throw error; }
    }
  }
  await writeFile(new URL("assets/code-editor-LICENSES.txt", root), notices.join("\n\n"));
});
const manifest = [];
for (const match of source.matchAll(/<article class="example" data-example="([^"]+)" data-category="([^"]+)">([\s\S]*?)<\/article>/g)) {
  const [, id, category, content] = match;
  const [markup, caption] = content.split('<div class="example-caption">');
  if (!markup || !caption) throw new Error(`Missing example content: ${id}`);
  const title = decode(caption.match(/<h3>(.*?)<\/h3>/)[1]);
  const description = decode(caption.match(/<p>(.*?)<\/p>/)[1]);
  const classes = new Set(["lm-lab", "showcase", "example", ...[...markup.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/))]);
  const css = postcss.parse(allCss);
  css.walkComments(comment => comment.remove());
  css.walkRules(rule => {
    if (rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    if (rule.parent.type === "atrule" && /prefers-reduced|forced-colors/.test(rule.parent.params)) return;
    const selectors = postcss.list.comma(rule.selector).filter(selector => [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].every(match => classes.has(match[1])));
    if (selectors.length) rule.selector = selectors.join(", "); else rule.remove();
  });
  css.walkAtRules(rule => { if (rule.nodes && !rule.nodes.length) rule.remove(); });
  let exampleCss = `/* Change this material and make it yours. */\nbody { margin: 0; padding: 24px; min-height: 100vh; box-sizing: border-box; display: grid; place-items: center; background: #102a31; color: #e9f3ed; font-family: ui-monospace, monospace; }\nbutton, input { font: inherit; }\n.lm-lab { width: 100%; max-width: 380px; }\n${css.toString().trim()}\n.lm-lab .showcase { padding: 0; border: 0; }\n.lm-lab .example { border-radius: 4px; }\n`;
  const setup = examples[id] ? `(${examples[id].toString().replace(/^\w+\(/, "function (")})(document.querySelector('.showcase-demo'), controller.signal);` : "// This study needs no extra interaction.";
  let js = `// Lumenmorph and Slidebox are loaded for this playground.\nconst { trackPointer, enhanceSlideboxRange, enhanceSlideboxRangeFill } = LumenExample;\nconst controller = new AbortController();\nconst stopLight = trackPointer(document.querySelector('.lm-lab'));\nconst ranges = [...document.querySelectorAll('input[type=range]')].flatMap(input => [enhanceSlideboxRange(input), enhanceSlideboxRangeFill(input)]);\n\n${setup}\n\nwindow.addEventListener('pagehide', event => { if (!event.persisted) { controller.abort(); stopLight(); ranges.forEach(stop => stop()); } });\n`;
  let html = `<main class="lm-lab">\n  <section class="showcase">\n    <article class="example" data-visible>\n      ${markup}\n    </article>\n  </section>\n</main>`;
  [html, exampleCss, js] = await Promise.all([[html, "html"], [exampleCss, "css"], [js, "babel"]].map(([source, parser]) => format(source, { parser, printWidth: 80, tabWidth: 2 })));
  const data = { id, title, description, category, html, css: exampleCss, js };
  const hash = createHash("sha256").update(JSON.stringify(data) + runtimeCss + runtimeJs + generator).digest("hex").slice(0, 16);
  const directory = new URL(`examples/${id}/`, root);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("source.json", directory), JSON.stringify(data, null, 2) + "\n");
  await writeFile(new URL("index.html", directory), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} · Lumenmorph</title><meta name="description" content="${escape(description)} Edit this Lumenmorph example live.">
<meta name="lab:title" content="${escape(title)} · Lumenmorph"><meta name="lab:image" content="./og.png?v=${hash}"><meta name="lab:image:width" content="1200"><meta name="lab:image:height" content="630">
<meta property="og:title" content="${escape(title)} · Lumenmorph"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="https://nabous.dev/lab/lumenmorph/examples/${id}/"><meta property="og:image" content="https://nabous.dev/lab/lumenmorph/examples/${id}/og.png?v=${hash}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://nabous.dev/lab/lumenmorph/examples/${id}/"><link rel="stylesheet" href="../../assets/lumenmorph.css"><link rel="stylesheet" href="../../editor.css"><link rel="stylesheet" href="../../assets/fontawesome/css/all.min.css">
</head><body><main class="example-studio" data-example="${id}">
<a class="studio-back" href="../"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> All 24 examples</a>
<div class="example-heading"><div><p class="eyebrow">LUMENMORPH / ${category.toUpperCase()}</p><h1>${escape(title)}</h1><p>${escape(description)}</p></div><button class="studio-button lumenmorph lumenmorph-border" id="share-example" type="button"><i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i> Share example</button></div>
<div class="studio-workspace">
<section class="preview-card studio-card" aria-labelledby="preview-heading"><div class="panel-heading"><h2 id="preview-heading">Live preview</h2><span id="preview-state" role="status">Loading</span></div><div class="preview-stage"><img id="preview-poster" src="./og.png?v=${hash}" alt="${escape(title)} preview" width="1200" height="630"><iframe id="example-preview" title="${escape(title)} live preview" sandbox="allow-scripts" referrerpolicy="no-referrer" hidden></iframe></div><div class="preview-caption">Try the controls. Change the code. See what happens.</div></section>
<section class="editor-card studio-card" aria-label="Live code editor"><div class="editor-toolbar"><div class="code-tabs" role="tablist" aria-label="Code language"><button type="button" role="tab" id="tab-html" aria-controls="panel-html" aria-selected="true" data-language="html"><i class="fa-brands fa-html5" aria-hidden="true"></i>HTML</button><button type="button" role="tab" id="tab-css" aria-controls="panel-css" aria-selected="false" tabindex="-1" data-language="css"><i class="fa-brands fa-css3-alt" aria-hidden="true"></i>CSS</button><button type="button" role="tab" id="tab-js" aria-controls="panel-js" aria-selected="false" tabindex="-1" data-language="js"><i class="fa-brands fa-js" aria-hidden="true"></i>JS</button></div><button type="button" class="studio-button" id="format-code" aria-label="Format code" title="Format code (Shift+Alt+F)" disabled><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i></button><label class="auto-run"><input type="checkbox" id="auto-run" checked>Auto-run</label></div>
${["html", "css", "js"].map((language, index) => `<div role="tabpanel" id="panel-${language}" aria-labelledby="tab-${language}"${index ? " hidden" : ""}><label class="visually-hidden" for="code-${language}">${language.toUpperCase()} code</label><textarea id="code-${language}" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" disabled></textarea></div>`).join("\n")}
<div class="editor-actions"><button type="button" class="studio-button lumenmorph lumenmorph-border" id="run-code" disabled><i class="fa-solid fa-play" aria-hidden="true"></i>Run</button><button type="button" class="studio-button" id="reset-code" disabled><i class="fa-solid fa-rotate-left" aria-hidden="true"></i>Reset</button><span id="edit-status" role="status">Loading source…</span></div><pre id="preview-error" role="status" hidden></pre></section>
</div>
<div class="studio-bottom"><p>HTML, CSS, and JavaScript. Lumenmorph and Slidebox are included.<br>Edits stay in this tab. Share links open the published example.</p><div class="studio-export"><button type="button" class="studio-button" id="download-example" disabled><i class="fa-solid fa-download" aria-hidden="true"></i>Download HTML</button><form id="codepen-form" action="https://codepen.io/pen/define" method="post" target="_blank" rel="noopener noreferrer"><input type="hidden" name="data" id="codepen-data"><button type="submit" class="studio-button" id="open-codepen" disabled><i class="fa-brands fa-codepen" aria-hidden="true"></i>Open in CodePen</button></form></div></div>
<p id="share-status" role="status"></p><input id="share-url" aria-label="Example link" readonly hidden>
<noscript><p>Enable JavaScript to use the live editor. The example preview is shown above.</p></noscript>
</main><script type="module" src="../../editor.mjs"></script></body></html>\n`);
  // Render actual card markup at a stable viewport, without network dependencies.
  const preview = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${runtimeCss}\n${exampleCss}\nhtml,body{width:1200px;height:630px;overflow:hidden}body{padding:60px;display:grid;grid-template-columns:1fr 400px;gap:60px;background:radial-gradient(ellipse at 85% 30%,#37625750,transparent 70%),#102a31}.og-copy{align-self:center;max-width:490px}.og-copy .tag{color:#ffaa71;font:12px/1.6 ui-monospace,monospace;letter-spacing:2px}.og-copy h1{font:500 48px/1.12 ui-monospace,monospace;letter-spacing:-3px;margin:28px 0 22px}.og-copy p{font:16px/1.7 ui-monospace,monospace;color:#adc2c5}.og-copy .address{margin-top:50px;font-size:13px}.lm-lab{width:380px;max-height:540px;align-self:center}.lm-lab .showcase{--lumen-x:950px;--lumen-y:200px}.lm-lab .example{border:2px solid #92b4ad40;border-radius:4px}*{animation:none!important;transition:none!important}</style></head><body><div class="og-copy"><span class="tag">LUMENMORPH / ${category.toUpperCase()}</span><h1>${escape(title)}</h1><p>${escape(description)}</p><p class="address">nabous.dev / examples / ${id}</p></div>${html}</body></html>`;
  await writeFile(new URL("preview.html", directory), preview);
  manifest.push({ id, title, hash });
}
if (manifest.length !== 24) throw new Error(`Expected 24 examples, found ${manifest.length}`);
await writeFile(new URL("examples/manifest.json", root), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Generated ${manifest.length} shareable example pages and editable sources.`);
