import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import postcss from "postcss";
import { build } from "esbuild";

const root = new URL("../", import.meta.url);
await build({
  entryPoints: [new URL("react/src/index.tsx", root).pathname], outfile: new URL("react/index.mjs", root).pathname,
  bundle: true, packages: "external", format: "esm", jsx: "automatic", target: "es2022",
  plugins: [{ name: "shared-svg-helper", setup(builder) {
    builder.onResolve({ filter: /^\.\.\/\.\.\/js\/svg\.mjs$/ }, () => ({ path: "../js/svg.mjs", external: true }));
  } }],
});
const css = await readFile(new URL("src/lumenmorph.css", root), "utf8");
const motion = await readFile(new URL("src/motion.css", root), "utf8");
const ast = postcss.parse(css);
const lessClasses = ast.clone();
lessClasses.walkDecls(declaration => {
  if (/\b(?:color-mix|calc|blur|saturate|radial-gradient)\(/.test(declaration.value)) declaration.value = `~"${declaration.value}"`;
});
const controls = ["bg", "solid-bg", "glow-color", "glow-size", "glow-opacity", "blur", "saturation", "radius", "border-width", "border-color", "border-glow-color", "border-opacity", "text-color", "text-glow-size", "text-glow-opacity", "text-stroke-width"];
const components = { lumenmorph: ".lumenmorph", border: ".lumenmorph-border", text: ".lumenmorph-text" };

function nested(container, selector) {
  const result = container.clone({ nodes: [] });
  for (const node of container.nodes) {
    if (node.type === "rule") {
      const matches = node.selectors.filter(value => value === selector || value.startsWith(`${selector}:`));
      if (matches.length) result.append(node.clone({ selector: matches.map(value => value.replace(selector, "&")).join(", ") }));
    } else if (node.type === "atrule" && node.nodes) {
      const child = nested(node, selector);
      if (child.nodes.length) result.append(child);
    }
  }
  return result;
}

const indent = text => text.split("\n").map(line => `  ${line}`).join("\n");
let sass = '// Generated from src/lumenmorph.css.\n@use "sass:map";\n$defaults: () !default;\n';
let less = '// Generated from src/lumenmorph.css.\n.lumen-option(@name; @value) when not (@value = false) { --lumen-@{name}: @value; }\n';
for (const [name, selector] of Object.entries(components)) {
  const body = nested(ast, selector);
  sass += `\n@mixin ${name}($options: ()) {\n  @each $name, $value in map.merge($defaults, $options) {\n    --lumen-#{$name}: #{$value};\n  }\n${indent(body.toString())}\n}\n`;
  const lessBody = body.clone();
  lessBody.walkDecls(decl => { if (/\b(?:color-mix|calc|blur|saturate|radial-gradient)\(/.test(decl.value)) decl.value = `~"${decl.value}"`; });
  less += `\n.lumenmorph${name === "lumenmorph" ? "" : `-${name}`}(${controls.map(key => `@${key}: false`).join("; ")}) {\n${controls.map(key => `  .lumen-option(${key}; @${key});`).join("\n")}\n${indent(lessBody.toString())}\n}\n`;
}

function object(container) {
  const result = {};
  for (const node of container.nodes) {
    if (node.type === "decl") result[node.prop] = node.value;
    if (node.type === "rule") {
      if (node.selector === "&") Object.assign(result, object(node));
      else result[node.selector] = object(node);
    }
    if (node.type === "atrule" && node.nodes) result[`@${node.name} ${node.params}`] = object(node);
  }
  return result;
}

const outputs = {
  "dist/css/lumenmorph.css": css,
  "dist/css/motion.css": motion,
  "scss/_motion.scss": motion,
  "less/motion.less": motion,
  "scss/_mixins.scss": sass,
  "scss/lumenmorph.scss": '@forward "mixins";\n@use "mixins";\n.lumenmorph { @include mixins.lumenmorph(); }\n.lumenmorph-border { @include mixins.border(); }\n.lumenmorph-text, .glassmorphism-text { @include mixins.text(); }\n',
  "less/lumenmorph.less": less,
  "less/classes.less": "// Generated from src/lumenmorph.css.\n" + lessClasses.toString(),
  "less/index.less": '@import "lumenmorph.less";\n',
  "scss/_index.scss": '@forward "lumenmorph";\n',
  "tailwind/rules.json": JSON.stringify(Object.fromEntries([...Object.values(components), ".glassmorphism-text"].map(selector => [selector, object(nested(ast, selector))])), null, 2) + "\n",
  "web-component/styles.mjs": `// Generated from src/lumenmorph.css.\nexport const css = ${JSON.stringify(css)};\n`,
};
for (const [path, text] of Object.entries(outputs)) {
  await mkdir(new URL(path.substring(0, path.lastIndexOf("/")) + "/", root), { recursive: true });
  await writeFile(new URL(path, root), text);
}
const assets = new URL("public/lab/assets/", root);
await mkdir(assets, { recursive: true });
await copyFile(new URL("dist/css/lumenmorph.css", root), new URL("lumenmorph.css", assets));
await copyFile(new URL("dist/css/motion.css", root), new URL("motion.css", assets));
await copyFile(new URL("js/pointer.mjs", root), new URL("pointer.mjs", assets));
for (const [source, output] of Object.entries({
  "dist/css/slidebox.css": "slidebox.css",
  "experimental/range.css": "slidebox-range.css",
  "experimental/range.mjs": "slidebox-range.mjs",
})) {
  await copyFile(new URL(`node_modules/@monabbous/slidebox/${source}`, root), new URL(output, assets));
}
// Slidebox has the same author and ISC terms; its npm tarball omits a license file.
await copyFile(new URL("LICENSE", root), new URL("slidebox-LICENSE", assets));
for (const name of ["react", "react-dom"]) {
  await copyFile(new URL(`node_modules/${name}/LICENSE`, root), new URL(`${name}-LICENSE`, assets));
}
await build({ entryPoints: [new URL("lab/react-demo.mjs", root).pathname], outfile: new URL("react-demo.mjs", assets).pathname, bundle: true, minify: true, format: "esm", define: { "process.env.NODE_ENV": '"production"' } });
await build({ entryPoints: [new URL("lab/highlight.mjs", root).pathname], outfile: new URL("highlight.mjs", assets).pathname, bundle: true, minify: true, format: "esm" });
await copyFile(new URL("node_modules/highlight.js/LICENSE", root), new URL("highlight-LICENSE", assets));
console.log("Built CSS, SCSS, Less, Tailwind utilities, and standalone lab.");
