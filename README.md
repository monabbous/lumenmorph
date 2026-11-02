# Lumenmorph

Another open-source CSS experiment by [Mohamed Nabous](https://nabous.dev), alongside [Slidebox](https://github.com/monabbous/slidebox).

I enjoy making new things with small amounts of CSS and seeing how far the browser can take them. Lumenmorph pulls the glass effects out of nabous.dev so you can use them on your own elements. The aim is little markup and as little JavaScript as practical. CSS handles the material; JavaScript is optional for following a pointer, and the React SVG text has its own coordinate-mapping helper.

```html
<article class="lumenmorph lumenmorph-border">Your content</article>
```

Choose vanilla CSS, SCSS, Less, or Tailwind for frosted surfaces and illuminated borders. Static effects need one element and no JavaScript; adding the border uses one `::before`.

The optional pointer helper updates two inherited CSS variables at most once per animation frame and stops when idle. React is an optional peer dependency, used only by the `/react` entry point. [Read the project notes](https://nabous.dev/blog/lumenmorph/) or [try the lab](https://nabous.dev/lab/lumenmorph/) once the host registers this project.

## Try the lab

```sh
git clone https://github.com/monabbous/lumenmorph.git
cd lumenmorph
npm ci
npm run build
npm run dev
```

Open **http://127.0.0.1:4173/lab/**. Tune glow size and colors, surface/edge intensity, tint opacity, blur, saturation, radius, and border width. Ember is the default material; nabous.dev teal and Daylight are optional presets. The surrounding nabous.dev shell keeps its own blue/teal identity. Disable tracking or copy your configuration as CSS, SCSS, Less, Tailwind, or React code. All lab buttons use Lumenmorph. Toggles and experimental ranges use Slidebox; Slidebox isn't a dependency of the library itself.

The standalone lab lives in `public/lab/`. Build outputs are committed so that a static host, including a host that fetches repository files like nabous.dev, can serve that directory without running Node. The lab's React demo bundle is not part of the npm package. Publishing or deployment is separate from building.

### Embed in nabous.dev

Follow the host's `docs/runtime-content.md`. The project supplies content-only HTML, functional CSS, and relative assets. It doesn't import fonts, copy the site's header/footer, or install a second lighting listener. When the host injects `[data-nabous-shell]`, the lab inherits its fonts and palette and maps the site's `--mouse-x/y` to the preview's `--lumen-x/y`. The preview's tracking switch doesn't disable the host's own light.

Add this entry to your existing `NABOUS_PROJECTS` array on the host (preserve other projects):

```json
{"slug":"lumenmorph","repository":"monabbous/lumenmorph","ref":"main"}
```

For local development, use `{"slug":"lumenmorph","path":"/absolute/path/to/lumenmorph"}` instead. Open `/lab/lumenmorph/`. Registration is a runtime environment change, not an application source edit. The companion article lives in `public/blog.md`.

## Install from GitHub

This repository is available as source. It isn't published to npm yet. Install the GitHub snapshot:

```sh
npm install github:monabbous/lumenmorph
```

For repeatable builds, pin a commit in the GitHub dependency or retain your lockfile. The package name is `@monabbous/lumenmorph`; examples below use that name regardless of installation source.

For a local package, run `npm pack` inside this repository and install the resulting `.tgz` in your application.

## Add vanilla CSS

Import the stylesheet once in your bundler entry point:

```js
import "@monabbous/lumenmorph/css";
```

Then add classes to your existing elements:

```html
<article class="lumenmorph lumenmorph-border card">
  <h2 class="lumenmorph-text">Glass & light</h2>
  <p>Keep your content and native semantics.</p>
</article>
```

```css
.card {
  padding: 2rem;
  --lumen-glow-color: #65e8df;
  --lumen-glow-size: 420px;
  --lumen-bg: #102333bb;
}
```

For a no-bundler site, copy `dist/css/lumenmorph.css` to your public assets and reference it with a `<link rel="stylesheet">`. No tracking script is required for a static light.

The classes don't set your content's text color, padding, width, shadows, typography, or focus styles. Set those in your application. `.lumenmorph-text` is an optional CSS background-clip treatment for real HTML text; it doesn't require SVG or React.

### Use the site's glass text treatment

```html
<h2 class="lumenmorph-text">Glass & light</h2>
```

This ports nabous.dev's `.glassmorphism-text`; that class name also works as an alias in vanilla CSS, the SCSS class entry point, and Tailwind. It layers the background light behind translucent white text, clips it to the glyphs, and disables backdrop filtering. The text remains normal, selectable HTML. Use `lumen.text()` in SCSS or `.lumenmorph-text()` in Less for your own selector.

Control the base color with `--lumen-text-color`, the text light's radius with `--lumen-text-glow-size`, and its intensity with `--lumen-text-glow-opacity`. `--lumen-text-stroke-width` preserves the source treatment's transparent stroke; it doesn't draw an outline. For a visible outline, use the optional SVG component.

## Track the pointer

Call this once in the browser, after your document exists:

```js
import { trackPointer } from "@monabbous/lumenmorph";

const stop = trackPointer();
// When your page or app unmounts:
// stop();
```

By default, the helper listens on the element's window and writes viewport-relative `--lumen-x` and `--lumen-y` to `document.documentElement`. Descendants inherit the coordinates; you don't need to query every card or attach handlers to each surface. You can pass an ancestor element to scope the inherited variables to that subtree while retaining viewport coordinates.

| Option | Default | Effect |
| --- | --- | --- |
| `local` | `false` | Listen on the target surface and use padding-box coordinates instead of viewport coordinates. |
| `touch` | `false` | Also track touch pointers. Doesn't capture pointers or prevent scrolling. |
| `reducedMotion` | `true` | Keep the static light when `prefers-reduced-motion: reduce` matches. |

The helper uses passive pointer-move handling, reads geometry only for local mode, and restores prior inline values on cleanup, pointer exit, cancellation, or window blur. Cleanup is idempotent. Call it before attaching a replacement tracker to the same element. Don't create multiple trackers on the same target.

### Track a single surface

```html
<button class="lumenmorph lumenmorph-border" id="spotlight">A native button</button>
```

```js
import { trackPointer } from "@monabbous/lumenmorph";

const surface = document.querySelector("#spotlight");
const stop = trackPointer(surface, { local: true });
```

Local mode also sets `--lumen-attachment: scroll` and `--lumen-space: 100% 100%`. Use it on **one surface**, not an ancestor of multiple independently positioned surfaces. Avoid scrollable surfaces and CSS-transformed/scaled targets in local mode; the helper doesn't invert transform matrices or track scrolling under a stationary pointer.

### Set coordinates yourself

You can skip the helper and supply any coordinates, including those from a gamepad or your own event system:

```js
const style = document.documentElement.style;
style.setProperty("--lumen-x", "320px");
style.setProperty("--lumen-y", "180px");
```

There are no gyroscope listeners, permission prompts, observers, or automatic DOM scanning.

### Smooth the light and its return

Import the optional motion stylesheet, then put the class on the element that owns the coordinates. For page-wide tracking, that element is `html`:

```js
import "@monabbous/lumenmorph/css";
import "@monabbous/lumenmorph/motion";
import { trackPointer } from "@monabbous/lumenmorph";

const stop = trackPointer();
```

```html
<html class="lumenmorph-motion">
  <!-- Your normal head and body. Surfaces need no motion class. -->
</html>
```

The stylesheet registers `--lumen-x` and `--lumen-y` as inherited `<length>` properties. Only the coordinate owner transitions; every surface inherits its animated values. When the tracker removes the inline coordinates on exit, the light returns to the registered `50vw` / `35vh` position. The follow duration is 50 ms; `:not(:hover)` changes it to 500 ms for the return. Reduced motion disables both transitions. Smoothing is on by default in the lab, including after reset; the library keeps the stylesheet as a separate import.

```css
html.lumenmorph-motion {
  --lumen-follow-duration: 50ms;
  --lumen-return-duration: 500ms;
  --lumen-follow-easing: ease;
}
```

For SCSS, use `@use "@monabbous/lumenmorph/scss/motion";`. For Less, use `@import "@monabbous/lumenmorph/less/motion";`. In a Tailwind stylesheet, import `@monabbous/lumenmorph/motion` alongside your Tailwind import. Choose one route; they contain the same rules.

For scoped tracking, put the motion class on the same ancestor you pass to `trackPointer`. Don't add it to all the surfaces. In the hosted lab, only `.lm-lab` transitions, leaving the site's shell unchanged. This stylesheet sets `transition` on the coordinate owner; combine its two properties with any existing transitions you need there. `:not(:hover)` also matches on touch devices and when the pointer leaves that scope. Window blur with the pointer still inside uses the follow duration. Browsers without `@property` retain tracking but can't interpolate these custom properties. Importing this option registers the coordinate types document-wide, so use CSS lengths, not percentages, for these two properties.

## Control the material

All public custom properties use the `--lumen-` prefix. They inherit, so you can set a page theme and override individual surfaces. The component uses fallbacks rather than assigning defaults on each element.

| Property | Default | Accepted value |
| --- | --- | --- |
| `--lumen-bg` | `#302028b3` | Surface color, including alpha |
| `--lumen-solid-bg` | `#302028` | Opaque reduced-transparency fallback |
| `--lumen-glow-color` | `#ffaa71` | Glow color |
| `--lumen-glow-size` | `460px` | Radial glow radius as a CSS length |
| `--lumen-glow-opacity` | `0.3` | Surface intensity, number from 0 to 1 |
| `--lumen-blur` | `32px` | Backdrop blur length; use `0px` to disable blur |
| `--lumen-saturation` | `1.6` | Backdrop saturation ratio; 1 leaves it unchanged |
| `--lumen-radius` | `0.25rem` | Border radius |
| `--lumen-border-width` | `1.5px` | Border width; use `0px` to remove it |
| `--lumen-border-color` | `#ffffff30` | Static edge color |
| `--lumen-border-glow-color` | Glow color, or `#ffd4a3` | Independent illuminated edge color |
| `--lumen-border-opacity` | `0.9` | Edge intensity, number from 0 to 1 |
| `--lumen-text-color` | `#ffffffb3` | Translucent HTML text color |
| `--lumen-text-glow-size` | Glow size, or `80vmax` | HTML text glow radius |
| `--lumen-text-glow-opacity` | `1` | HTML text glow intensity, number from 0 to 1 |
| `--lumen-text-stroke-width` | `2px` | Transparent HTML text stroke width |
| `--lumen-x` / `--lumen-y` | `50vw` / `35vh` | Shared viewport light coordinates |
| `--lumen-attachment` | `fixed` | Background attachment; helper sets `scroll` in local mode |
| `--lumen-space` | `100vw 100vh` | Background sizing; helper sets `100% 100%` in local mode |

Glow colors can include alpha; that alpha combines with the intensity. To override the text effect's highlight independently, set `--lumen-glow-color` on the text element.

## Use SCSS mixins

Import the mixin-only entry point when you want your own class names:

```scss
@use "@monabbous/lumenmorph/scss/mixins" as lumen;

.card {
  @include lumen.lumenmorph((glow-size: 440px, bg: #102333bb));
  @include lumen.border((border-width: 2px));
  padding: 2rem;
}

.heading {
  @include lumen.text((glow-color: #fca675));
}
```

The map keys omit `--lumen-`. `lumenmorph()`, `border()`, and `text()` accept an optional map. You can configure shared defaults with `@use ... with ($defaults: (...))`.

Import `@monabbous/lumenmorph/scss` instead if you want the ready-made classes. Your Sass bundler must resolve package imports, or you must add `node_modules` to Sass load paths. Don't also import the vanilla stylesheet.

## Use Less mixins

```less
@import "@monabbous/lumenmorph/less";

.card {
  .lumenmorph(@glow-size: 440px; @bg: #102333bb);
  .lumenmorph-border(@border-width: 2px);
  padding: 2rem;
}

.heading {
  .lumenmorph-text(@glow-color: #fca675);
}
```

The Less import defines mixins only. Named parameters match the control table, without `--lumen-`. Configure your Less bundler to resolve package imports. Don't also import the vanilla stylesheet.

## Add Tailwind utilities

For Tailwind v4, register the plugin in your stylesheet:

```css
@import "tailwindcss";
@plugin "@monabbous/lumenmorph/tailwind";
```

For Tailwind v3.4, register it in `tailwind.config.cjs`:

```js
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  plugins: [require("@monabbous/lumenmorph/tailwind")],
};
```

Use the same component classes, theme colors, arbitrary values, and normal variants:

```html
<article class="lumenmorph lumenmorph-border p-8
  lumen-glow-cyan-300 lumen-glow-size-[440px]
  lumen-bg-[#102333bb] lumen-radius-xl
  hover:lumen-glow-opacity-30">
  <h2 class="lumenmorph-text">Glass & light</h2>
</article>
```

| Utility | Theme scale |
| --- | --- |
| `lumen-glow-*`, `lumen-bg-*`, `lumen-border-color-*`, `lumen-border-glow-*`, `lumen-text-color-*` | Colors |
| `lumen-glow-size-*` | Spacing |
| `lumen-blur-*` | Blur |
| `lumen-radius-*` | Border radius |
| `lumen-border-width-*` | Border width |
| `lumen-glow-opacity-*`, `lumen-border-opacity-*` | Opacity |
| `lumen-text-glow-size-*`, `lumen-text-glow-opacity-*`, `lumen-text-stroke-width-*` | Spacing, opacity, border width |
| `lumen-saturation-[1.5]` | Arbitrary ratio |

Opacity utilities follow Tailwind's scale: `lumen-glow-opacity-30` means 30%. Arbitrary opacity ratios use values such as `lumen-glow-opacity-[0.3]`. You can also use arbitrary CSS properties, such as `[--lumen-glow-size:440px]`. Keep full class names in source so Tailwind can discover them. Don't also import the vanilla stylesheet.

## Add optional React SVG text

For most headings, use `.lumenmorph-text` on normal HTML. Choose `LumenText` when you want a translucent SVG fill and a separately illuminated outline, as used on nabous.dev.

Install React in your app if you haven't already, then import the separate entry point:

```jsx
"use client";
import { useEffect } from "react";
import { trackPointer } from "@monabbous/lumenmorph";
import { LumenText } from "@monabbous/lumenmorph/react";
import "@monabbous/lumenmorph/css";

export function Wordmark() {
  useEffect(() => trackPointer(), []);
  return <LumenText
    width={640}
    height={120}
    fontSize={80}
    strokeWidth={2}
    textProps={{ fontFamily: "system-ui, sans-serif" }}
  >Lumenmorph</LumenText>;
}
```

Only attach the page tracker once if your app renders multiple components. React's effect uses the returned cleanup function, including during Strict Mode remounts. `LumenText` uses `useId`, not random IDs, to keep mask references stable across server rendering and hydration. With multiple independently hydrated React roots, configure React's matching server/client `identifierPrefix` to avoid cross-root ID collisions.

| Prop | Default | Description |
| --- | --- | --- |
| `children` | Required | Plain text string |
| `width` / `height` | `640` / `120` | Numeric SVG viewport and initial dimensions |
| `fontSize` | `80` | SVG font size |
| `strokeWidth` | `2` | Outline width |
| `textProps` | `{}` | SVG text positioning and typography; mask fill/stroke remain internal |
| Other SVG props | — | Forwarded to the outer SVG, including `style`, `className`, and `aria-label` |

Set `--lumen-text-fill` (default `#ffffff30`) and `--lumen-text-outline` (default `#ffffff80`) on the SVG or an ancestor to control its static fill and outline. The component shares the page's glow color and size; fill/outline glow intensities are 0.5 and 1. Set `aria-hidden="true"` if the SVG repeats nearby accessible text.

Size the viewport to fit your text; the component doesn't measure fonts or wrap lines. For responsive layout, use `width: 100%; height: auto` on the SVG. The accessible image name defaults to its string content; use real HTML headings for document structure and selectable, translatable body text.

SVG `foreignObject` backgrounds don't reliably share the document's fixed-background viewport. The optional React component maps the inherited page coordinates through `getScreenCTM().inverse()` and uses local backgrounds. A ResizeObserver and resize/scroll listeners refresh that matrix, coalesced into one animation frame; there is no extra pointer listener or idle animation loop. CSS-animated transforms or unrelated layout shifts that don't resize the observed SVG/parent may leave the matrix stale until a resize or scroll. Prefer an untransformed heading and test your layout.

The SVG effect uses two masks and two HTML `foreignObject` layers. Its outline is a ring around the filled silhouette, produced by SVG dilation and erosion. Stroking the font's raw contours would expose internal seams in fonts with overlapping contours, including Cascadia Mono. The silhouette ring avoids those lines.

This effect uses more markup than the CSS text treatment. Test it in your target browsers: foreignObject compositing and backdrop blur through SVG masks can differ by engine. SVG export tools may not render the HTML layers.

## Check accessibility and browser behavior

- Keep native buttons, links, and headings. The CSS doesn't replace semantics or input behavior. Supply visible focus styles and sufficient text contrast over every background.
- The border pseudo-element ignores pointer events. The border class sets `position: relative`; override it if your layout needs another positioning mode. Don't reuse its `::before` for unrelated decoration.
- Modern browsers with `color-mix()` get the radial light; older browsers keep the flat tint, static border, and readable text. Without `backdrop-filter`, the tint and glow remain, but the background isn't blurred. The enhanced edge requires mask compositing support.
- `prefers-reduced-transparency` removes surface blur and uses `--lumen-solid-bg`. Forced-color mode restores system surface/text colors and hides the illuminated border. OS support for reduced transparency varies.
- The tracker honors reduced motion by default and ignores touch by default. It never requests device-orientation permissions.
- Shared viewport light uses fixed-attachment backgrounds. Transforms, filters, containment, SVG compositing, and mobile engines can change fixed-background behavior. Use a static light or local mode on one untransformed surface when shared alignment isn't reliable.
- Blur and radial gradients require rendering work. Small JavaScript and low markup don't imply compositor-only rendering or a speed advantage over other glass effects. Avoid many overlapping, full-screen blurred surfaces; test real devices.

## Develop and verify changes

```sh
npm ci
npm run build
npm test
npm run test:types
npx playwright install chromium
npm run test:browser
npm pack --dry-run
```

`src/lumenmorph.css` is the canonical visual source. The build generates CSS, SCSS, Less, Tailwind rule data, and the standalone lab's runtime assets. Commit generated outputs with source changes. The package includes the integrations and optional helpers, not the lab or its React runtime bundle.

Tests compile SCSS, Less, and both Tailwind versions; verify React SSR IDs, pointer batching/cleanup, and size budgets; and exercise desktop/mobile-emulated Chromium, native keyboard activation, reduced motion, and forced colors. These checks aren't a claim of physical iOS or universal browser compatibility.

### Publish after npm setup

Publishing is manual. Configure npm's trusted publisher for package `@monabbous/lumenmorph`, GitHub owner `monabbous`, repository `lumenmorph`, workflow `publish-npm.yml`, and environment `production`. After setup, dispatch **Publish to npm** on `main` with the exact version in `package.json`. The workflow builds and tests before publishing with provenance. Pushes don't publish packages; the first publish waits for the owner's approval.

## License and credit

[ISC](LICENSE), Mohamed Nabous. Lumenmorph extracts and adapts the glass surface, shared pointer glow, illuminated edge, and SVG text approach from [monabbous/nabous.dev](https://github.com/monabbous/nabous.dev). It doesn't copy the site's shell or install Slidebox.
