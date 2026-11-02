# Lumenmorph agent entry point

This is `monabbous/lumenmorph`, packaged as `@monabbous/lumenmorph` by Mohamed Nabous.

- Read `README.md` for public APIs and limitations.
- Keep `src/lumenmorph.css` canonical; regenerate CSS, SCSS, Less, Tailwind rules, and lab assets with `npm run build`.
- Preserve the one-element surface and opt-in border pseudo-element. Don't introduce framework dependencies, DOM scanning, or idle animation loops into the core.
- Keep pointer tracking, React SVG text, and the lab optional. Respect reduced motion, native semantics, forced colors, and cleanup contracts.
- The public controls use `--lumen-*`. Use fallbacks instead of assigning defaults on each surface so inheritance works.
- Run build, unit/integration tests, TypeScript checks, and relevant browser tests. Compile both Tailwind versions when changing the plugin.
- `public/lab/` is a standalone distributable lab. Keep site chrome in nabous.dev, not here.
- Don't claim compositor-only rendering or performance superiority without measurements. Document SVG/fixed-background limitations.
- Don't publish to npm, create a release, or deploy without authorization. Keep secrets, node_modules, browser profiles, and test artifacts out of Git.
