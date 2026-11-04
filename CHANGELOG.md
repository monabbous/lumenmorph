# Changelog

## 0.3.0 - 2026-11-04

- Add the optional `@monabbous/lumenmorph/slidebox` skin for switches, grouped radios, and experimental ranges. Keep native input behavior, Slidebox geometry and motion, and optional range helpers.
- Match radio groups to the Lumenmorph lab's translucent selected and unselected materials. Use the exported skin in all five main-lab groups without changing their settled appearance.
- Add a Slidebox setup choice to the lab with copyable installation, imports, native markup, colors, and optional range examples. Document the integration, inherited controls, and accessibility fallbacks.

## 0.2.2 - 2026-11-04

- Fix SVG text shifting downward and clipping descenders in Firefox when an earlier fallback font has different vertical metrics. All five adapters now default to `dominant-baseline="middle"`; explicit text positioning still works.
- Add a bundled fallback-font regression fixture and desktop Firefox CI coverage. Verify the clipping fix on physical Android Firefox and Chrome; the separately reported exposed-layer corruption remains unreproduced.

## 0.1.0 - 2026-11-02

- Extract glass surfaces, illuminated borders, and HTML glass text into CSS, SCSS, Less, and Tailwind integrations.
- Add optional shared pointer tracking with cleanup and 50 ms follow / 500 ms return smoothing.
- Add SVG text and filled-path icons for React, Vue, Svelte, Angular, and Web Components. React source uses TSX.
- Fix SVG coordinate mapping and internal glyph contour lines. Include forced-color fallbacks.
- Add a lab with Slidebox controls, separate foundation/component examples, lazy-loaded code highlighting, and per-block copy buttons.
- Add the centered 16:9 recording to the README and article cover, also used by the blog/lab listing thumbnails.
- Publish the public Lumenmorph agent skill with integration and browser-support guidance.
