[← Documentation](README.md)

## Defaults and controls

All public custom properties use the `--lumen-` prefix. They inherit, so you can set a page theme and override individual surfaces. The component uses fallbacks rather than assigning defaults on each element.

| Property | Default | Accepted value |
| --- | --- | --- |
| `--lumen-bg` | `#302028b3` | Surface color, including alpha |
| `--lumen-solid-bg` | `#302028` | Opaque reduced-transparency fallback |
| `--lumen-glow-color` | `#ffaa71` | Glow color |
| `--lumen-glow-size` | `460px` | Radial glow radius as a CSS length |
| `--lumen-glow-opacity` | `0.3` | Surface intensity, number from 0 to 1 |
| `--lumen-undertone` | `none` | One CSS image for an independent surface undertone; added in 0.4.0-alpha.0 |
| `--lumen-blur` | `32px` | Backdrop blur length; use `0px` to disable blur |
| `--lumen-saturation` | `1.6` | Backdrop saturation ratio; 1 leaves it unchanged |
| `--lumen-radius` | `0.25rem` | Border radius |
| `--lumen-border-width` | `1.5px` | Border width; use `0px` to remove it |
| `--lumen-border-color` | `#ffffff30` | Static edge color |
| `--lumen-border-glow-color` | Glow color, or `#ffd4a3` | Independent illuminated edge color |
| `--lumen-border-opacity` | `0.9` | Edge intensity, number from 0 to 1 |
| `--lumen-border-undertone` | `none` | One CSS image for an independent edge undertone; added in 0.4.0-alpha.0 |
| `--lumen-text-color` | `#ffffffb3` | Translucent HTML text color |
| `--lumen-text-glow-size` | Glow size, or `80vmax` | HTML text glow radius |
| `--lumen-text-glow-opacity` | `1` | HTML text glow intensity, number from 0 to 1 |
| `--lumen-text-stroke-width` | `2px` | Transparent HTML text stroke width |
| `--lumen-x` / `--lumen-y` | `50vw` / `35vh` | Shared viewport light coordinates |
| `--lumen-attachment` | `fixed` | Pointer glow attachment; helper sets `scroll` in local mode |
| `--lumen-space` | `100vw 100vh` | Pointer glow sizing; helper sets `100% 100%` in local mode |

Glow colors can include alpha; that alpha combines with the intensity. To override the text effect's highlight independently, set `--lumen-glow-color` on the text element.

## Independent undertone

Available in `0.4.0-alpha.0`. Set `--lumen-undertone` to paint a custom image behind the normal surface glow. Set `--lumen-border-undertone` to paint one inside the existing border mask. Each hook defaults to `none`, inherits normally, and can be enabled independently.

```html
<article class="lumenmorph lumenmorph-border my-card">
  <h2>Independent light</h2>
  <p>The violet undertone stays attached to this card.</p>
</article>
```

```css
@import "@monabbous/lumenmorph/css";

.my-card {
  padding: 2rem;

  /* App-owned controls, independent of --lumen-x and --lumen-y. */
  --undertone-x: 50%;
  --undertone-y: 110%;
  --undertone-color: rgb(139 92 246 / 40%);

  --lumen-undertone: radial-gradient(
    ellipse 85% 65% at var(--undertone-x) var(--undertone-y),
    var(--undertone-color),
    transparent 80%
  );

  /* Optional: use the same design on the illuminated edge. */
  --lumen-border-undertone: var(--lumen-undertone);
}

.my-card[data-selected="true"] {
  --undertone-color: rgb(34 211 238 / 55%);
  --undertone-y: 80%;
}
```

The normal glow is painted above the undertone. The undertone uses `scroll` attachment and `100% 100%` sizing, so percentage positions in its gradient are relative to the surface or border layer. Changing `--lumen-x`, `--lumen-y`, `--lumen-attachment`, or `--lumen-space` does not reposition or resize the undertone. The pointer helper does not write any undertone controls.

Your app can change its own variables through CSS states or JavaScript:

```js
const card = document.querySelector(".my-card");
card.style.setProperty("--undertone-x", "25%");
card.style.setProperty("--undertone-color", "#ff884466");
```

Supply one CSS image per hook: a gradient, `url(...)`, or `none`. A comma-separated list of multiple images is not supported because each hook has one background attachment and size. The undertone's opacity comes from the colors or image you supply; `--lumen-glow-opacity` and `--lumen-border-opacity` continue to control only the normal glow.

These hooks style the surface and optional border. They do not add an undertone to `.lumenmorph-text`. The border continues to use `::before`, and no additional element or pointer listener is needed. Existing reduced-transparency and forced-color fallbacks still apply. If you animate your own undertone controls, honor `prefers-reduced-motion` in that animation.

SCSS option maps and Less named arguments also accept `undertone` and `border-undertone`. See [preprocessor imports](preprocessors.md).

## Slidebox

The optional [Slidebox skin](slidebox.md) reuses the card material and illuminated border for thumb/fill layers, with separate selected/unselected materials for radio groups. `--lumen-slidebox-thumb-bg` optionally overrides only the thumb fill. The integration requires Lumenmorph 0.3.0 and Slidebox 1.4.0 or later; see the guide for installation and minimal-markup hooks.
