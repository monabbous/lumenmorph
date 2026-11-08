import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const root = new URL("../", import.meta.url);
const core = postcss.parse(await readFile(new URL("src/lumenmorph.css", root), "utf8"));
const scope = name => `:is(.${name}.lumenmorph-slidebox, .lumenmorph-slidebox .${name})`;
const toggle = scope("slidebox");
const group = scope("slidebox-group");
const range = scope("slidebox-range");
const visual = `:is(.lumenmorph-slidebox [data-slidebox-range-visual], .slidebox-range.lumenmorph-slidebox + [data-slidebox-range-visual])`;
const tracks = `${toggle}, ${range}`;
const border = "var(--lumen-border-color, #ffffff30)";
const groupAccent = "var(--lumen-glow-color, var(--slidebox-on, #ffaa71))";
// A persistent accent base keeps small controls legible outside the light.
// Mix into the inherited card material, retaining its translucency and blur.
const controlBase = `color-mix(in srgb, ${groupAccent} var(--lumen-slidebox-tint, 18%), var(--lumen-bg, #29282366))`;
const thumb = `var(--lumen-slidebox-thumb-bg, ${controlBase})`;
const offFill = "var(--lumen-slidebox-thumb-bg, var(--lumen-bg, #29282366))";
const shadow = color => `inset 0 0 0 1px color-mix(in srgb, ${color} 55%, transparent), 0 0 16px color-mix(in srgb, ${color} 12%, transparent)`;

function paint(selector, { thumbs = false, gradient = true, gradientOnly = false, material = {} } = {}) {
  const output = core.clone();
  output.walkComments(node => node.remove());
  output.walkRules(rule => {
    const selectors = rule.selectors.flatMap(value => {
      if (value === ".lumenmorph") return [selector];
      return [];
    });
    if (selectors.length) rule.selectors = selectors;
    else rule.remove();
  });
  output.walkAtRules(node => {
    if (node.name === "media" && node.params === "(forced-colors: active)") node.remove();
  });
  output.walkDecls(declaration => {
    // Filled ranges keep Slidebox's progress images, including when the user
    // requests an opaque track. Only unfilled ranges own a pointer gradient.
    if (!gradient && declaration.prop === "background") declaration.prop = "background-color";
    declaration.value = declaration.value
      .replaceAll("var(--lumen-bg, #302028b3)", material.bg ?? (thumbs ? thumb : "var(--lumen-bg, #302028b3)"))
      .replaceAll("var(--lumen-solid-bg, #302028)", material.solid ?? "var(--lumen-solid-bg, #302028)")
      .replaceAll("var(--lumen-blur, 32px)", `var(--lumen-blur, ${material.blur ?? "32px"})`)
      .replaceAll("var(--lumen-saturation, 1.6)", `var(--lumen-saturation, ${material.saturation ?? "1.6"})`)
      .replaceAll("var(--lumen-radius, 0.25rem)", material.radius ?? (thumbs ? "inherit" : "var(--slidebox-radius, 100vw)"))
      .replaceAll("var(--lumen-glow-size, 460px)", `var(--lumen-glow-size, ${material.size ?? "460px"})`)
      .replaceAll("var(--lumen-glow-color, #ffaa71)", material.glow ?? "var(--lumen-glow-color, #ffaa71)")
      .replaceAll("var(--lumen-glow-opacity, 0.3)", material.opacityValue ?? `var(--lumen-glow-opacity, ${material.opacity ?? "0.3"})`);
    if (!gradient && ["background-image", "background-attachment", "background-size", "background-repeat"].includes(declaration.prop)) declaration.remove();
    if (gradientOnly && !["background-image", "background-attachment", "background-size", "background-repeat"].includes(declaration.prop)) declaration.remove();
  });
  output.walkRules(rule => { if (rule.nodes.length === 0) rule.remove(); });
  // Remove support blocks emptied by filtering out the HTML text treatment.
  for (let i = 0; i < 3; i++) output.walkAtRules(node => { if (node.nodes?.length === 0) node.remove(); });
  return output.toString();
}

// Use the core border recipe, including its mask and pointer-light paint.
// Native checkbox paint layers already own their geometry; the real range
// thumb uses the ordinary positioned ::before border without adaptation.
function borderPaint(base, ring, { nativeLayer = false } = {}) {
  const output = core.clone();
  output.walkComments(node => node.remove());
  output.walkRules(rule => {
    const selectors = rule.selectors.flatMap(selector => selector === ".lumenmorph-border" ? [base] : selector === ".lumenmorph-border::before" && ring ? [ring] : []);
    if (selectors.length) rule.selectors = selectors; else rule.remove();
    if (nativeLayer && selectors.includes(ring)) {
      rule.walkDecls(declaration => { if (["position", "inset"].includes(declaration.prop)) declaration.remove(); });
      if (rule.nodes.some(node => node.prop === "mask")) {
        rule.append({prop:"border",value:"0"});
        rule.append({prop:"background-color",value:"transparent"});
      }
    }
  });
  output.walkAtRules(node => { if (node.name === "media" && node.params === "(forced-colors: active)") node.remove(); });
  for (let i = 0; i < 3; i++) output.walkAtRules(node => { if (node.nodes?.length === 0) node.remove(); });
  return output.toString();
}

const plainThumb = `${toggle}:not([data-slidebox-thumb-layers])::after`;
const thumbFill = `${toggle}[data-slidebox-thumb-layers]::before`;
const thumbRing = `${toggle}[data-slidebox-thumb-layers]::after`;
const rangeThumb = `${visual} > [data-slidebox-range-thumb]`;
const rangeFill = `${range}[data-slidebox-range-layers][data-slidebox-range-fill] + [data-slidebox-range-visual]::before`;
const selected = `${plainThumb}, ${thumbFill}, ${rangeThumb}`;
const uncheckedFill = `${toggle}:not(:checked):not([data-slidebox-thumb-layers])::after, ${toggle}:not(:checked)[data-slidebox-thumb-layers]::before`;
const selectionShadow = shadow(groupAccent);
const groupSelected = `${group}:has(> label > input:checked)::before, ${group} > label > input:checked + span::before`;
const groupIdle = `${group} > label > input:not(:checked) + span`;
const groupRadius = "var(--lumen-radius, var(--slidebox-radius, 4px))";
const groupMaterial = {
  bg: `var(--lumen-bg, color-mix(in srgb, ${groupAccent} 18%, #29282366))`,
  solid: "var(--lumen-solid-bg, #34332e)", glow: groupAccent,
  opacity: ".55", size: "180px", radius: groupRadius, blur: "12px", saturation: "1.4",
};
const groupIdleMaterial = {
  bg: `var(--lumen-bg, color-mix(in srgb, ${groupAccent} 2.5%, transparent))`,
  solid: "var(--lumen-solid-bg, #292823)", glow: groupAccent,
  opacity: ".045", size: "160px", radius: groupRadius, blur: "2px", saturation: "1.1",
};
// Keep engine-specific range pseudo-elements in separate rules. A browser
// must not discard its supported thumb because another selector is unknown.
const css = `/* Generated from src/lumenmorph.css. Native control parts reuse card
   surfaces and illuminated borders; Slidebox owns all geometry and motion.
   Import after Slidebox. Opt in with lumenmorph-slidebox on a control or ancestor.
   Slidebox owns geometry, native state, and motion; this file owns paint only. */
@media (forced-colors: none) {
  ${tracks} {
    border-color: ${border};
    box-shadow: none;
  }
  ${paint(toggle)}
  ${paint(range, { gradient: false })}
  ${paint(`${range}:not([data-slidebox-range-fill])`, { gradientOnly: true })}
  @supports (background: color-mix(in srgb, red, transparent)) {
    ${tracks} { background-color: var(--lumen-bg, #302028b3); }
  }
  ${paint(selected, { thumbs: true })}
  /* Off-state paint uses its own fill color, not the checked accent. */
  ${paint(uncheckedFill, { thumbs: true, material: { bg: offFill, glow: offFill, opacityValue: "calc(var(--lumen-glow-opacity, 0.3) * .35)" } })}
  ${paint(`${toggle}:not(:checked)`, { gradientOnly: true, material: { glow: "var(--lumen-bg, #302028b3)", opacityValue: "calc(var(--lumen-glow-opacity, 0.3) * .35)" } })}
  ${paint(rangeFill, { material: { bg: controlBase, radius: "inherit" } })}
  ${borderPaint(plainThumb)}
  ${borderPaint(thumbFill, thumbRing, { nativeLayer: true })}
  ${borderPaint(rangeThumb, `${rangeThumb}::before`)}
  ${selected} { box-shadow: ${selectionShadow}; }
  ${uncheckedFill} { box-shadow: ${shadow(offFill)}; }
  /* Match Lumenmorph's material-picker groups, not opaque on-color pills. */
  ${group} {
    background-color: var(--lumen-bg, var(--slidebox-track, #34332e40));
    border-color: var(--lumen-border-color, var(--slidebox-border, #827b6c));
    border-radius: ${groupRadius};
  }
  ${group} > label > span { border-radius: ${groupRadius}; }
  ${paint(groupSelected, { material: groupMaterial })}
  ${groupSelected} {
    box-shadow: ${selectionShadow};
  }
  ${paint(groupIdle, { material: groupIdleMaterial })}
  ${groupIdle} { box-shadow: inset 0 0 0 1px color-mix(in srgb, ${groupAccent} 7%, transparent); }
  ${paint(`${range}:not([data-slidebox-range-layers])::-webkit-slider-thumb`, { thumbs: true })}
  ${paint(`${range}:not([data-slidebox-range-layers])::-moz-range-thumb`, { thumbs: true })}
  ${range}:not([data-slidebox-range-layers])::-webkit-slider-thumb { box-shadow: ${selectionShadow}; }
  ${range}:not([data-slidebox-range-layers])::-moz-range-thumb { box-shadow: ${selectionShadow}; }
  ${range}[data-slidebox-range-dragging]::-webkit-slider-thumb {
    background: transparent; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none;
  }
  ${range}[data-slidebox-range-dragging]::-moz-range-thumb {
    background: transparent; box-shadow: none; backdrop-filter: none;
  }
  @media (prefers-reduced-transparency: reduce) {
    ${toggle}, ${range}:not([data-slidebox-range-fill]) { background: var(--lumen-solid-bg, #302028); }
    ${group} { background: var(--lumen-solid-bg, #1c3540); }
    ${range}[data-slidebox-range-fill] { background-color: var(--lumen-solid-bg, #302028); }
  }
}
`;
await mkdir(new URL("skins/", root), { recursive: true });
await writeFile(new URL("skins/slidebox.css", root), css);
// Retain the original physical file for existing self-hosted/CDN URLs.
await writeFile(new URL("dist/css/slidebox.css", root), css);
await mkdir(new URL("public/lab/skins/", root), { recursive: true });
await copyFile(new URL("skins/slidebox.css", root), new URL("public/lab/skins/slidebox.css", root));
// Compatibility for previously hosted lab pages; current pages use skins/.
await copyFile(new URL("skins/slidebox.css", root), new URL("public/lab/assets/lumenmorph-slidebox.css", root));
console.log("Built the optional Slidebox lab skin.");
