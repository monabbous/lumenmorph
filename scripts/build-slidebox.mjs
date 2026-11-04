import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const root = new URL("../", import.meta.url);
const core = postcss.parse(await readFile(new URL("src/lumenmorph.css", root), "utf8"));
const scope = name => `:is(.${name}.lumenmorph-slidebox, .lumenmorph-slidebox .${name})`;
const toggle = scope("slidebox");
const group = scope("slidebox-group");
const range = scope("slidebox-range");
const visual = `:is(.lumenmorph-slidebox [data-slidebox-range-visual], .slidebox-range.lumenmorph-slidebox + [data-slidebox-range-visual])`;
const tracks = `${toggle}, ${range}`;
const on = "var(--slidebox-on, var(--_lumen-slidebox-accent, light-dark(#0b75ff, SelectedItem)))";
const thumb = `var(--lumen-slidebox-thumb-bg, var(--_lumen-slidebox-thumb, ${on}))`;
const border = "var(--lumen-border-color, color-mix(in srgb, var(--slidebox-border, ButtonBorder) 25%, transparent))";
const groupAccent = "var(--lumen-glow-color, var(--slidebox-on, #ffaa71))";

function paint(selector, { thumbs = false, border: illuminated = false, gradient = true, gradientOnly = false, material = {} } = {}) {
  const output = core.clone();
  output.walkComments(node => node.remove());
  output.walkRules(rule => {
    const selectors = rule.selectors.flatMap(value => {
      if (value === ".lumenmorph") return [selector];
      if (illuminated && value.startsWith(".lumenmorph-border")) return [value.replace(".lumenmorph-border", toggle)];
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
      .replaceAll("var(--lumen-bg, #302028b3)", material.bg ?? (thumbs ? thumb : "var(--lumen-bg, var(--slidebox-track, Field))"))
      .replaceAll("var(--lumen-solid-bg, #302028)", material.solid ?? (thumbs ? thumb : "var(--lumen-solid-bg, var(--slidebox-track, Field))"))
      .replaceAll("var(--lumen-blur, 32px)", `var(--lumen-blur, ${material.blur ?? "40px"})`)
      .replaceAll("var(--lumen-saturation, 1.6)", `var(--lumen-saturation, ${material.saturation ?? "1"})`)
      .replaceAll("var(--lumen-radius, 0.25rem)", material.radius ?? (thumbs ? "inherit" : "var(--lumen-radius, var(--slidebox-radius, 100vw))"))
      .replaceAll("var(--lumen-glow-size, 460px)", `var(--lumen-glow-size, ${material.size ?? "30vmax"})`)
      .replaceAll("var(--lumen-glow-color, #ffaa71)", material.glow ?? `var(--lumen-glow-color, ${on})`)
      .replaceAll("var(--lumen-glow-opacity, 0.3)", `var(--lumen-glow-opacity, ${material.opacity ?? "0.1"})`)
      .replaceAll("var(--lumen-border-width, 1.5px)", "var(--lumen-border-width, 1px)")
      .replaceAll("var(--lumen-border-color, #ffffff30)", border)
      .replaceAll("var(--lumen-glow-color, #ffd4a3)", `var(--lumen-glow-color, ${on})`)
      .replaceAll("var(--lumen-border-opacity, 0.9)", "var(--lumen-border-opacity, 0.3)");
    if (!gradient && ["background-image", "background-attachment", "background-size", "background-repeat"].includes(declaration.prop)) declaration.remove();
    if (gradientOnly && !["background-image", "background-attachment", "background-size", "background-repeat"].includes(declaration.prop)) declaration.remove();
  });
  output.walkRules(rule => { if (rule.nodes.length === 0) rule.remove(); });
  // Remove support blocks emptied by filtering out the HTML text treatment.
  for (let i = 0; i < 3; i++) output.walkAtRules(node => { if (node.nodes?.length === 0) node.remove(); });
  return output.toString();
}

const selected = `${toggle}::after, ${visual} > span`;
const groupSelected = `${group}:has(> label > input:checked)::before, ${group} > label > input:checked + span::before`;
const groupIdle = `${group} > label > input:not(:checked) + span`;
const groupRadius = "var(--lumen-radius, var(--slidebox-radius, 4px))";
const groupMaterial = {
  bg: `var(--lumen-bg, color-mix(in srgb, ${groupAccent} 18%, #102a3166))`,
  solid: "var(--lumen-solid-bg, #203c46)", glow: groupAccent,
  opacity: ".55", size: "180px", radius: groupRadius, blur: "12px", saturation: "1.4",
};
const groupIdleMaterial = {
  bg: `var(--lumen-bg, color-mix(in srgb, ${groupAccent} 2.5%, transparent))`,
  solid: "var(--lumen-solid-bg, #1c3540)", glow: groupAccent,
  opacity: ".045", size: "160px", radius: groupRadius, blur: "2px", saturation: "1.1",
};
// Keep engine-specific range pseudo-elements in separate rules. A browser
// must not discard its supported thumb because another selector is unknown.
const css = `/* Generated from src/lumenmorph.css and the existing lab skins.
   Import after Slidebox. Opt in with lumenmorph-slidebox on a control or ancestor.
   Slidebox owns geometry, native state, and motion; this file owns paint only. */
@media (forced-colors: none) {
  ${tracks} {
    border-color: ${border};
    box-shadow: none;
  }
  ${toggle} { --_lumen-slidebox-thumb: var(--slidebox-off, FieldText); isolation: isolate; }
  ${toggle}:checked { --_lumen-slidebox-thumb: ${on}; }
  ${toggle}::after { position: relative; z-index: 3; }
  @supports (color: AccentColor) {
    .lumenmorph-slidebox { --_lumen-slidebox-accent: AccentColor; }
  }
  ${paint(toggle, { border: true })}
  ${paint(range, { gradient: false })}
  ${paint(`${range}:not([data-slidebox-range-fill])`, { gradientOnly: true })}
  @supports (background: color-mix(in srgb, red, transparent)) {
    ${tracks} { background-color: var(--lumen-bg, color-mix(in srgb, var(--slidebox-track, Field) 40%, transparent)); }
  }
  ${paint(selected, { thumbs: true })}
  /* Match Lumenmorph's material-picker groups, not opaque on-color pills. */
  ${group} {
    background-color: var(--lumen-bg, var(--slidebox-track, #063c5940));
    border-color: var(--lumen-border-color, var(--slidebox-border, #5289a6));
    border-radius: ${groupRadius};
  }
  ${group} > label > span { border-radius: ${groupRadius}; }
  ${paint(groupSelected, { material: groupMaterial })}
  ${groupSelected} {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, ${groupAccent} 55%, transparent), 0 0 16px color-mix(in srgb, ${groupAccent} 12%, transparent);
  }
  ${paint(groupIdle, { material: groupIdleMaterial })}
  ${groupIdle} { box-shadow: inset 0 0 0 1px color-mix(in srgb, ${groupAccent} 7%, transparent); }
  ${paint(`${range}::-webkit-slider-thumb`, { thumbs: true })}
  ${paint(`${range}::-moz-range-thumb`, { thumbs: true })}
  ${range}[data-slidebox-range-dragging]::-webkit-slider-thumb {
    background: transparent; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none;
  }
  ${range}[data-slidebox-range-dragging]::-moz-range-thumb {
    background: transparent; box-shadow: none; backdrop-filter: none;
  }
  @media (prefers-reduced-transparency: reduce) {
    ${toggle}, ${range}:not([data-slidebox-range-fill]) { background: var(--lumen-solid-bg, var(--slidebox-track, Field)); }
    ${group} { background: var(--lumen-solid-bg, #1c3540); }
    ${range}[data-slidebox-range-fill] { background-color: var(--lumen-solid-bg, var(--slidebox-track, Field)); }
  }
}
`;
await writeFile(new URL("dist/css/slidebox.css", root), css);
await writeFile(new URL("public/lab/assets/lumenmorph-slidebox.css", root), css);
console.log("Built the optional Slidebox lab skin.");
