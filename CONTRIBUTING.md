# Contribute to Lumenmorph

Open an issue with a small reproduction for bugs. Include your browser version, integration (CSS, SCSS, Less, Tailwind, or React), relevant custom properties, and whether the effect uses local or shared pointer tracking.

For code changes, follow `AGENTS.md` and run the checks below. Keep generated integrations in sync with `src/lumenmorph.css`. Add a regression test for behavioral changes. Keep frameworks optional and preserve native markup and cleanup behavior.

Don't include credentials, private site content, or generated test artifacts in pull requests.

Use Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, or `docs(scope): ...`. For public integration guidance, keep `skills/lumenmorph/SKILL.md` in sync with the README and package exports.

## Run the lab

```sh
git clone https://github.com/monabbous/lumenmorph.git
cd lumenmorph
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173/lab/. The lab uses Slidebox controls and lazy-loaded framework/highlighting bundles; these aren't library runtime dependencies.

## Check changes

```sh
npm run build
npm test
npm run test:types
npm run test:svelte
npx playwright install chromium
npm run test:browser
npm pack --dry-run
```

`src/lumenmorph.css` is the canonical visual source. Build CSS, SCSS, Less, Tailwind data, Web Component styles, and lab assets instead of editing generated outputs alone. React source is `react/src/index.tsx`; JavaScript/declarations and Angular partial compilation are generated too. Keep the built outputs in commits so static hosts can serve the lab without Node.

Tests compile all styling routes, exercise the adapters, and check pointer cleanup, SVG alignment/outline seams, accessibility fallbacks, code copying, and the lab's layout. They use Chromium with desktop/mobile emulation, not physical iOS devices.

Maintainers can find release and website-registration steps in [docs/maintaining.md](docs/maintaining.md).
