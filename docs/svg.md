[← Documentation](README.md)

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

The silhouette masks use alpha and keep their light coordinates constant. Pointer coordinates still flow to the paint layers, but don't invalidate the static mask subtree on every move. This reduces Safari's rendering work without removing the outline or the moving light. Blur and gradient painting still have a cost; this is not compositor-only animation.

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

