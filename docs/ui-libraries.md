[← Documentation](README.md)

# UI library themes

Install `@monabbous/lumenmorph` in an existing project. Each optional stylesheet maps library theme variables to Lumenmorph controls and applies the canonical glass rules to opted-in components. There are no new runtime dependencies or providers.

Import the integration after your library's styles. It owns the background, blur, radius, and optional border. Keep your library's typography, spacing, focus, disabled state, and handlers. Choose outlined/default controls with readable foreground colors; filled buttons may assume an opaque background.

Requires Lumenmorph 0.2.0 or later.

## MUI

Enable `cssVariables: true` in `createTheme` (MUI v6+). Add `className="lumenmorph-mui"` to a Paper or outlined Button. For theme-wide defaults, use the recipe below. Existing component classes should be merged when updating an existing theme.

The bridge uses `--mui-palette-background-paper`, `--mui-palette-primary-main`, `--mui-palette-divider`, and `--mui-shape-borderRadius`. It reserves `::before` for the illuminated border. Elevation is still controlled by MUI.

```jsx
import { createTheme, ThemeProvider, Paper, Button } from "@mui/material";
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
}
```

## Mantine

Import Mantine styles first. Add `lumenmorph-mantine` to a component root; add `lumenmorph-mantine-border` only when its `::before` is free, such as Paper or Card. **Do not add the border class to Button**: Mantine uses that pseudo-element for loading.

The bridge uses body, primary-color-filled, default-border, and radius variables. Component Button/Paper radius takes precedence over the default radius. Use the default button variant for readable text. These APIs target Mantine v7+; check styles when adopting a future major.

```jsx
import { createTheme, MantineProvider, Paper, Button } from "@mantine/core";
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
}
```

## Taiga UI v4 and v5

Use the standard `appearance="lumenmorph"` input on `tuiButton`, or `tuiAppearance="lumenmorph"` on other elements. Import `TuiButton` and/or `TuiAppearance` from `@taiga-ui/core` in your standalone component as usual.

This uses the public `[tuiAppearance][data-appearance="lumenmorph"]` hook and the background-base, background-accent-1, border-normal, and radius-m tokens shared by v4 and v5. The bridge does not reference version-stamped selectors. Future versions can use it while retaining those hooks. It leaves Taiga's focus outline, disabled opacity, and interactions intact.

This is CSS-only: **do not import `@monabbous/lumenmorph/angular`** for the theme. That separate SVG adapter targets Angular 21; the Taiga appearance has no Angular-version dependency.

```css
@import "@monabbous/lumenmorph/taiga-ui/css";
```

```xml
<button tuiButton appearance="lumenmorph" type="button">Explore</button>
<section tuiAppearance="lumenmorph" style="padding: 2rem">
  Your content
</section>
```

## Customization and pointer light

Override `--lumen-*` controls on your chosen component or class. Theme mappings live in the `components` cascade layer, so app rules and Tailwind variable utilities can override them.

```css
.warm-action {
  --lumen-glow-color: #ffaa71;
  --lumen-border-glow-color: #ffd4a3;
  --lumen-radius: 4px;
}
```

For Tailwind v4 controls alongside a UI theme, import `@monabbous/lumenmorph/tailwind/utilities` after Tailwind. This emits variable utilities without duplicating core surface classes.

Static glass needs no JavaScript. To add tracking, initialize [one shared pointer helper](pointer.md) in your application's browser lifecycle and clean it up on unmount. Keep contrast, reduced transparency, forced colors, and your library's loading/disabled states in your verification.
