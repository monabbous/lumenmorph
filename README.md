# Lumenmorph

Glass surfaces, glowing borders, and optional pointer light. CSS first, with no core runtime dependencies.

[![npm](https://img.shields.io/npm/v/@monabbous/lumenmorph?color=ffaa71)](https://www.npmjs.com/package/@monabbous/lumenmorph)
[![License: ISC](https://img.shields.io/badge/license-ISC-2a5b7c)](LICENSE)

<p align="center">
  <a href="https://nabous.dev/lab/lumenmorph/">
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcset="https://nabous.dev/project-assets/lumenmorph/assets/lumenmorph-header.png">
      <img src="https://nabous.dev/project-assets/lumenmorph/assets/lumenmorph-header.webp" width="800" alt="Ember light following a pointer across the Lumenmorph wordmark.">
    </picture>
  </a>
</p>

[Playground](https://nabous.dev/lab/lumenmorph/) · [24 editable examples](https://nabous.dev/lab/lumenmorph/examples/) · [Documentation](docs/README.md)

## Get started

With npm and a bundler:

```sh
npm install @monabbous/lumenmorph
```

```css
@import "@monabbous/lumenmorph/css";
```

For plain HTML, add the minified CSS to `<head>` instead:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.3.0/dist/css/lumenmorph.min.css">
```

Both routes use the same markup. Your app supplies spacing and typography:

```html
<article class="lumenmorph lumenmorph-border" style="padding: 2rem">
  <h2>Glass &amp; light</h2>
  <p>One surface. One optional border pseudo-element.</p>
</article>
```

Static glass needs no JavaScript. [Add pointer light](docs/pointer.md) when you want the glow to follow the cursor. [Installation details](docs/getting-started.md) cover CDN scripts, self-hosting, and HTML glass text.

The optional [Slidebox skin](docs/slidebox.md) lives in `skins/slidebox.css`. Import it as `@monabbous/lumenmorph/skins/slidebox` after Slidebox's styles. The lab, gallery, and editor reuse that same stylesheet, with layout and theme settings only. This namespaced import is new in the next release; published versions through 0.3.1 use the compatible `/slidebox` alias.

## Examples

[![Explore 24 editable Lumenmorph examples](https://nabous.dev/lab/lumenmorph/examples/collection.png)](https://nabous.dev/lab/lumenmorph/examples/)

<p align="center">
  <a href="https://nabous.dev/lab/lumenmorph/examples/">
    <img src="https://img.shields.io/badge/Explore_examples-%E2%86%92-ffaa71?style=for-the-badge&amp;labelColor=102a31" alt="Explore examples">
  </a>
</p>

## Choose your setup

| Your project | Guide |
| --- | --- |
| Plain HTML or any framework | [CSS quickstart](docs/getting-started.md) |
| Tailwind v4 or v3.4 | [Variable utilities and variants](docs/tailwind.md) |
| shadcn/ui | [Install Card, Button, or pointer light](docs/shadcn.md) |
| MUI / Mantine / Taiga UI v4+ | [Theme integrations](docs/ui-libraries.md) |
| Slidebox switches, radio groups, and experimental ranges | [Lab glass skin](docs/slidebox.md) |
| Sass / Less | [Mixins and ready-made classes](docs/preprocessors.md) |
| React / Vue / Svelte / Angular / Web Components | [Optional SVG text and icons](docs/svg.md) |

[CSS controls](docs/controls.md) · [Browser support and accessibility](docs/accessibility.md) · [Contributing](docs/contributing.md)

The material owns the surface background and radius; the optional border uses `::before`. Blur and gradient painting have a cost—keep large blurred areas in check and test on your target devices.

**Using an AI coding agent?** Start with the [Lumenmorph skill](skills/lumenmorph/SKILL.md).

Adapted from the glass surface and SVG text approach in [nabous.dev](https://github.com/monabbous/nabous.dev).

ISC © Mohamed Nabous. [License and credit](LICENSE) · [Third-party notices](THIRD_PARTY.md)
