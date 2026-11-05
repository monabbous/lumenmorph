# Changelog

## 0.3.1 - 2026-11-05

- Give switch thumbs and range fill a persistent accent base matching the checked radio-group tint, keeping controls visible away from the pointer light.
- Apply the same skin in the installable export, lab, gallery, and editor. Keep translucency, illuminated borders, native geometry, and accessibility fallbacks.
- Add the optional inherited `--lumen-slidebox-tint` percentage; the default is 18% and needs no configuration.

## 0.3.0 - 2026-11-05

- Add the optional `@monabbous/lumenmorph/slidebox` skin for switches, grouped radios, and experimental ranges. Keep native input behavior, Slidebox geometry and motion, and optional range helpers.
- Reuse card background/blur/light for thumbs and range fill, and the canonical masked border for thumb illumination. Shared Slidebox hooks keep checkboxes to one input/two pseudos and reuse the existing two range-helper spans, without copying motion logic.
- Match radio groups to the Lumenmorph lab's translucent selected and unselected materials. Use the exported skin in all five main-lab groups without changing their settled appearance, and apply its glass tracks/thumbs to the lab's switches and ranges while retaining native motion/fill behavior.
- Add a Slidebox setup choice to the lab with copyable installation, imports, native markup, colors, and optional range examples. Document the integration, inherited controls, and accessibility fallbacks.
- Reuse the public skin in the gallery and editor/export runtime as well as the main lab. Remove production copies of the old group paint; retain frozen historical CSS only for regression tests.

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
