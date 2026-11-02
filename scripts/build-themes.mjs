import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const root = new URL("../", import.meta.url);
const core = postcss.parse(await readFile(new URL("src/lumenmorph.css", root), "utf8"));
const themes = {
  mui: {
    selector: ".lumenmorph-mui",
    bg: "var(--mui-palette-background-paper, #302028)",
    glow: "var(--mui-palette-primary-main, #ffaa71)",
    border: "var(--mui-palette-divider, #ffffff30)",
    radius: "var(--mui-shape-borderRadius, 4px)",
  },
  mantine: {
    selector: ".lumenmorph-mantine",
    bg: "var(--mantine-color-body, #302028)",
    glow: "var(--mantine-primary-color-filled, #ffaa71)",
    border: "var(--mantine-color-default-border, #ffffff30)",
    radius: "var(--button-radius, var(--paper-radius, var(--mantine-radius-default, 4px)))",
    borderSelector: ".lumenmorph-mantine-border",
  },
  "taiga-ui": {
    selector: '[tuiAppearance][data-appearance="lumenmorph"]',
    bg: "var(--tui-background-base, #302028)",
    glow: "var(--tui-background-accent-1, #ffaa71)",
    border: "var(--tui-border-normal, #ffffff30)",
    radius: "var(--tui-radius-m, 4px)",
  },
};
for (const [name, theme] of Object.entries(themes)) {
  // Two classes beat ordinary library root styles without !important or touching focus/disabled state.
  const surface = name === "taiga-ui" ? theme.selector : theme.selector.repeat(2);
  const border = theme.borderSelector?.repeat(2) ?? surface;
  const output = core.clone();
  output.walkComments(node => node.remove());
  output.walkRules(rule => {
    const selectors = rule.selectors.flatMap(selector => {
      if (selector === ".lumenmorph") return [surface];
      if (selector.startsWith(".lumenmorph-border")) return [selector.replace(".lumenmorph-border", border)];
      return [];
    });
    if (selectors.length) rule.selectors = selectors;
    else rule.remove();
  });
  // Remove empty text-only support blocks, preserving accessibility overrides.
  output.walkAtRules(node => { if (node.nodes?.length === 0) node.remove(); });
  const tokens = `@layer components {
  ${theme.selector} {
    --lumen-bg: color-mix(in srgb, ${theme.bg} 75%, transparent);
    --lumen-solid-bg: ${theme.bg};
    --lumen-glow-color: ${theme.glow};
    --lumen-border-color: ${theme.border};
    --lumen-border-width: 1px;
    --lumen-radius: ${theme.radius};
  }
}`;
  await writeFile(new URL(`dist/css/${name}.css`, root), `/* Generated from src/lumenmorph.css. Opt-in ${name} material; import after the library styles. */\n${tokens}\n${output}\n`);
}
console.log("Built MUI, Mantine, and Taiga UI CSS themes.");
