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

// Keep pixel regressions independent of the lab's navigation and sticky layout.
await writeFile(new URL("masking.html", output), `<!doctype html><html><head>
<link rel="stylesheet" href="../lab/assets/lumenmorph.css">
<style>
body { background:#152530; color:white; font-family:monospace; --lumen-blur:32px; --lumen-saturation:1.6; }
#react-demo { max-width:640px; } #react-demo svg { display:block; width:100%; height:auto; }
.main-card { width:200px; height:80px; }
</style></head><body>
<div id="header-demo" hidden></div><div id="react-demo"></div><div id="icon-demo"></div>
<div class="main-card lumenmorph">Ordinary glass surface</div>
<script type="module">
const name = new URLSearchParams(location.search).get("adapter");
if (["react", "vue", "svelte", "angular", "web-component"].includes(name)) {
  const path = name === "react" ? "react-demo.mjs" : "adapters/" + name + ".mjs";
  const adapter = await import("../lab/assets/" + path);
  await adapter.mountDemo(document.querySelector("#react-demo"), { text:"Lumenmorph", width:640, height:130, fontSize:88, strokeWidth:1.5 });
  await adapter.mountIconDemo(document.querySelector("#icon-demo"), { paths:"M18 12Q14 10 14 15v34q0 5 4 3l36-19q4-2 0-4Z", width:112, height:112, strokeWidth:1, label:"Play" });
  document.querySelector("#react-demo").dataset.framework = name;
}
</script></body></html>`);
