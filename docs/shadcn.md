[← Documentation](README.md)

# shadcn/ui

For an existing shadcn project using Tailwind v4 and full CSS color tokens (`--card`, `--primary`, etc.). Older HSL-channel-only themes need conversion to complete colors first.

The registry copies editable components into your project. Card and Button compose your existing shadcn components, preserving props, refs, and native behavior. Only the material changes. Choose `tone="theme"` (default), `"ember"`, `"lagoon"`, or `"lilac"`.

Requires Lumenmorph 0.2.0 or later and Tailwind v4.

```bash
npx shadcn@latest add https://nabous.dev/lab/lumenmorph/r/lumen-card.json https://nabous.dev/lab/lumenmorph/r/lumen-button.json
```

```tsx
import { LumenCard } from "@/components/ui/lumen-card";
import { LumenButton } from "@/components/ui/lumen-button";
import { CardContent } from "@/components/ui/card";

export function Preview() {
  return (
    <LumenCard tone="lagoon" className="lumen-glow-opacity-20">
      <CardContent>
        <p>Your content, your theme.</p>
        <LumenButton tone="ember">Explore</LumenButton>
      </CardContent>
    </LumenCard>
  );
}
```

Install only what you need:

```sh
# Base CSS and theme mapping, without React components
npx shadcn@latest add https://nabous.dev/lab/lumenmorph/r/lumenmorph.json

# Optional pointer light
npx shadcn@latest add https://nabous.dev/lab/lumenmorph/r/lumen-pointer.json
```

Mount `<LumenPointer />` once in your layout. It renders no wrapper and handles cleanup. Do not combine it with another pointer tracker on `html`. `smooth={false}` disables smoothing; reduced motion and touch retain static light.

The base item imports core CSS and native Tailwind variable utilities. It maps your shadcn colors and radius only inside `.lumenmorph-theme`; it does not replace `:root`, dark-mode tokens, or existing components. The material owns background, border, radius, and `::before`. Use `lumen-bg-*`, `lumen-radius-*`, and other [variable utilities](tailwind.md) to customize those properties.

For a project with an existing global pointer tracker, share `--lumen-x` and `--lumen-y` rather than mounting another. Review CLI changes as you would any shadcn registry item; existing custom Card/Button implementations remain the source of their behavior.
