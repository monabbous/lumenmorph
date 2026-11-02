import { trackPointer } from "./assets/pointer.mjs";
import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from "./assets/slidebox-range.mjs";
import { installationSnippets, foundationSnippets, componentSnippets } from "./snippets.mjs";

const root = document.querySelector(".lm-lab");
const hosted = Boolean(document.querySelector("[data-nabous-shell]"));
if (hosted) root.dataset.hosted = "";
const form = document.querySelector("#controls");
const snippet = document.querySelector("#snippet");
const tracking = document.querySelector("#tracking");
const smoothing = document.querySelector("#smoothing");
const presets = {
  lagoon: { "glow-color": "#00b2b2", "border-glow-color": "#00b2b2", "bg-color": "#063c59", "bg-opacity": "0.4", "glow-size": "360", "glow-opacity": "0.1", "border-opacity": "0.3", blur: "40", saturation: "1.3", radius: "4", "border-width": "2" },
  ember: { "glow-color": "#ffaa71", "border-glow-color": "#ffd4a3", "bg-color": "#302028", "bg-opacity": "0.7", "glow-size": "460", "glow-opacity": "0.3", "border-opacity": "0.9", blur: "32", saturation: "1.6", radius: "4", "border-width": "1.5" },
  daylight: { "glow-color": "#0799ce", "border-glow-color": "#ffffff", "bg-color": "#f4fbff", "bg-opacity": "0.5", "glow-size": "300", "glow-opacity": "0.22", "border-opacity": "1", blur: "18", saturation: "1.1", radius: "4", "border-width": "1" },
};
let format = "css";
let framework = "react";
let foundationBlocks = [];
let componentBlocks = [];
let colorCode;
let cleanup;
let demoCleanup;
let demoVersion = 0;
const adapterLoaders = {
  react: () => import("./assets/react-demo.mjs"),
  vue: () => import("./assets/adapters/vue.mjs"),
  svelte: () => import("./assets/adapters/svelte.mjs"),
  angular: () => import("./assets/adapters/angular.mjs"),
  "web-component": () => import("./assets/adapters/web-component.mjs"),
};
const adapterNames = { react: "React", vue: "Vue 3.5", svelte: "Svelte 5", angular: "Angular 21", "web-component": "Web Component" };
async function selectAdapter(name) {
  const version = ++demoVersion;
  const target = document.querySelector("#react-demo");
  const iconTarget = document.querySelector("#icon-demo");
  let stagedCleanup;
  target.setAttribute("aria-busy", "true");
  document.querySelector("#adapter-status").textContent = "Loading component…";
  try {
    const module = await adapterLoaders[name]();
    if (version !== demoVersion) return;
    demoCleanup?.(); demoCleanup = undefined;
    target.replaceChildren();
    iconTarget.replaceChildren();
    const stop = await module.mountDemo(target, { text: "Lumenmorph", width: 640, height: 130, fontSize: 88, strokeWidth: 1.5, textProps: { fontFamily: "inherit", letterSpacing: -2 } });
    stagedCleanup = stop;
    if (version !== demoVersion) { stop(); return; }
    const stopIcon = await module.mountIconDemo(iconTarget, { paths: "M18 12Q14 10 14 15v34q0 5 4 3l36-19q4-2 0-4Z", viewBox: "0 0 64 64", width: 112, height: 112, strokeWidth: 1, label: "Play" });
    const combined = () => { stop(); stopIcon(); };
    if (version !== demoVersion) { combined(); return; }
    demoCleanup = combined;
    target.dataset.framework = name;
    document.querySelector("#adapter-status").textContent = "Two SVG masks. Shared page light.";
  } catch {
    stagedCleanup?.();
    if (version === demoVersion) document.querySelector("#adapter-status").textContent = `Couldn't load ${adapterNames[name]}. Try another adapter or reload.`;
  } finally {
    if (version === demoVersion) target.setAttribute("aria-busy", "false");
  }
}
const ranges = [...form.querySelectorAll('input[type="range"]')];
const rangeCleanup = ranges.flatMap(input => {
  return [enhanceSlideboxRange(input), enhanceSlideboxRangeFill(input)];
});

function variables() {
  const values = {};
  for (const input of form.querySelectorAll("input[name]")) {
    if (input.name.startsWith("bg-")) continue;
    values[input.name] = input.value + (input.dataset.unit ?? "");
  }
  const color = form.elements.namedItem("bg-color").value;
  const alpha = Math.round(Number(form.elements.namedItem("bg-opacity").value) * 255).toString(16).padStart(2, "0");
  values.bg = color + alpha;
  return values;
}

function render() {
  const values = variables();
  for (const [name, value] of Object.entries(values)) root.style.setProperty(`--lumen-${name}`, value);
  for (const input of ranges) {
    document.querySelector(`#${input.id}-value`).value = input.value + (input.dataset.unit ?? "");
    input.dispatchEvent(new Event("input")); // Update Slidebox's optional fill after preset changes.
  }
  foundationBlocks = foundationSnippets(format, values, { tracking: tracking.checked, smoothing: smoothing.checked });
  renderBlocks(document.querySelector("#installation-snippet"), installationSnippets(format, { smoothing: smoothing.checked }));
  document.querySelector("#installation-hint").textContent = format === "cdn"
    ? "Plain HTML, no build step. Add these minified stylesheets to <head>, then link your styles.css after them. CDN URLs are pinned to 0.1.3."
    : "Install the package, then use the styles and HTML below. Package imports need a bundler such as Vite; choose CDN for plain HTML without a build step. Frameworks are optional.";
  componentBlocks = componentSnippets(framework);
  renderBlocks(snippet, foundationBlocks);
  renderBlocks(document.querySelector("#component-snippet"), componentBlocks);
}

function renderBlocks(target, blocks) {
  target.replaceChildren(...blocks.map(block => {
    const section = document.createElement("div");
    const label = document.createElement("p"); label.className = "code-label"; label.textContent = block.title;
    const pre = document.createElement("pre");
    const code = document.createElement("code"); code.dataset.language = block.language; code.textContent = block.code;
    applyHighlight(code);
    const frame = document.createElement("div"); frame.className = "code-frame";
    const copy = document.createElement("button"); copy.type = "button"; copy.className = "lumenmorph lumenmorph-border copy-code";
    copy.setAttribute("aria-label", `Copy ${block.title}`); copy.title = `Copy ${block.title}`;
    const icon = document.createElement("i"); icon.className = "fa-regular fa-copy"; icon.setAttribute("aria-hidden", "true");
    const fallback = document.createElement("span"); fallback.className = "copy-fallback"; fallback.textContent = "Copy";
    copy.append(icon, fallback);
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(block.code);
        icon.className = "fa-solid fa-check"; fallback.textContent = "Copied"; copy.title = "Copied";
        document.querySelector("#copy-status").textContent = `${block.title} copied.`;
        window.setTimeout(() => { icon.className = "fa-regular fa-copy"; fallback.textContent = "Copy"; copy.title = `Copy ${block.title}`; }, 1400);
      } catch { document.querySelector("#copy-status").textContent = "Clipboard unavailable. Select and copy the code in this block."; }
    });
    pre.append(code); frame.append(pre, copy); section.append(label, frame); return section;
  }));
}

function applyHighlight(code) {
  if (!colorCode) return;
  code.innerHTML = colorCode(code.textContent, code.dataset.language);
  code.classList.add("hljs");
}

const codeObserver = new IntersectionObserver(async entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  codeObserver.disconnect();
  try {
    colorCode = (await import("./assets/highlight.mjs")).highlight;
    for (const code of document.querySelectorAll(".code-blocks code")) applyHighlight(code);
  } catch { /* Plain text remains readable when the optional highlighter cannot load. */ }
}, { rootMargin: "200px" });
codeObserver.observe(document.querySelector("#code"));

function syncTracking() {
  cleanup?.();
  root.dataset.tracking = tracking.checked ? "on" : "off";
  // Hosted labs reuse the site's --mouse-x/y; never install a second page listener.
  cleanup = tracking.checked && !hosted ? trackPointer(root) : undefined;
}
function preset(name) {
  for (const [key, value] of Object.entries(presets[name])) form.elements.namedItem(key).value = value;
  root.dataset.theme = name;
  root.style.setProperty("--lm-accent", name === "ember" ? "#ffaa71" : name === "daylight" ? "#65d9ff" : "#25ded6");
  root.style.setProperty("--lumen-text-color", name === "daylight" ? "#153145b3" : "#ffffffb3");
  for (const button of document.querySelectorAll("[data-preset]")) button.setAttribute("aria-pressed", String(button.dataset.preset === name));
  render();
}
form.addEventListener("input", event => {
  if (event.target === tracking) syncTracking();
  else if (event.target === smoothing) root.classList.toggle("lumenmorph-motion", smoothing.checked);
  else for (const button of document.querySelectorAll("[data-preset]")) button.setAttribute("aria-pressed", "false");
  render();
});
form.addEventListener("submit", event => event.preventDefault());
for (const button of document.querySelectorAll("[data-preset]")) button.addEventListener("click", () => preset(button.dataset.preset));
for (const button of document.querySelectorAll("[data-format]")) button.addEventListener("click", () => {
  format = button.dataset.format;
  for (const other of document.querySelectorAll("[data-format]")) other.setAttribute("aria-pressed", String(other === button));
  render();
});
for (const button of document.querySelectorAll("[data-framework]")) button.addEventListener("click", () => {
  framework = button.dataset.framework;
  for (const other of document.querySelectorAll("[data-framework]")) other.setAttribute("aria-pressed", String(other === button));
  render();
  selectAdapter(framework);
});
document.querySelector("#reset").addEventListener("click", () => {
  tracking.checked = true;
  smoothing.checked = true;
  root.classList.add("lumenmorph-motion");
  syncTracking();
  preset("ember");
});
document.querySelector("#sample-button").addEventListener("click", event => { event.currentTarget.querySelector("span:last-child").textContent = "Native click received ✓"; });
syncTracking();
preset("ember");
selectAdapter("react");
window.addEventListener("pagehide", event => {
  if (event.persisted) return; // The back/forward cache freezes and resumes these instances.
  demoVersion++; demoCleanup?.(); cleanup?.(); for (const stop of rangeCleanup) stop();
});
