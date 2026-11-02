---
title: "Lumenmorph: chasing light with CSS"
description: "The CSS behind the site's glass surfaces and text, extracted into a standalone project."
cover_image: assets/lumenmorph-header.webp
social_image: assets/lumenmorph-header.png
social_image_width: 1280
social_image_height: 720
---

## TL;DR

Lumenmorph extracts nabous.dev's glass surfaces and text into CSS, SCSS, Less, and Tailwind. Static glass needs no JavaScript; pointer tracking and SVG components are optional. There are adapters for React, Vue, Svelte, Angular, and Web Components, plus a [public skill for coding agents](https://github.com/monabbous/lumenmorph/blob/main/skills/lumenmorph/SKILL.md).

```sh
npm install @monabbous/lumenmorph
```

The glass on nabous.dev uses a tinted background, backdrop blur, and a radial light that follows the pointer. I wanted to use it outside the website without copying its theme and page structure along with it.

That extraction is [Lumenmorph](https://github.com/monabbous/lumenmorph). It has vanilla CSS, SCSS and Less mixins, and Tailwind utilities. The [lab](/lab/lumenmorph/) lets you adjust the effect and copy the settings.

## A surface and an edge

```html
<article class="lumenmorph lumenmorph-border">
  Your content
</article>
```

The element paints its own tint and glow. `backdrop-filter` blurs what's behind it. The border uses one pseudo-element with a mask that removes the middle, leaving a narrow illuminated edge. It doesn't intercept clicks or add a wrapper around the content.

The controls are inherited CSS variables:

```css
.panel {
  --lumen-glow-color: #ffaa71;
  --lumen-glow-size: 460px;
  --lumen-bg: #302028b3;
  --lumen-blur: 32px;
  padding: 2rem;
}
```

Ember is the default material. The lab also keeps the original nabous.dev blue/teal palette and a light preset. You can change the tint, blur, glow, and border independently.

## Share the light

For ordinary surfaces, the radial background uses viewport coordinates. Put `--lumen-x` and `--lumen-y` on an ancestor and the surfaces share the same light, including those near the pointer that aren't being hovered directly.

Static glass doesn't need JavaScript. The optional pointer helper supplies the two coordinates, with at most one update per animation frame:

```js
import { trackPointer } from "@monabbous/lumenmorph";

const stop = trackPointer();
// Call stop() when the page unmounts.
```

It stops when idle and returns a cleanup function. Touch is ignored by default, and reduced motion keeps the light static.

The optional motion stylesheet registers the coordinates with `@property`. It transitions them on `html`, so every surface inherits the same animated position. Following uses 50 ms; leaving gives the light 500 ms to return to its resting position. Those durations are configurable. Smoothing is on in the lab, with a switch to compare it against direct tracking.

## Keep text as text

```html
<h2 class="lumenmorph-text">Glass & light</h2>
```

This ports the site's `glassmorphism-text` treatment: a clipped background light behind translucent text, without backdrop blur on the letters. The original class name remains available as an alias. The content stays selectable HTML and keeps its heading semantics.

The optional SVG adapters for React, Vue, Svelte, Angular, and Web Components add a translucent fill and an outline. The outline comes from the filled glyph silhouette, which avoids the internal contour lines that a plain stroke exposes in fonts such as Cascadia Mono. They map page coordinates into SVG space so scaling the text doesn't offset the light. Regular surfaces don't load that helper.

The site's SVG icon treatment is available too. Give `LumenIcon` a filled path and a view box; it shares the same layers and light. The lab lets you switch framework adapters for both examples.

## Check the rendering cost

I like finding how much the browser can do with a small stylesheet, as with [Slidebox](https://github.com/monabbous/slidebox). Blur still needs rendering work. Large overlapping surfaces can be expensive, and masks and SVG compositing need testing in the browsers you support.

The [README](https://github.com/monabbous/lumenmorph#readme) covers the integration options and limitations. The project is ISC licensed. The lab separates CSS and pointer setup from framework-specific SVG examples, so you can copy the parts you need.

I'm open to contributions. If you find a browser bug or a smaller way to build part of the effect, open an issue or send a pull request in the [repository](https://github.com/monabbous/lumenmorph).
