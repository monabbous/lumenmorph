import { mkdir, readFile, copyFile } from "node:fs/promises";
import { dirname } from "node:path";
import { build } from "esbuild";
import { transformAsync } from "@babel/core";
import linker from "@angular/compiler-cli/linker/babel";
import { compile } from "svelte/compiler";

const root = new URL("../", import.meta.url);
const output = new URL("public/lab/assets/adapters/", root);
await mkdir(output, { recursive: true });
for (const name of ["vue", "svelte", "angular", "web-component"]) {
  await build({
    entryPoints: [new URL(`lab/adapters/${name}.mjs`, root).pathname], outfile: new URL(`${name}.mjs`, output).pathname,
    bundle: true, minify: true, format: "esm", platform: "browser", conditions: ["browser", "svelte"],
    define: { "process.env.NODE_ENV": '"production"', ngDevMode: "false" },
    plugins: [
      { name: "svelte", setup(builder) {
        builder.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
          const { js } = compile(await readFile(path, "utf8"), { generate: "client", filename: path, css: "external" });
          return { contents: js.code, loader: "js", resolveDir: dirname(path) };
        });
      } },
      { name: "angular-linker", setup(builder) {
        builder.onLoad({ filter: /(?:node_modules\/@angular\/|\/angular\/dist\/).*\.(?:mjs|js)$/ }, async ({ path }) => {
          const linked = await transformAsync(await readFile(path, "utf8"), { filename: path, plugins: [[linker, { jitMode: false }]], configFile: false, babelrc: false });
          return { contents: linked.code, loader: "js", resolveDir: dirname(path) };
        });
      } },
    ],
  });
}
for (const [name, directory] of Object.entries({ vue: "vue", svelte: "svelte", angular: "@angular/core", rxjs: "rxjs", tslib: "tslib" })) {
  let found = false;
  for (const filename of ["LICENSE", "LICENSE.md", "LICENSE.txt", "CopyrightNotice.txt"]) {
    try {
      await copyFile(new URL(`node_modules/${directory}/${filename}`, root), new URL(`${name}-LICENSE`, output));
      found = true; break;
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  if (!found) throw new Error(`Missing lab dependency license: ${directory}`);
}
console.log("Built lazy-loaded lab adapters; Angular is linked ahead of time (no JIT compiler bundle).");
