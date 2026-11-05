# Historical group-style references

The two `legacy-*.css` files are frozen pre-integration styles for before/after regression tests. They were moved out of the lab, not retained as a second production implementation.

Only `scripts/build-slidebox-tests.mjs` serves them in the ignored browser-test fixture directory. The main lab, gallery, editor runtime, and npm package must not import them. Their production replacement is the public `/slidebox` export.
