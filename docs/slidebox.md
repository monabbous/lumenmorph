[← Documentation](README.md)

# Style Slidebox like the lab

The optional `@monabbous/lumenmorph/slidebox` stylesheet combines the hosted Slidebox lab's switch/range skin with the glassy radio groups from the Lumenmorph lab. Switches keep 40%-alpha tracks, opaque thumbs, shared pointer light, and an illuminated border. Groups use translucent selected highlights and faint glass on unselected segments, not opaque colored pills. The skin leaves Slidebox's geometry, elastic motion, labels, and native input behavior intact. It does not include the site's layout or fonts.

The `/slidebox` export is unreleased and is not included in Lumenmorph 0.2.2. Until the next npm release, install the integration branch:

```sh
npm install github:monabbous/lumenmorph#feat/slidebox-integration @monabbous/slidebox
```

The skin is tested with Slidebox 1.3.2. Choose one Slidebox styling route, then import the skin after it. You do not need the main Lumenmorph stylesheet unless you also use ordinary glass surfaces or SVG adapters.

Keep the standard `slidebox`, `slidebox-group`, and `slidebox-range` classes even if you generate Slidebox's base rules through Sass, Less, or Tailwind. Do not import a second copy of the base component styles.

## Style a switch

```js
import "@monabbous/slidebox/dist/css/slidebox.css";
import "@monabbous/lumenmorph/slidebox";
```

```html
<label>
  <input type="checkbox" class="slidebox lumenmorph-slidebox" name="notifications">
  Enable notifications
</label>
```

Alternatively, put `lumenmorph-slidebox` on an ancestor to style its Slidebox controls. Controls outside that scope retain their original appearance.

## Style grouped radios

Also import Slidebox's group stylesheet:

```js
import "@monabbous/slidebox/dist/css/slidebox.css";
import "@monabbous/slidebox/dist/css/group.css";
import "@monabbous/lumenmorph/slidebox";
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

## Style an experimental range

Slidebox ranges remain experimental. Import their stylesheet explicitly:

```js
import "@monabbous/slidebox/experimental/range.css";
import "@monabbous/lumenmorph/slidebox";
```

```html
<label for="intensity">Intensity</label>
<input id="intensity" type="range" class="slidebox-range lumenmorph-slidebox"
  name="intensity" min="0" max="100" value="40">
```

The skin does not start dragging, range motion, or progress-fill helpers. If you opt into those helpers separately, Slidebox keeps ownership of the progress-fill background and native thumb hit area. Filled tracks retain that fill rather than replacing it with the pointer gradient. Animated overlay thumbs use the helper's existing opaque color.

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

Add both `settings` and `lumenmorph-slidebox` to your container. Switches and ranges use Slidebox's system-color defaults when you do not override them. Groups default to the lab's dark glass material with an Ember accent; Slidebox still owns their foreground colors. Set readable `--slidebox-text` and `--slidebox-selected-text` values for your page's background.

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

Switches and ranges use the hosted treatment's defaults: 40px blur, saturation 1, 30vmax glow radius, 0.1 glow opacity, a 1px switch border at 25% of the Slidebox border color, and 0.3 border-light opacity. Groups use the separate selected/unselected material defaults described above. Override these with inherited `--lumen-*` controls. `--lumen-bg` and `--lumen-solid-bg` customize the material; `--lumen-slidebox-thumb-bg` overrides switch and native range thumbs without changing their geometry. Without that override, switch thumbs use `--slidebox-off` and `--slidebox-on` for their respective states.

## Add pointer light

The skin is CSS-only. A static light needs no JavaScript. To move the light, initialize the optional tracker once in a browser lifecycle and call its cleanup function when the page or component unmounts:

```js
import { trackPointer } from "@monabbous/lumenmorph";

const stopLight = trackPointer();
// Call stopLight() when your page or component unmounts.
```

Keep page coordinates for a scope containing multiple controls. Do not use local tracking on their shared ancestor. Reduced transparency removes blur and supplies an opaque track. Forced-color mode bypasses the skin and retains Slidebox's system-color fallback. Slidebox's reduced-motion rules remain unchanged. Test your target browsers: transforms, filters, and mobile engines can affect shared fixed backgrounds.
