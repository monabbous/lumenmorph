import { trackPointer } from "./assets/pointer.mjs";
import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from "./assets/slidebox-range.mjs";

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
let cleanup;
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
  const declarations = Object.entries(values).map(([name, value]) => `  --lumen-${name}: ${value};`).join("\n");
  const js = tracking.checked ? '\n\n// Optional pointer light. Call stop() on unmount.\nimport { trackPointer } from "@monabbous/lumenmorph";\nconst stop = trackPointer();' : "";
  const html = '<article class="lumenmorph lumenmorph-border card">Your content</article>';
  const snippets = {
    css: `/* Import once in your CSS entry point. */\n@import "@monabbous/lumenmorph/css";\n\n.card {\n${declarations}\n}\n\n/* HTML */\n${html}${js}`,
    scss: `@use "@monabbous/lumenmorph/scss/mixins" as lumen;\n\n.card {\n  @include lumen.lumenmorph((\n${Object.entries(values).map(([key, value]) => `    ${key}: ${value}`).join(",\n")}\n  ));\n  @include lumen.border();\n}\n\n/* HTML: <article class="card">Your content</article> */${js}`,
    less: `@import "@monabbous/lumenmorph/less";\n\n.card {\n  .lumenmorph(\n${Object.entries(values).map(([key, value]) => `    @${key}: ${value}`).join(";\n")}\n  );\n  .lumenmorph-border();\n}\n\n/* HTML: <article class="card">Your content</article> */${js}`,
    tailwind: `/* Tailwind v4 stylesheet; v3: add the plugin in tailwind.config.cjs. */\n@import "tailwindcss";\n@plugin "@monabbous/lumenmorph/tailwind";\n\n/* HTML */\n<article class="lumenmorph lumenmorph-border\n${Object.entries(values).map(([key, value]) => `  [--lumen-${key}:${value}]`).join("\n")}\n">Your content</article>${js}`,
    react: `"use client";\nimport { useEffect } from "react";\nimport { LumenText } from "@monabbous/lumenmorph/react";\nimport { trackPointer } from "@monabbous/lumenmorph";\nimport "@monabbous/lumenmorph/css";\n\nexport function Preview() {\n${tracking.checked ? "  useEffect(() => trackPointer(), []);" : "  // Static light: no pointer listener."}\n  return <div style={${JSON.stringify(Object.fromEntries(Object.entries(values).map(([k, v]) => [`--lumen-${k}`, v])), null, 4).replaceAll("\n", "\n  ")}}>\n    <LumenText width={640} height={120} fontSize={80}>\n      Lumenmorph\n    </LumenText>\n  </div>;\n}`,
  };
  if (smoothing.checked) {
    const imports = {
      css: '@import "@monabbous/lumenmorph/motion";',
      scss: '@use "@monabbous/lumenmorph/scss/motion";',
      less: '@import "@monabbous/lumenmorph/less/motion";',
      tailwind: '@import "@monabbous/lumenmorph/motion";',
      react: 'import "@monabbous/lumenmorph/motion";',
    };
    const note = format === "react"
      ? '// Add className="lumenmorph-motion" to <html> in your app layout.\n'
      : '/* Add class="lumenmorph-motion" to <html>. Only that element transitions. */\n';
    // Keep the React client directive before imports.
    snippets[format] = format === "react"
      ? snippets[format].replace('"use client";\n', `"use client";\n${imports.react}\n${note}`)
      : `${imports[format]}\n${note}\n${snippets[format]}`;
  }
  snippet.textContent = snippets[format];
}

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
document.querySelector("#reset").addEventListener("click", () => {
  tracking.checked = true;
  smoothing.checked = true;
  root.classList.add("lumenmorph-motion");
  syncTracking();
  preset("ember");
});
document.querySelector("#copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(snippet.textContent); document.querySelector("#copy-status").textContent = "Copied."; }
  catch { document.querySelector("#copy-status").textContent = "Clipboard unavailable. Select and copy the code above."; }
});
document.querySelector("#sample-button").addEventListener("click", event => { event.currentTarget.querySelector("span:last-child").textContent = "Native click received ✓"; });
syncTracking();
preset("ember");
window.addEventListener("pagehide", () => { cleanup?.(); for (const stop of rangeCleanup) stop(); }, { once: true });
