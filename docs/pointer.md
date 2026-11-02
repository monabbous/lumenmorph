[← Documentation](README.md)

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

SVG text and icon paint layers do not apply backdrop blur or saturation. Filtering an HTML `foreignObject` can escape its SVG mask in Safari, producing a solid rectangle. The adapters keep their translucent fill, outline, and pointer light; place them on a Lumenmorph surface when you want a blurred backdrop.

