# Lumenmorph

## Glass surfaces. CSS first.

Frosted surfaces and illuminated edges from nabous.dev. One element for the surface; one pseudo-element for the border.

[![npm](https://img.shields.io/npm/v/@monabbous/lumenmorph?color=ffaa71)](https://www.npmjs.com/package/@monabbous/lumenmorph)
[![License: ISC](https://img.shields.io/badge/license-ISC-2a5b7c)](LICENSE)
[![Tailwind v3.4 / v4](https://img.shields.io/badge/Tailwind-v3.4%20%2F%20v4-2a5b7c)](#tailwind)
![Core runtime dependencies: 0](https://img.shields.io/badge/core_runtime_dependencies-0-ffaa71)

<p align="center">
  <a href="https://nabous.dev/lab/lumenmorph/">
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcset="https://nabous.dev/project-assets/lumenmorph/assets/lumenmorph-header.png">
      <img src="https://nabous.dev/project-assets/lumenmorph/assets/lumenmorph-header.webp" width="800" height="450" alt="Ember light following a pointer across the Lumenmorph wordmark.">
    </picture>
  </a>
</p>

The demo uses the optional SVG text component with Ember, 50 ms follow, and 500 ms return. CSS paints the glass; the pointer helper supplies its coordinates. The recording uses an automated pointer path.

[Try the playground](https://nabous.dev/lab/lumenmorph/) · [Read the story](https://nabous.dev/blog/lumenmorph/) · [npm](https://www.npmjs.com/package/@monabbous/lumenmorph) · [Source](https://github.com/monabbous/lumenmorph)

Static surfaces and HTML glass text need no JavaScript. Pointer tracking and SVG text are optional. React, Vue, Svelte, and Angular are optional peers; the Web Component needs no framework.

**Using an AI coding agent?** Start with the [Lumenmorph skill](skills/lumenmorph/SKILL.md), the public integration guide for `@monabbous/lumenmorph`. Agents in a checkout should also read [`AGENTS.md`](AGENTS.md).

## Contents

- [Install](#install)
- [AI agent discovery](#ai-agent-discovery)
- [Vanilla HTML and CSS](#vanilla-html-and-css)
- [Optional pointer tracking](#optional-pointer-tracking)
  - [Smooth follow and return](#smooth-the-light-and-its-return)
- [Defaults and controls](#defaults-and-controls)
- [Sass / SCSS](#sass--scss)
- [Less](#less)
- [Tailwind](#tailwind)
- [SVG text component](#svg-text-component)
- [SVG icon component](#svg-icon-component)
- [Accessibility and browser support](#accessibility-and-browser-support)
- [Contributing](#contributing)

## Install

```sh
npm install @monabbous/lumenmorph
```

For unreleased changes, install from GitHub instead:

```sh
npm install github:monabbous/lumenmorph
```

For repeatable builds, pin a commit in the GitHub dependency or retain your lockfile. The package name is `@monabbous/lumenmorph`; examples below use that name regardless of installation source.

## AI agent discovery

The canonical guide is [`skills/lumenmorph/SKILL.md`](skills/lumenmorph/SKILL.md). It covers styling routes, pointer cleanup/smoothing, HTML text, framework adapters, and browser limits.

```sh
gh search repos lumenmorph --owner monabbous --limit 5
gh api repos/monabbous/lumenmorph/contents/skills/lumenmorph/SKILL.md \
  -H 'Accept: application/vnd.github.raw+json'
```

Without GitHub CLI, use the [raw skill URL](https://raw.githubusercontent.com/monabbous/lumenmorph/main/skills/lumenmorph/SKILL.md). With the [Skills CLI](https://github.com/vercel-labs/skills), select your supported agent:

```sh
npx skills add monabbous/lumenmorph --skill lumenmorph
```

For OpenCode, install it in `.opencode/skills/lumenmorph/SKILL.md` for a project or `~/.config/opencode/skills/lumenmorph/SKILL.md` for your user. A published skill isn't automatically loaded by every agent; follow your agent's discovery rules. Installing the skill doesn't install the CSS package.

## Vanilla HTML and CSS

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

## Optional pointer tracking

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

## Defaults and controls

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

## Sass / SCSS

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

## Less

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

For the ready-made classes instead of mixins, import `@monabbous/lumenmorph/less/classes`. That entry also supplies the internal surface class needed by optional SVG components.

## Tailwind

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

## SVG text component

For most headings, use `.lumenmorph-text` on normal HTML. Choose `LumenText` when you want a translucent SVG fill and a separately illuminated outline, as used on nabous.dev.

Choose the adapter for your app. Each adapter uses the same glass layers, silhouette outline, and page-coordinate mapping. None starts pointer tracking automatically.

### React

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

These adapters share the same silhouette outline and coordinate mapping as React. Vue, Svelte, and Angular render into one native `<svg>` with no wrapper. The Web Component adds its custom-element host and an open shadow root; its core stylesheet is shared between instances with a constructable stylesheet where supported.

The Vue, Svelte, Angular, and Web Component effects are **client-rendered**. Vue/Svelte/Angular leave an accessible, sized SVG shell during server rendering, then build its masks after mounting. They don't hydrate server-rendered glyphs. Use `.lumenmorph-text` on real HTML for text that must be visible without hydration; React supports server-rendered SVG markup. No adapter starts pointer tracking automatically.

### Vue 3.5

```vue
<script setup>
import { LumenText } from "@monabbous/lumenmorph/vue";
import "@monabbous/lumenmorph/css";
</script>

<template>
  <LumenText text="Lumenmorph" :width="640" :height="120" :font-size="80" />
</template>
```

Props are `text` (required), `width`, `height`, `fontSize`, `strokeWidth`, `textProps`, and `label`. Native SVG attributes, classes, and styles fall through to the SVG.

### Svelte 5

```svelte
<script>
  import LumenText from "@monabbous/lumenmorph/svelte";
  import "@monabbous/lumenmorph/css";
</script>

<LumenText text="Lumenmorph" width={640} height={120} fontSize={80} />
```

Svelte uses the same props as Vue and forwards other SVG attributes. Import the Svelte source through a Svelte-aware bundler; there is no Svelte runtime bundled in this package.

### Angular 21

```ts
import { Component } from "@angular/core";
import { LumenTextComponent } from "@monabbous/lumenmorph/angular";

@Component({
  selector: "app-wordmark",
  standalone: true,
  imports: [LumenTextComponent],
  template: `<svg lumenText text="Lumenmorph"
    [width]="640" [height]="120" [fontSize]="80"></svg>`,
})
export class WordmarkComponent {}
```

Import `@monabbous/lumenmorph/css` in your application's global stylesheet. The standalone component attaches directly to an SVG. Its inputs are `text`, `width`, `height`, `fontSize`, `strokeWidth`, `textProps`, and `label`. Distribution uses Angular's partial compilation format; consume it through an Angular build/linker. The adapter is tested against Angular 21.

### Web Components

```js
import { defineLumenText } from "@monabbous/lumenmorph/web-component";

defineLumenText();
```

```html
<lumen-text text="Lumenmorph" width="640" height="120" font-size="80"></lumen-text>
```

Register once in the browser. Importing the module on a server is safe; registration requires Custom Elements. `defineLumenText("my-glass-text")` uses a custom tag name. Repeating registration of the same adapter is harmless; another library's existing tag raises an error.

Attributes: `text`, `width`, `height`, `font-size`, `stroke-width`, `font-family`, `font-weight`, `letter-spacing`, and `aria-label`. Without `text`, the element uses its light-DOM text content. Updating attributes or text refreshes the SVG. Disconnecting removes observers/listeners; reconnecting initializes the effect again. CSS custom properties inherit through the shadow boundary, so the usual page light works. Set width and other layout styles on the host. The Web Component includes the surface CSS inside its shadow root; import the separate motion stylesheet at document level if you use smoothing.

### Configure the shared text geometry

Vue, Svelte, and Angular use numeric dimensions and a string `text`. Defaults match React: 640 × 120, font size 80, outline width 2. `textProps` accepts typography/positioning only: `fontFamily`, `fontWeight`, `fontStyle`, `letterSpacing`, `wordSpacing`, `textAnchor`, `dominantBaseline`, `x`, `y`, `dx`, `dy`, `direction`, `textLength`, and `lengthAdjust`. Fill, stroke, filters, and mask references remain internal. Text is assigned as text content, never parsed as markup.

All adapters use an ordinary SVG text fallback in forced-color mode. They stop geometry observers and media/scroll/resize listeners on unmount. Their shared mapping is intended for page-space coordinates, not a `trackPointer(..., { local: true })` ancestor. Keep the text under your page-coordinate owner.

When SVG components use the Tailwind route, ensure the internal `lumenmorph` class is emitted. In v4, add `@source inline("lumenmorph");` to the stylesheet; in v3, include `lumenmorph` in your `safelist` or content sources. The lab's foundation examples include this setup. For custom SCSS/Less selectors, also emit the base `.lumenmorph` class or use the ready-made class entry point.

## SVG icon component

`LumenIcon` ports the site's `SVGGlassMorph` treatment for filled SVG paths. It uses the same silhouette masks and page light as the text component, without the original layout wrapper or hidden sizing copy. It isn't an icon set: supply your own path data and view box.

```jsx
import { LumenIcon } from "@monabbous/lumenmorph/react";
import "@monabbous/lumenmorph/css";

const play = "M18 12Q14 10 14 15v34q0 5 4 3l36-19q4-2 0-4Z";

export function PlayIcon() {
  return <LumenIcon paths={play} viewBox="0 0 64 64" label="Play" />;
}
```

| Adapter | Export | Example |
| --- | --- | --- |
| React | `LumenIcon` from `/react` | `<LumenIcon paths={play} label="Play" />` |
| Vue | `LumenIcon` from `/vue` | `<LumenIcon :paths="play" label="Play" />` |
| Svelte | `LumenIcon` from `/svelte` | `<LumenIcon paths={play} label="Play" />` |
| Angular | `LumenIconComponent` from `/angular` | `<svg lumenIcon [paths]="play" label="Play"></svg>` |
| Web Component | `defineLumenIcon()` from `/web-component` | `<lumen-icon path="M…" aria-label="Play"></lumen-icon>` |

Use the full package prefix, `@monabbous/lumenmorph`, for the entry points above. Register the Web Component before using it, just as with `defineLumenText`. Its attributes are `path`, `view-box`, `width`, `height`, `stroke-width`, and `aria-label`.

Common props are `paths` (a path string or array), `viewBox` (default `0 0 64 64`), numeric `width` / `height` (128 / 128), `strokeWidth` (2, in SVG units), and `label`. Leave room inside the view box for the outline. These are filled silhouettes; stroke-only line icons need conversion to filled paths. Set `--lumen-icon-fill` and `--lumen-icon-outline` to override the inherited text-layer colors.

An unlabeled icon is decorative and hidden from accessibility APIs. Supply `label` for a meaningful image, or label its enclosing button and leave the icon decorative. It has the same client-rendering/SSR boundaries as the text adapter for each framework. The lab's framework selector switches both the text and icon examples.

## Accessibility and browser support

- Keep native buttons, links, and headings. The CSS doesn't replace semantics or input behavior. Supply visible focus styles and sufficient text contrast over every background.
- The border pseudo-element ignores pointer events. The border class sets `position: relative`; override it if your layout needs another positioning mode. Don't reuse its `::before` for unrelated decoration.
- Modern browsers with `color-mix()` get the radial light; older browsers keep the flat tint, static border, and readable text. Without `backdrop-filter`, the tint and glow remain, but the background isn't blurred. The enhanced edge requires mask compositing support.
- `prefers-reduced-transparency` removes surface blur and uses `--lumen-solid-bg`. Forced-color mode restores system surface/text colors and hides the illuminated border. OS support for reduced transparency varies.
- The tracker honors reduced motion by default and ignores touch by default. It never requests device-orientation permissions.
- Shared viewport light uses fixed-attachment backgrounds. Transforms, filters, containment, SVG compositing, and mobile engines can change fixed-background behavior. Use a static light or local mode on one untransformed surface when shared alignment isn't reliable.
- Blur and radial gradients require rendering work. Small JavaScript and low markup don't imply compositor-only rendering or a speed advantage over other glass effects. Avoid many overlapping, full-screen blurred surfaces; test real devices.

Automated browser checks use desktop and mobile-emulated Chromium. Test your target browsers and physical devices, especially for SVG compositing and fixed backgrounds.

## Contributing

Contributions are welcome. For setup, tests, and source-generation rules, read [CONTRIBUTING.md](https://github.com/monabbous/lumenmorph/blob/main/CONTRIBUTING.md). Include a small reproduction and browser version when reporting a bug.

## License and credit

[ISC](LICENSE), Mohamed Nabous. Lumenmorph extracts and adapts the glass surface, shared pointer glow, illuminated edge, and SVG text approach from [monabbous/nabous.dev](https://github.com/monabbous/nabous.dev). It doesn't copy the site's shell or install Slidebox.
