# Lab dependencies

The lab vendors files from `@monabbous/slidebox` 1.4.1, by Mohamed Nabous, under the ISC license: https://github.com/monabbous/slidebox. These files are copied from the pinned development dependency by `scripts/build.mjs`. The corresponding ISC notice is served as `public/lab/assets/slidebox-LICENSE`.

The lab's optional React example bundle includes React and React DOM, copyright Meta Platforms, Inc. and affiliates, under the MIT license. Esbuild preserves their notice comments in the bundle. Full licenses are served as `public/lab/assets/react-LICENSE` and `public/lab/assets/react-dom-LICENSE`.

Neither Slidebox nor the lab's bundled React runtime is included in Lumenmorph's npm package.

The lab's framework selector loads separate demo bundles on demand. Vue, Svelte, Angular, RxJS, and tslib license notices are preserved in those bundles and copied to `public/lab/assets/adapters/*-LICENSE`. Angular's example is linked ahead of time; the JIT compiler isn't shipped in the lab. These demo runtimes aren't included in the npm package.

The lab lazily loads highlight.js for code examples. Its BSD license is copied to `public/lab/assets/highlight-LICENSE`. Copy/check icon fonts come from the host's Font Awesome stylesheet; the standalone lab keeps text labels instead of adding another font dependency.
