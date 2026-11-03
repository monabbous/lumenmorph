[← Documentation](README.md)

## Install

Choose **npm** for a project with a bundler, or **CDN** for a plain HTML page. Both use the same CSS classes. No framework or JavaScript is needed for static glass.

### npm

Run this in your project folder:

```sh
npm install @monabbous/lumenmorph
```

Import the CSS once in your JavaScript entry point (for example, `src/main.js` in Vite):

```js
import "@monabbous/lumenmorph/css";
```

Or use your bundler's CSS package resolution in your main stylesheet:

```css
@import "@monabbous/lumenmorph/css";
```

Choose one import, then add the [HTML classes and your own styles](#vanilla-html-and-css). Bare package imports need a bundler; browsers can't resolve them directly. Production bundlers can minify this CSS along with the rest of your styles. See the [Sass/Less](preprocessors.md) and [Tailwind](tailwind.md) guides for other styling routes.

### CDN: vanilla HTML, minified CSS

Save this as `index.html` and open it in a browser. The version-pinned jsDelivr URL serves **minified CSS**; there is no npm install or build step.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lumenmorph — vanilla CSS</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.2.1/dist/css/lumenmorph.min.css">
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(ellipse at top, #19494c, #101820 70%);
        color: #fff;
        font-family: system-ui, sans-serif;
      }
      .card {
        margin: 1rem;
        padding: 2rem;
        max-width: 28rem;
        --lumen-glow-color: #ffaa71;
        --lumen-radius: 4px;
      }
    </style>
  </head>
  <body>
    <article class="lumenmorph lumenmorph-border card">
      <h1 class="lumenmorph-text">Glass &amp; light</h1>
      <p>A glass surface with plain HTML and CSS.</p>
    </article>
  </body>
</html>
```

To make the light follow the pointer, add this optional module before `</body>`, once per page:

```html
<script type="module">
  import { trackPointer } from "https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.2.1/js/pointer.mjs";
  const stop = trackPointer();
  // Call stop() if you remove the effect.
</script>
```

For smooth follow and return, also add this minified stylesheet to `<head>` and set `class="lumenmorph-motion"` on `<html>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.2.1/dist/css/motion.min.css">
```

Keep all CDN URLs on the same version. The npm package includes `dist/css/lumenmorph.min.css` and `dist/css/motion.min.css`, generated from the same source as the readable stylesheets and ready for CDN delivery or self-hosting.

### Self-host the CSS

After installing with npm, copy the stylesheet into your site's public assets:

```sh
mkdir -p public/vendor
cp node_modules/@monabbous/lumenmorph/dist/css/lumenmorph.css public/vendor/lumenmorph.css
```

Then reference it from your HTML (adjust the URL for your site's public directory):

```html
<link rel="stylesheet" href="/vendor/lumenmorph.css">
```

You can also download the [minified CDN stylesheet](https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.2.1/dist/css/lumenmorph.min.css), save it as `public/vendor/lumenmorph.min.css`, and link to `/vendor/lumenmorph.min.css`. No tracking script is required for a static light.

For unreleased changes, install from GitHub instead of the registry:

```sh
npm install github:monabbous/lumenmorph
```

For repeatable builds, pin a commit in the GitHub dependency or retain your lockfile. The package name is `@monabbous/lumenmorph`; examples below use that name regardless of installation source.


## Vanilla HTML and CSS

After loading the stylesheet with [npm, CDN, or a local file](#install), add classes to your existing elements:

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

The classes don't set your content's text color, padding, width, shadows, typography, or focus styles. Set those in your application. `.lumenmorph-text` is an optional CSS background-clip treatment for real HTML text; it doesn't require SVG or React.

### Use the site's glass text treatment

```html
<h2 class="lumenmorph-text">Glass & light</h2>
```

This ports nabous.dev's `.glassmorphism-text`; that class name also works as an alias in vanilla CSS, the SCSS class entry point, and Tailwind. It layers the background light behind translucent white text, clips it to the glyphs, and disables backdrop filtering. The text remains normal, selectable HTML. Use `lumen.text()` in SCSS or `.lumenmorph-text()` in Less for your own selector.

Control the base color with `--lumen-text-color`, the text light's radius with `--lumen-text-glow-size`, and its intensity with `--lumen-text-glow-opacity`. `--lumen-text-stroke-width` preserves the source treatment's transparent stroke; it doesn't draw an outline. For a visible outline, use the optional SVG component.

