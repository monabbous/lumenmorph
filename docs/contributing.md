[← Documentation](README.md)

## Contributing

Contributions are welcome. For setup, tests, and source-generation rules, read [CONTRIBUTING.md](https://github.com/monabbous/lumenmorph/blob/main/CONTRIBUTING.md). Include a small reproduction and browser version when reporting a bug.


## Editing the example collection

The main lab links to `public/lab/examples/`, a standalone collection of 24 studies. Each study has a shareable directory with a live HTML/CSS/JavaScript editor, a downloadable HTML file, and an optional CodePen export. Editors provide syntax highlighting, autocomplete, and automatic Prettier formatting when leaving an editor. Format immediately with the Format button or Shift+Alt+F. Incomplete syntax stays untouched. Edits remain in the current tab; share links open the published example.

Edit card markup in `public/lab/examples/index.html`, styling in `public/lab/showcase.css`, and interactions in `public/lab/example-behaviors.mjs`. Run `npm run build:lab` to regenerate example pages, formatted sources, and 1200 × 630 social images, including the main lab’s collection thumbnail. Preview generation requires Playwright Chromium (`npx playwright install chromium`); it renders actual card markup without network access and skips unchanged images. Commit generated files with their sources. CI checks that the pages and preview manifest are current.

The editor runs user code in an opaque-origin iframe with scripts enabled and network requests blocked. Its bundled runtime includes Lumenmorph and Slidebox. CodeMirror, Prettier, and Font Awesome are served locally; formatting loads on demand. The host site adds its navigation and resolves each page's `lab:title` and `lab:image` metadata.

Browser tests pin Playwright to 1.63.0 because 1.64.x ships a Linux WebKit regression that stalls pages with multiple backdrop filters on CI runners ([upstream issue #43426](https://github.com/microsoft/playwright/issues/43426)). Upgrade the pin once a stable release includes WebKit r2373 or later; keep the gallery tests and blur effects enabled.
