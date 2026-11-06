import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../public/lab/", import.meta.url);
const data = JSON.parse(await readFile(new URL("assets/browser-support.json", root), "utf8"));
const day = data.retrievedAt.slice(0, 10);
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(data.retrievedAt));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const percent = value => {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error("Invalid support percentage");
  return `${value.toFixed(2)}%`;
};
const labels = { "css-backdrop-filter": "backdrop-filter", "css-masks": "CSS masks", "css-variables": "CSS variables", "background-clip-text": "background-clip: text" };
const rows = data.features.map(feature => {
  if (!Object.hasOwn(labels, feature.id)) throw new Error("Invalid feature");
  return `<tr><th scope="row"><a href="https://caniuse.com/${feature.id}">${labels[feature.id]}</a></th><td>${percent(feature.full)}</td><td>${percent(feature.partial)}</td></tr>`;
}).join("\n");
const table = `<table class="support-table"><caption>Individual features · global browser usage</caption><thead><tr><th scope="col">Feature</th><th scope="col">Full support</th><th scope="col">Partial</th></tr></thead><tbody>${rows}</tbody></table>`;
const sources = `<p class="hint">Snapshot checked <time datetime="${day}">${date}</time>. <a href="${data.source}/commit/${data.commit}">Caniuse source data</a> · <a href="${data.license}">CC BY 4.0</a>. Full support includes prefixed implementations classified as supported by Caniuse. This is not a percentage of Lumenmorph compatibility: color-mix(), SVG-specific behavior, and rendering bugs are not included. CSS masking is a broad feature; partial support does not guarantee mask compositing.</p>`;
const stateLabels = { full: "Full", partial: "Partial", none: "No", unknown: "Unknown" };
const browserRows = data.browsers.map(browser => `<tr><th scope="row">${escape(browser.name)}</th><td>${escape(browser.version)}</td>${browser.support.map(state => {
  if (!Object.hasOwn(stateLabels, state)) throw new Error("Invalid browser state");
  return `<td data-support="${state}">${stateLabels[state]}</td>`;
}).join("")}</tr>`).join("\n");
const shortLabels = ["Blur", "Masks", "Variables", "Text clip"];
const browserCards = data.browsers.map(browser => `<li><div class="support-browser-heading"><strong>${escape(browser.name)}</strong><span>v${escape(browser.version)}</span></div><dl>${browser.support.map((state, index) => `<div><dt>${shortLabels[index]}</dt><dd data-support="${state}">${stateLabels[state]}</dd></div>`).join("")}</dl></li>`).join("\n");
const summary = `<button type="button" id="show-browser-support" class="lumenmorph support-trigger" aria-haspopup="dialog" aria-controls="browser-support-modal" disabled>CSS support <strong class="lumenmorph-text">${percent(data.overall.full)}</strong> <span>Details</span><span class="sr-only">— full support for all four tracked CSS features</span></button>`;
const modal = `<dialog id="browser-support-modal" aria-labelledby="support-dialog-heading" aria-describedby="support-dialog-description">
<div class="support-dialog-heading"><h2 id="support-dialog-heading">Browser support</h2><button class="lumenmorph lumenmorph-border" type="button" id="close-browser-support" aria-label="Close browser support">Close</button></div>
<p class="support-lede"><strong>${percent(data.overall.full)}</strong> of global browser usage fully supports all four tracked CSS features.</p>
<p id="support-dialog-description">Combined CSS coverage, not a whole-library guarantee. Color mixing and SVG-specific behavior are excluded.</p>
<div class="support-dialog-scroll" tabindex="0" role="region" aria-label="Browser support tables">
<p class="support-mobile-caption">${data.browsers.length} browser families · most-used recorded versions. Combined coverage includes all recorded versions.</p><ul class="support-browser-cards" aria-label="Browser feature support">${browserCards}</ul>
<table class="support-matrix"><caption>${data.browsers.length} browser families · most-used recorded versions. Combined coverage includes all recorded versions.</caption><thead><tr><th scope="col">Browser</th><th scope="col">Version</th><th scope="col">Blur</th><th scope="col">Masks</th><th scope="col">Variables</th><th scope="col">Text clip</th></tr></thead><tbody>${browserRows}</tbody></table>
<p class="hint">Full / Partial / No / Unknown are feature classifications, not device-test results. Zero-usage families use their latest listed version as a reference.</p>
<details class="support-method"><summary>How the percentage is calculated</summary><p>Each browser-version usage weight is counted once. Full support requires all four features to be fully supported; partial support requires every feature to be at least partially supported. Disabled-by-default, unknown, and unreported browser usage are not counted as full. No feature percentages are averaged.</p><p>${percent(data.overall.partial)} additional global usage has partial support for the tracked set.</p></details>
${table}${sources}<p class="hint"><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix">color-mix() support</a> · <a href="https://github.com/monabbous/lumenmorph/blob/main/docs/accessibility.md">Rendering and accessibility limits</a></p>
</div></dialog>`;
const target = new URL("index.html", root);
const html = await readFile(target, "utf8");
for (const name of ["support", "summary", "modal"]) if (!html.includes(`<!-- Caniuse ${name}: begin -->`)) throw new Error(`Missing ${name} markers`);
await writeFile(target, html
  .replace(/<!-- Caniuse support: begin -->[\s\S]*?<!-- Caniuse support: end -->/, `<!-- Caniuse support: begin -->\n${table}${sources}\n<!-- Caniuse support: end -->`)
  .replace(/<!-- Caniuse summary: begin -->[\s\S]*?<!-- Caniuse summary: end -->/, `<!-- Caniuse summary: begin -->\n${summary}\n<!-- Caniuse summary: end -->`)
  .replace(/<!-- Caniuse modal: begin -->[\s\S]*?<!-- Caniuse modal: end -->/, `<!-- Caniuse modal: begin -->\n${modal}\n<!-- Caniuse modal: end -->`));
console.log("Built the combined CSS-support control and browser-details dialog.");
