import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";
const root = new URL("../", import.meta.url);
const output = new URL("public/__adapter-tests/", root);
await mkdir(output, { recursive: true });
await build({ entryPoints: [new URL("tests/ui-fixtures/libraries.jsx", root).pathname], outfile: new URL("libraries.js", output).pathname, bundle: true, format: "esm", define: { "process.env.NODE_ENV": '"production"' } });
await writeFile(new URL("libraries.html", output), '<!doctype html><html><head><link rel="stylesheet" href="./libraries.css"></head><body style="background:#152530"><div id="app"></div><script type="module" src="./libraries.js"></script></body></html>');
