import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { build } from "esbuild";
import { compile } from "svelte/compiler";

const root = new URL("../", import.meta.url);
const output = new URL("public/__adapter-tests/", root);
await mkdir(output, { recursive: true });
execFileSync(new URL("node_modules/.bin/ngc", root).pathname, ["-p", "tests/adapter-fixtures/tsconfig.json"], { cwd: root, stdio: "inherit" });
for (const name of ["vue", "svelte", "angular", "web-component"]) {
  const entry = name === "angular" ? "tests/.generated-angular/angular.js" : `tests/adapter-fixtures/${name}.mjs`;
  await build({
    entryPoints: [new URL(entry, root).pathname], outfile: new URL(`${name}.mjs`, output).pathname,
    bundle: true, format: "esm", platform: "browser", conditions: ["browser", "svelte"],
    define: { "process.env.NODE_ENV": '"production"', "ngDevMode": "false" },
    plugins: [{ name: "svelte", setup(builder) {
      builder.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const { js } = compile(source, { generate: "client", filename: path, css: "external" });
        return { contents: js.code, loader: "js", resolveDir: dirname(path) };
      });
    } }],
  });
}
await writeFile(new URL("index.html", output), `<!doctype html><html><head><link rel="stylesheet" href="../lab/assets/lumenmorph.css"></head><body style="background:#063c59;color:white;font-family:monospace"><div id="app"></div><script type="module">const name=new URLSearchParams(location.search).get("adapter"); if(["vue","svelte","angular","web-component"].includes(name)){ const script=document.createElement("script"); script.type="module"; script.src="./"+name+".mjs"; document.body.append(script); }</script></body></html>`);
console.log("Built isolated Vue, Svelte, Angular, and Web Component browser fixtures (not shipped).");
