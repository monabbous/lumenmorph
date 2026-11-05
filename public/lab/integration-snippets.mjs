const block = (title, language, code) => ({ title, language, code });
export const integrations = {
  slidebox: {
    name: "Slidebox", guide: "slidebox.md",
    description: "Thumbs and range fill use the card material, with real illuminated thumb borders. Checkboxes use two pseudo-elements on one input; ranges opt into Slidebox's existing two-span helper. Groups keep this lab's translucent material. Requires Slidebox 1.4.1 or later. The namespaced skin import is new in the next Lumenmorph release; with published 0.3.1, use @monabbous/lumenmorph/slidebox instead.",
    blocks: [
      block("Terminal — install both packages", "bash", "npm install @monabbous/lumenmorph@^0.3.0 @monabbous/slidebox@^1.4.1"),
      block("main.js — import base styles before the skin", "javascript", `import "@monabbous/slidebox/dist/css/slidebox.css";
import "@monabbous/slidebox/dist/css/group.css";
// Optional, experimental range styles:
// import "@monabbous/slidebox/experimental/range.css";
import "@monabbous/lumenmorph/skins/slidebox";`),
      block("HTML — native controls in an opt-in scope", "xml", `<section class="settings lumenmorph-slidebox" aria-label="Settings">
  <label>
    <input class="slidebox" data-slidebox-thumb-layers type="checkbox" name="notifications">
    Enable notifications
  </label>
  <div class="slidebox-group" role="group" aria-label="Period">
    <label><input type="radio" name="period" value="day" checked><span>Day</span></label>
    <label><input type="radio" name="period" value="week"><span>Week</span></label>
    <label><input type="radio" name="period" value="month"><span>Month</span></label>
  </div>
</section>`),
      block("styles.css — palette and native size; paint comes from the export", "css", `.settings {
  color: #e8f6fa;
  background: #152530;
  padding: 1rem;
  --slidebox-track: #2a5b7c;
  --slidebox-border: #5289a6;
  --slidebox-off: #e8f6fa;
  --slidebox-on: #ffaa71;
  --slidebox-text: #e8f6fa;
  --slidebox-selected-text: #f5fbff;
  --slidebox-size: 28px;
}
.settings .slidebox-group {
  --slidebox-track: #063c5940;
  --slidebox-border: #5289a6;
  --slidebox-size: 40px;
  --slidebox-spacing: .1;
  --slidebox-radius: 4px;
}`),
      block("Optional experimental range — inside .settings; enable its styles above", "xml", `<label for="intensity">Intensity</label>
<input id="intensity" class="slidebox-range" type="range"
  name="intensity" min="0" max="100" value="40">`),
      block("Optional range layers — after mounting; same geometry and motion helper", "javascript", `import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from "@monabbous/slidebox/experimental/range.mjs";

const input = document.querySelector("#intensity");
const stopRange = enhanceSlideboxRange(input, { layers: true });
const stopFill = enhanceSlideboxRangeFill(input);

// Call these on unmount; no idle animation loop is started.
window.addEventListener("pagehide", () => { stopRange(); stopFill(); });`),
    ],
  },
  shadcn: {
    name: "shadcn/ui", guide: "shadcn.md",
    description: "Add glass versions of your existing Card and Button. They inherit your theme and radius; pointer light is optional.",
    blocks: [
      block("Terminal — inside a configured shadcn project", "bash", "npx shadcn@latest add https://nabous.dev/lab/lumenmorph/r/lumen-card.json https://nabous.dev/lab/lumenmorph/r/lumen-button.json"),
      block("Your component", "tsx", `import { LumenCard } from "@/components/ui/lumen-card";
import { LumenButton } from "@/components/ui/lumen-button";
import { CardContent } from "@/components/ui/card";

export function Preview() {
  return (
    <LumenCard tone="lagoon" className="lumen-glow-opacity-20">
      <CardContent>
        <p>Your content, your theme.</p>
        <LumenButton tone="ember">Explore</LumenButton>
      </CardContent>
    </LumenCard>
  );
}`),
    ],
  },
  mui: {
    name: "MUI", guide: "ui-libraries.md#mui",
    description: "Opt in through classes or theme defaults. Enable MUI CSS variables so the glass follows your palette.",
    blocks: [block("App.jsx — after installing Lumenmorph", "jsx", `import { createTheme, ThemeProvider, Paper, Button } from "@mui/material";
import "@monabbous/lumenmorph/mui/css";

const theme = createTheme({
  cssVariables: true,
  components: {
    MuiPaper: { defaultProps: { classes: { root: "lumenmorph-mui" }, elevation: 0 } },
    MuiButton: { defaultProps: { classes: { outlined: "lumenmorph-mui" } } },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Paper sx={{ p: 3 }}>
        <Button variant="outlined">Explore</Button>
      </Paper>
    </ThemeProvider>
  );
}`)],
  },
  mantine: {
    name: "Mantine", guide: "ui-libraries.md#mantine",
    description: "Use theme defaults for Paper and Button. Buttons keep their loading overlay; add the border only to surfaces with an unused ::before.",
    blocks: [block("App.jsx — after installing Lumenmorph", "jsx", `import { createTheme, MantineProvider, Paper, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import "@monabbous/lumenmorph/mantine/css";

const theme = createTheme({
  components: {
    Paper: Paper.extend({
      classNames: { root: "lumenmorph-mantine lumenmorph-mantine-border" },
    }),
    Button: Button.extend({
      defaultProps: { variant: "default" },
      classNames: { root: "lumenmorph-mantine" },
    }),
  },
});

export function App() {
  return (
    <MantineProvider theme={theme}>
      <Paper p="xl"><Button>Explore</Button></Paper>
    </MantineProvider>
  );
}`)],
  },
  taiga: {
    name: "Taiga UI v4+", guide: "ui-libraries.md#taiga-ui-v4-and-v5",
    description: "A CSS appearance for Taiga UI v4 and v5. It uses your Taiga theme tokens and is independent of the Angular SVG adapter.",
    blocks: [
      block("Global styles.css — after Taiga styles", "css", '@import "@monabbous/lumenmorph/taiga-ui/css";'),
      block("Your Angular template — with TuiButton and TuiAppearance imported", "xml", `<button tuiButton appearance="lumenmorph" type="button">Explore</button>
<section tuiAppearance="lumenmorph" style="padding: 2rem">
  Your content
</section>`),
    ],
  },
};
