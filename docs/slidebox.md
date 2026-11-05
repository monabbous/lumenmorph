[← Documentation](README.md)

# Style Slidebox like the lab

The optional `@monabbous/lumenmorph/skins/slidebox` stylesheet applies the card material to switch thumbs and range fill, including its translucent background, blur, shared light, and actual illuminated thumb border. Radio groups use the lab's translucent selected/unselected materials. Geometry and motion stay in Slidebox; Lumenmorph reuses its canonical surface and border paint instead of implementing another switch.

The stylesheet lives in `skins/slidebox.css`; the `.css` import suffix is optional. The original `@monabbous/lumenmorph/slidebox` path remains a compatibility alias. The `/skins/slidebox` path is new in the next release; use the original alias with published versions through 0.3.1.

The build copies this exact file to `public/lab/skins/slidebox.css` for the standalone lab and gallery, and embeds it unchanged in the editor runtime. There is no separate lab skin definition.

The skin requires Lumenmorph 0.3.0 and Slidebox 1.4.0 or later. The persistent thumb/fill tint is available in Lumenmorph 0.3.1:

```sh
npm install @monabbous/lumenmorph@^0.3.0 @monabbous/slidebox@^1.4.0
```

Choose one Slidebox styling route, then import the skin after it. You do not need the main Lumenmorph stylesheet unless you also use ordinary glass surfaces or SVG adapters.

In the [lab](https://nabous.dev/lab/lumenmorph/?stack=slidebox#integrations), choose **Slidebox** to see copyable installation, import-order, native markup, and color examples. The optional experimental range example is separate from the default switch/group setup.

Keep the standard `slidebox`, `slidebox-group`, and `slidebox-range` classes even if you generate Slidebox's base rules through Sass, Less, or Tailwind. Do not import a second copy of the base component styles.

## Style a switch

```js
import "@monabbous/slidebox/dist/css/slidebox.css";
import "@monabbous/lumenmorph/skins/slidebox";
```

```html
<label>
  <input type="checkbox" class="slidebox lumenmorph-slidebox" data-slidebox-thumb-layers name="notifications">
  Enable notifications
</label>
```

Alternatively, put `lumenmorph-slidebox` on an ancestor to style its Slidebox controls. Controls outside that scope retain their original appearance.

`data-slidebox-thumb-layers` gives the same input two co-located pseudo-elements. Slidebox owns their shared geometry and margin transitions; the skin paints `::before` as the card fill and `::after` as the masked illuminated border. It adds no DOM nodes and needs no JavaScript. Without that attribute, the thumb keeps a static border fallback.

## Style grouped radios

Also import Slidebox's group stylesheet:

```js
import "@monabbous/slidebox/dist/css/slidebox.css";
import "@monabbous/slidebox/dist/css/group.css";
import "@monabbous/lumenmorph/skins/slidebox";
```

```html
<div class="slidebox-group lumenmorph-slidebox" role="group" aria-label="Period">
  <label><input type="radio" name="period" value="day" checked><span>Day</span></label>
  <label><input type="radio" name="period" value="week"><span>Week</span></label>
  <label><input type="radio" name="period" value="month"><span>Month</span></label>
</div>
```

The skin paints the shared sliding indicator where CSS anchor positioning is supported. Other browsers keep Slidebox's per-segment highlight. Native arrow-key selection, disabled states, focus outlines, and form values remain Slidebox-owned.

Groups match the Lumenmorph lab's material picker: an 18%-accent selected tint with 12px blur, a softly lit inset edge, and a faint outer glow. Unselected segments use a 2.5%-accent tint with 2px blur. Group corners default to 4px; `--slidebox-radius` and `--lumen-radius` still override them. The accent uses your inherited `--lumen-glow-color` or `--slidebox-on`, falling back to Ember.

The main lab uses this generated stylesheet for all five radio groups, its pointer-option switches, and its experimental ranges. The specimen, header, and thumb/fill layers share the card material. Slidebox still owns control shape and dimensions. `material-picker-layout.css` contains layout and public palette configuration only. Gallery groups and the editor/export runtime consume the same exported stylesheet too; there is no separate lab skin implementation.

## Style an experimental range

Slidebox ranges remain experimental. Import their stylesheet explicitly:

```js
import "@monabbous/slidebox/experimental/range.css";
import "@monabbous/lumenmorph/skins/slidebox";
```

```html
<label for="intensity">Intensity</label>
<input id="intensity" type="range" class="slidebox-range lumenmorph-slidebox"
  name="intensity" min="0" max="100" value="40">
```

For card-material fill and the full illuminated thumb border, opt into the shared layers after mounting:

```js
import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from "@monabbous/slidebox/experimental/range.mjs";

const input = document.querySelector("#intensity");
const stopRange = enhanceSlideboxRange(input, { layers: true });
const stopFill = enhanceSlideboxRangeFill(input);

// On unmount:
// stopRange();
// stopFill();
```

This reuses Slidebox's existing two decorative, `aria-hidden` spans. The fill and border are pseudo-elements, not additional nodes. The native input continues to own its value, hit area, keyboard behavior, and events. The helper has no idle animation loop. It updates on input, scrolling, and input/document resizing; call `stopRange.refresh()` after other programmatic position or theme changes. Call cleanup before unmounting or changing enhancement options.

Set layered-range material variables on a shared ancestor, such as your existing settings container or label, so the decorative sibling inherits the same theme as the input. This avoids an integration-specific variable-copying or motion implementation.

The stylesheet does not initialize helpers. Without layers mode, ranges retain native progress paint and a static thumb-outline fallback. The lab explicitly enables layers and fill in `lab.mjs`; reduced motion keeps the decoration static, and forced colors restore the native visual.

## Match the lab colors

Set Slidebox's public color variables on your scope. These are the lab's teal preset colors; geometry stays under your control:

```css
.settings {
  --slidebox-track: #2a5b7c;
  --slidebox-border: #5289a6;
  --slidebox-off: #e8f6fa;
  --slidebox-on: #00b2b2;
  --slidebox-text: #e8f6fa;
  --slidebox-selected-text: #fff;
  --slidebox-size: 28px;
}
```

Add both `settings` and `lumenmorph-slidebox` to your container. Switch and range material comes from `--lumen-*`, like a card; Slidebox colors continue to supply focus, native fallbacks, and foregrounds. Groups default to the lab's dark glass material with an Ember accent. Set readable `--slidebox-text` and `--slidebox-selected-text` values for your page's background.

For the Lumenmorph lab's Ember groups, override the group separately:

```css
.settings .slidebox-group {
  --slidebox-track: #063c5940;
  --slidebox-border: #5289a6;
  --slidebox-on: #ffaa71;
  --lumen-glow-color: #ffaa71;
  --slidebox-size: 40px;
  --slidebox-spacing: .1;
  --slidebox-radius: 4px;
}
```

Thumb and fill paint uses the canonical surface treatment from [controls](controls.md), with the checked group's 18% accent tint and translucent blue-green base so small controls remain visible away from the pointer light. The accent follows `--lumen-glow-color`, falling back to `--slidebox-on` and then Ember. Inherited `--lumen-bg` replaces the base underneath the tint. No lab-only styling or extra configuration is required. Set `--lumen-slidebox-tint` to a percentage to adjust the base tint (`0%` removes the accent). `--lumen-slidebox-thumb-bg` optionally overrides only the thumb fill; the reduced-transparency fallback uses `--lumen-solid-bg`. Blur, light, and illuminated borders still use the inherited card controls. Slidebox's public size, spacing, and radius still control native geometry. Groups keep their selected/unselected material defaults described above.

## Add pointer light

Switch/group skinning is CSS-only. Full range decoration uses the explicit helper above; a static light needs no pointer-tracking script. To move the light, initialize the optional tracker once in a browser lifecycle and call its cleanup function when the page or component unmounts:

```js
import { trackPointer } from "@monabbous/lumenmorph";

const stopLight = trackPointer();
// Call stopLight() when your page or component unmounts.
```

Keep page coordinates for a scope containing multiple controls. Do not use local tracking on their shared ancestor. Reduced transparency removes blur and supplies an opaque track. Forced-color mode bypasses the skin and retains Slidebox's system-color fallback. Slidebox's reduced-motion rules remain unchanged. Test your target browsers: transforms, filters, and mobile engines can affect shared fixed backgrounds.
