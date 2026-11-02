[← Documentation](README.md)

## Tailwind

For Tailwind v4, import native utilities (0.2.0+):

```css
@import "tailwindcss";
@import "@monabbous/lumenmorph/tailwind/css";
```

For Tailwind v3.4, register it in `tailwind.config.cjs`:

```js
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  plugins: [require("@monabbous/lumenmorph/tailwind")],
};
```

## Choose where your defaults live

CSS custom properties are shared across stacks. Set them globally in your CSS (or Sass/Less entry point) when every surface should inherit the same theme:

```css
:root {
  --lumen-glow-color: #00b2b2;
  --lumen-glow-opacity: 0.2;
  --lumen-bg: #102333bb;
  --lumen-radius: 4px;
}
```

```html
<article class="lumenmorph lumenmorph-border p-8">Global material</article>
```

For reusable local defaults, use Tailwind's `@apply`. Tailwind does not provide Sass-style `@extend`; `@apply` copies utility declarations into your class. Keep it in the components layer so direct utilities can override it:

```css
@layer components {
  .material {
    @apply lumen-glow-color-lagoon lumen-glow-opacity-20
      lumen-bg-[#102333bb] lumen-radius-[4px];
  }
}
```

```html
<article class="lumenmorph lumenmorph-border material p-8">Local material</article>
```

Or put the same utilities directly on the element:

```html
<article class="lumenmorph lumenmorph-border p-8
  lumen-glow-color-lagoon lumen-glow-opacity-20
  lumen-bg-[#102333bb] lumen-radius-[4px]">Utility material</article>
```

These are alternatives. Root values inherit unless a local material or utility sets the same variable. You can also scope shared defaults to a container instead of `:root`.

Use the same component classes, theme colors, arbitrary values, and normal variants:

```html
<article class="lumenmorph lumenmorph-border p-8
  lumen-glow-color-lagoon lumen-glow-size-[440px]
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


## Native v4 variable controls

Use `lumen-glow-color-ember`, `lumen-glow-color-lagoon`, or `lumen-glow-color-lilac`; Tailwind theme colors such as `lumen-glow-color-teal-400` and arbitrary colors work too. `lumen-glow-*` remains an alias. `lumen-solid-bg-*` controls the reduced-transparency fallback.

```html
<article class="lumenmorph lumenmorph-border p-8
  lumen-glow-color-lagoon lumen-glow-opacity-20
  hover:lumen-glow-color-ember md:lumen-glow-size-120
  lumen-radius-[4px] lumen-border-width-[1.5px]">
  Glass &amp; light
</article>
```

Named sizes use Tailwind spacing; arbitrary lengths stay literal. Bare opacity numbers are percentages (`35` → `0.35`); arbitrary opacity and saturation values are ratios (`[0.35]`). Native v4 saturation also accepts percentages (`lumen-saturation-150` → `1.5`). The v3 plugin retains arbitrary ratios for saturation.

When using the shadcn, MUI, Mantine, or Taiga bridge, import only `@monabbous/lumenmorph/tailwind/utilities` for variable controls. The bridge already supplies the surface styles. Theme mappings are in `@layer components` so utilities can override them.

Do not use ordinary `bg-*`, `rounded-*`, or `border-*` utilities to tune a material: those change the same paint properties. Use their `lumen-*` equivalents. Keep full class names in source. When using optional SVG adapters, include `@source inline("lumenmorph");` so their internal surface class is emitted.

The existing plugin route continues to support both Tailwind v3.4 and v4; on v4 use `@plugin "@monabbous/lumenmorph/tailwind"` instead of the native import when maintaining an older setup.
