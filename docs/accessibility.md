[← Documentation](README.md)

## Accessibility and browser support

- Keep native buttons, links, and headings. The CSS doesn't replace semantics or input behavior. Supply visible focus styles and sufficient text contrast over every background.
- The border pseudo-element ignores pointer events. The border class sets `position: relative`; override it if your layout needs another positioning mode. Don't reuse its `::before` for unrelated decoration.
- Modern browsers with `color-mix()` get the radial light; older browsers keep the flat tint, static border, and readable text. Without `backdrop-filter`, the tint and glow remain, but the background isn't blurred. The enhanced edge requires mask compositing support.
- `prefers-reduced-transparency` removes surface blur and uses `--lumen-solid-bg`. Forced-color mode restores system surface/text colors and hides the illuminated border. OS support for reduced transparency varies.
- The tracker honors reduced motion by default and ignores touch by default. It never requests device-orientation permissions.
- Shared viewport light uses fixed-attachment backgrounds. Transforms, filters, containment, SVG compositing, and mobile engines can change fixed-background behavior. Use a static light or local mode on one untransformed surface when shared alignment isn't reliable.
- Blur and radial gradients require rendering work. Small JavaScript and low markup don't imply compositor-only rendering or a speed advantage over other glass effects. Avoid many overlapping, full-screen blurred surfaces; test real devices.

Automated browser checks use desktop Firefox, desktop and mobile-emulated Chromium, plus WebKit for SVG masking and coordinate isolation. Desktop Firefox checks do not verify Firefox Android. Test your target browsers and physical devices, especially for SVG compositing and fixed backgrounds.
