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
| `--lumen-blur` | `32px` | Backdrop blur length; use `0px` to disable blur |
| `--lumen-saturation` | `1.6` | Backdrop saturation ratio; 1 leaves it unchanged |
| `--lumen-radius` | `0.25rem` | Border radius |
| `--lumen-border-width` | `1.5px` | Border width; use `0px` to remove it |
| `--lumen-border-color` | `#ffffff30` | Static edge color |
| `--lumen-border-glow-color` | Glow color, or `#ffd4a3` | Independent illuminated edge color |
| `--lumen-border-opacity` | `0.9` | Edge intensity, number from 0 to 1 |
| `--lumen-text-color` | `#ffffffb3` | Translucent HTML text color |
| `--lumen-text-glow-size` | Glow size, or `80vmax` | HTML text glow radius |
| `--lumen-text-glow-opacity` | `1` | HTML text glow intensity, number from 0 to 1 |
| `--lumen-text-stroke-width` | `2px` | Transparent HTML text stroke width |
| `--lumen-x` / `--lumen-y` | `50vw` / `35vh` | Shared viewport light coordinates |
| `--lumen-attachment` | `fixed` | Background attachment; helper sets `scroll` in local mode |
| `--lumen-space` | `100vw 100vh` | Background sizing; helper sets `100% 100%` in local mode |

Glow colors can include alpha; that alpha combines with the intensity. To override the text effect's highlight independently, set `--lumen-glow-color` on the text element.

The optional [Slidebox skin](slidebox.md) uses the hosted lab's defaults instead of the core defaults above. It also accepts `--lumen-slidebox-thumb-bg` to override the opaque thumb and selected-indicator color. The skin is currently unreleased.
