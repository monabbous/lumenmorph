# Lab dependencies

The lab vendors files from `@monabbous/slidebox` 1.4.1, by Mohamed Nabous, under the ISC license: https://github.com/monabbous/slidebox. These files are copied from the pinned development dependency by `scripts/build.mjs`. The corresponding ISC notice is served as `public/lab/assets/slidebox-LICENSE`.

The lab's optional React example bundle includes React and React DOM, copyright Meta Platforms, Inc. and affiliates, under the MIT license. Esbuild preserves their notice comments in the bundle. Full licenses are served as `public/lab/assets/react-LICENSE` and `public/lab/assets/react-dom-LICENSE`.

Neither Slidebox nor the lab's bundled React runtime is included in Lumenmorph's npm package.

The lab's framework selector loads separate demo bundles on demand. Vue, Svelte, Angular, RxJS, and tslib license notices are preserved in those bundles and copied to `public/lab/assets/adapters/*-LICENSE`. Angular's example is linked ahead of time; the JIT compiler isn't shipped in the lab. These demo runtimes aren't included in the npm package.

The lab lazily loads highlight.js for code examples. Its BSD license is copied to `public/lab/assets/highlight-LICENSE`.

The standalone lab vendors Font Awesome Free 6.5.1 fonts/CSS and a lazy SVG icon catalog covering its solid, regular, and brands sets. Font Awesome icons use CC BY 4.0, fonts use SIL OFL 1.1, and code uses MIT; the full notice is served as `public/lab/assets/fontawesome/LICENSE.txt`. See https://fontawesome.com/license/free. Brand icons remain trademarks of their owners. These lab assets are not part of Lumenmorph's npm runtime.

The lab's browser-support table is a reduced snapshot of Caniuse data, copyright Alexis Deveria and contributors, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original data](https://github.com/Fyrd/caniuse). The snapshot records the source commit and retrieval date and preserves full/partial feature-level usage percentages; app labels are shortened. `npm run update:support` refreshes it explicitly. Ordinary builds and page visits make no support-data network requests. The table is not an end-to-end browser-compatibility guarantee.
