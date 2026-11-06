# Lab dependencies

The lab vendors files from `@monabbous/slidebox` 1.4.1, by Mohamed Nabous, under the ISC license: https://github.com/monabbous/slidebox. These files are copied from the pinned development dependency by `scripts/build.mjs`. The corresponding ISC notice is served as `public/lab/assets/slidebox-LICENSE`.

The lab's optional React example bundle includes React and React DOM, copyright Meta Platforms, Inc. and affiliates, under the MIT license. Esbuild preserves their notice comments in the bundle. Full licenses are served as `public/lab/assets/react-LICENSE` and `public/lab/assets/react-dom-LICENSE`.

Neither Slidebox nor the lab's bundled React runtime is included in Lumenmorph's npm package.

The lab's framework selector loads separate demo bundles on demand. Vue, Svelte, Angular, RxJS, and tslib license notices are preserved in those bundles and copied to `public/lab/assets/adapters/*-LICENSE`. Angular's example is linked ahead of time; the JIT compiler isn't shipped in the lab. These demo runtimes aren't included in the npm package.

The lab lazily loads highlight.js for code examples. Its BSD license is copied to `public/lab/assets/highlight-LICENSE`.

The standalone lab vendors Font Awesome Free 6.5.1 fonts/CSS and a lazy SVG icon catalog covering its solid, regular, and brands sets. Font Awesome icons use CC BY 4.0, fonts use SIL OFL 1.1, and code uses MIT; the full notice is served as `public/lab/assets/fontawesome/LICENSE.txt`. See https://fontawesome.com/license/free. Brand icons remain trademarks of their owners. These lab assets are not part of Lumenmorph's npm runtime.

The lab's browser-support dialog uses a reduced snapshot of Caniuse data, copyright Alexis Deveria and contributors, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original data](https://github.com/Fyrd/caniuse). The snapshot records the source commit and retrieval date. Individual feature percentages are retained; the combined percentage is calculated by intersecting support for the four tracked CSS features at each browser/version and summing its global usage weight once, never by averaging feature percentages. Browser rows use the most-used recorded version per family (latest listed for zero-usage families); the combined percentage includes all recorded versions. App labels are shortened. `npm run update:support` refreshes it explicitly. Ordinary builds and page visits make no support-data network requests. Color mixing, SVG-specific behavior, and rendering bugs are outside this metric; it is not an end-to-end compatibility guarantee.
