import { readFile, readdir, writeFile } from "node:fs/promises";

const base = new URL("../node_modules/@fortawesome/fontawesome-free/", import.meta.url);
const metadata = JSON.parse(await readFile(new URL("metadata/icon-families.json", base), "utf8"));
const icons = [];
for (const style of ["solid", "regular", "brands"]) {
  for (const file of (await readdir(new URL(`svgs/${style}/`, base))).filter(file => file.endsWith(".svg")).sort()) {
    const name = file.slice(0, -4);
    const source = await readFile(new URL(`svgs/${style}/${file}`, base), "utf8");
    const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
    const paths = [...source.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(match => match[1]);
    if (!viewBox || !paths.length) throw new Error(`Missing SVG geometry: ${style}/${name}`);
    const info = metadata[name];
    icons.push({ id: `${style}/${name}`, name, label: info?.label ?? name, style, viewBox, path: paths.join(" "), terms: [...(info?.search?.terms ?? []), ...(info?.aliases?.names ?? [])].join(" ") });
  }
}
const popular = ["star", "heart", "bell", "house", "user", "gear", "magnifying-glass", "code", "check", "play", "github", "camera", "circle-check", "bolt", "envelope", "palette", "sliders", "bookmark", "calendar", "folder", "music", "cloud", "circle-user", "download"];
const rank = name => popular.includes(name) ? popular.indexOf(name) : popular.length;
icons.sort((a, b) => rank(a.name) - rank(b.name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
await writeFile(new URL("../public/lab/assets/fontawesome-icons.json", import.meta.url), JSON.stringify({ version: "6.5.1", license: "https://fontawesome.com/license/free", icons }) + "\n");
const github = icons.find(icon => icon.id === "brands/github");
if (!github) throw new Error("Missing default GitHub icon");
await writeFile(new URL("../public/lab/assets/default-icon.mjs", import.meta.url), `// Font Awesome Free 6.5.1, CC BY 4.0. See fontawesome/LICENSE.txt.\nexport const defaultIcon = ${JSON.stringify({ paths: github.path, viewBox: github.viewBox, label: "GitHub (brands)" })};\n`);
console.log(`Built the lazy icon catalog: ${icons.length} Font Awesome Free icons.`);
