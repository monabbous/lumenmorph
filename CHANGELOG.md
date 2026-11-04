# Changelog

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
