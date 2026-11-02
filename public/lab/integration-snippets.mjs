const block = (title, language, code) => ({ title, language, code });
export const integrations = {
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
