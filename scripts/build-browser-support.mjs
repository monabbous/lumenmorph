import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../public/lab/", import.meta.url);
const data = JSON.parse(await readFile(new URL("assets/browser-support.json", root), "utf8"));
const day = data.retrievedAt.slice(0, 10);
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(data.retrievedAt));
const rows = data.features.map(feature => {
  if (!/^css-(backdrop-filter|masks)$/.test(feature.id) || ![feature.full, feature.partial].every(value => Number.isFinite(value) && value >= 0 && value <= 100)) throw new Error("Invalid support snapshot");
  const label = feature.id === "css-backdrop-filter" ? "Backdrop blur" : "CSS masking";
  return `<tr><th scope="row"><a href="https://caniuse.com/${feature.id}">${label}</a></th><td>${feature.full.toFixed(2)}%</td><td>${feature.partial.toFixed(2)}%</td></tr>`;
}).join("\n");
const table = `<table class="support-table"><caption>Caniuse · share of global browser usage</caption><thead><tr><th scope="col">Feature</th><th scope="col">Full support</th><th scope="col">Partial</th></tr></thead><tbody>${rows}</tbody></table>
<p class="hint">Snapshot checked <time datetime="${day}">${date}</time>. <a href="${data.source}/commit/${data.commit}">Source data</a> · <a href="${data.license}">CC BY 4.0</a>. Full support includes prefixed implementations classified as supported by Caniuse. These are feature-level usage figures—not a percentage of Lumenmorph compatibility. CSS masking is a broad feature; partial support does not guarantee mask compositing.</p>`;
const target = new URL("index.html", root);
const html = await readFile(target, "utf8");
if (!html.includes("<!-- Caniuse support: begin -->")) throw new Error("Missing support table markers");
await writeFile(target, html.replace(/<!-- Caniuse support: begin -->[\s\S]*?<!-- Caniuse support: end -->/, `<!-- Caniuse support: begin -->\n${table}\n<!-- Caniuse support: end -->`));
console.log("Built the dated Caniuse support table from the committed snapshot.");
