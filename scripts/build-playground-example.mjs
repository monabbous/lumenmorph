import { mkdir, readFile, writeFile } from "node:fs/promises";
import { playgroundDocument, cardMarkup, previewLayout } from "../public/lab/playground-example.mjs";

const root = new URL("../public/lab/", import.meta.url);
await mkdir(new URL("playground/", root), { recursive: true });
await writeFile(new URL("playground/index.html", root), playgroundDocument());
await writeFile(new URL("playground-layout.css", root), previewLayout);
const lab = new URL("index.html", root);
const source = await readFile(lab, "utf8");
await writeFile(lab, source.replace(/<!-- Playground example: begin -->[\s\S]*?<!-- Playground example: end -->/, `<!-- Playground example: begin -->\n${cardMarkup()}\n<!-- Playground example: end -->`));
console.log("Built the star-card export from the same markup and layout as the lab.");
