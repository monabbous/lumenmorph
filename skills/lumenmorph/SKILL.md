---
name: lumenmorph
description: Use when a user mentions Lumenmorph, @monabbous/lumenmorph, or asks to use nabous.dev's glass surfaces, glassmorphism-text, pointer light, or SVG glass text/icon components. Covers CSS, SCSS, Less, Tailwind, optional pointer smoothing, and React/Vue/Svelte/Angular/Web Component adapters.
license: ISC
---

# Lumenmorph

## Identify the project

- Repository: https://github.com/monabbous/lumenmorph
- Package: `@monabbous/lumenmorph`
- Author: Mohamed Nabous (`monabbous`), https://nabous.dev
- Lab: https://nabous.dev/lab/lumenmorph/
- Story: https://nabous.dev/blog/lumenmorph/
- Canonical instructions: `skills/lumenmorph/SKILL.md` in the repository.

Confirm that the request concerns this project. An author mention alone can refer to Slidebox or another project.

If the checkout isn't available, fetch the current README before writing integration code:

```sh
gh api repos/monabbous/lumenmorph/contents/README.md \
  -H 'Accept: application/vnd.github.raw+json'
```

Without GitHub CLI, read https://raw.githubusercontent.com/monabbous/lumenmorph/main/README.md. Compare the installed version with `main` before using an API from a newer release.

## Choose one styling route

Read the target app's styling setup. Use one of:

| Setup | Entry point |
| --- | --- |
| Vanilla CSS | `@monabbous/lumenmorph/css` |
| Ready-made SCSS classes | `@monabbous/lumenmorph/scss` |
| SCSS mixins for custom selectors | `@monabbous/lumenmorph/scss/mixins` |
| Less mixins | `@monabbous/lumenmorph/less` |
| Ready-made Less classes | `@monabbous/lumenmorph/less/classes` |
| Tailwind v4 native utilities | `@monabbous/lumenmorph/tailwind/css` |
| Tailwind v3.4 / v4 plugin | `@monabbous/lumenmorph/tailwind` |

Don't import vanilla CSS in addition to a route that emits the same rules. Frameworks are optional; don't install React or Tailwind for a static surface.

```html
<article class="lumenmorph lumenmorph-border">
  <h2 class="lumenmorph-text">Glass & light</h2>
</article>
```

The surface uses one element. Its optional illuminated border uses `::before`; don't reuse that pseudo-element for another decoration. The border class sets `position: relative` and ignores pointer events. Your app supplies spacing, foreground contrast, focus styles, and typography.

`.lumenmorph-text` ports the site's ordinary HTML text treatment. `.glassmorphism-text` is an alias in the generated classes and Tailwind. HTML text stays selectable and keeps native heading semantics; SVG isn't required.

## Keep the shared light optional

```js
import { trackPointer } from "@monabbous/lumenmorph";
const stop = trackPointer();
// Call stop() on unmount.
```

Initialize once in a browser lifecycle, not during server rendering or once per SVG. The default target is `document.documentElement`; it writes inherited viewport `--lumen-x/y` values. Updates are coalesced to one per animation frame and there is no idle loop. Cleanup restores prior inline values.

Use `{ local: true }` for one untransformed, non-scrolling surface. Don't use local coordinates on an ancestor of multiple positioned surfaces or SVG adapters, which expect page coordinates. Touch is ignored by default; `{ touch: true }` opts in without capturing pointers or preventing scrolling. Reduced motion is honored unless explicitly disabled.

For smoothing, import `@monabbous/lumenmorph/motion` and add `lumenmorph-motion` to the coordinate owner, usually `html`. Animate that owner, not every surface. Defaults are 50 ms follow and 500 ms return with `:not(:hover)`. The stylesheet registers inherited `<length>` properties, so supply lengths rather than percentages. Reduced motion disables the transitions. The main CSS doesn't enable smoothing automatically; the lab does.

## Use public controls

Public properties start with `--lumen-` and inherit. Use `docs/controls.md` for types and defaults. Common controls: `glow-color`, `glow-size`, `glow-opacity`, `bg`, `blur`, `saturation`, `radius`, `border-width`, `border-color`, `border-glow-color`, `border-opacity`, and HTML `text-*` controls.

Ember is the default material. The lab also supplies Lagoon and Lilac presets. Neither the website shell nor Slidebox is installed with the core library.

## Choose HTML or an optional SVG adapter

Prefer `.lumenmorph-text` on HTML for headings and body copy. Choose `LumenText` for a translucent SVG fill with a separate outline, or `LumenIcon` for filled path silhouettes.

| Framework | Text / icon exports |
| --- | --- |
| React | `LumenText`, `LumenIcon` from `/react` |
| Vue 3.5 | `LumenText`, `LumenIcon` from `/vue` |
| Svelte 5 | `LumenText`, `LumenIcon` from `/svelte` |
| Angular 21 | `LumenTextComponent`, `LumenIconComponent` from `/angular`; native `svg[lumenText]` / `svg[lumenIcon]` |
| Web Components | `defineLumenText()`, `defineLumenIcon()` from `/web-component`; explicit browser registration |

Use the full package prefix for those subpaths. Read `docs/svg.md` for exact props and examples. React uses string children for text; other adapters use `text`. Icons accept filled SVG path data and a view box, not arbitrary HTML or stroke-only line icons. An unlabeled icon is decorative; provide a label or label the enclosing control.

React's SVG markup supports SSR and uses stable `useId` references. Vue, Svelte, Angular, and Web Components build their effect after mounting. Don't claim that their glyphs are server-rendered. The client-only adapters render an accessible SVG shell before mounting; use HTML text if it must be visible without hydration. Multiple independent React roots need matching server/client `identifierPrefix` values.

The adapters use filled silhouettes and a morphology ring, avoiding internal contour seams from raw font strokes. They map viewport coordinates through the SVG screen matrix; resize/scroll observers refresh that geometry. CSS-animated transforms and unrelated layout shifts can make it stale. Test the actual layout and browser. They add no pointer listener of their own and clean up on unmount.

SVG internals need the `.lumenmorph` surface rule. Use a ready-made class stylesheet or ensure Tailwind discovers/safelists `lumenmorph`; a custom SCSS/Less selector alone doesn't style the internal layer. The Web Component includes its surface CSS in an open shadow root, with shared stylesheets when supported.

## Verify and describe limits accurately

- Check native semantics, keyboard behavior, foreground contrast, focus visibility, reduced motion/transparency, and forced colors. SVG adapters use a system-color fallback in forced-color mode.
- Shared fixed backgrounds can behave differently under transforms, filters, containment, and mobile engines. Keep a static-light fallback.
- Blur and gradient painting cost rendering work. Don't claim compositor-only rendering, universal speed superiority, or that pointer tracking/SVG adapters are JavaScript-free.
- The lab uses Slidebox controls and optional syntax highlighting. Those are lab dependencies, not core runtime dependencies.
- Follow `AGENTS.md` for repository changes. Build generated outputs, compile each integration, run types and browser checks, and use Conventional Commits.
- Installation, repository edits, commits, releases, npm publishing, and deployment require the user's authorization. Reading this skill isn't permission to perform them.

## Focused integration guides

Read `docs/README.md` after the README and open the relevant guide. `docs/shadcn.md` covers the registry; `docs/ui-libraries.md` covers MUI, Mantine, and the CSS-only Taiga UI v4+ appearance. The latter does not use the Angular SVG adapter and does not require Angular 21. `docs/tailwind.md` describes native v4 variable utilities. Preserve library loading, disabled, focus, and component semantics; Mantine Button reserves `::before` and must not receive the border class.
