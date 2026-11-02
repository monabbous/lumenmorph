import { readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import postcss from "postcss";

const root = new URL("../", import.meta.url);
export const registryURL = "https://nabous.dev/lab/lumenmorph/r";
const schema = "https://ui.shadcn.com/schema/registry-item.json";

function cssObject(container) {
  return Object.fromEntries(container.nodes.filter(node => node.type !== "comment").map(node => {
    if (node.type === "decl") return [node.prop, node.value];
    if (node.type === "rule") return [node.selector, cssObject(node)];
    if (node.type === "atrule") return [`@${node.name} ${node.params}`, node.nodes ? cssObject(node) : {}];
    throw new Error(`Unsupported registry CSS node: ${node.type}`);
  }));
}

export async function createRegistry(baseURL = registryURL) {
  const { version } = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  const base = {
    $schema: schema, name: "lumenmorph", type: "registry:item", title: "Lumenmorph material",
    description: "CSS glass surfaces that inherit your shadcn theme. No JavaScript required.",
    dependencies: [`@monabbous/lumenmorph@^${version}`],
    css: cssObject(postcss.parse(await readFile(new URL("registry/lumenmorph.css", root), "utf8"))),
    docs: "For shadcn projects with Tailwind v4 color tokens. Add lumenmorph lumenmorph-border lumenmorph-theme to an existing surface. The material owns its background, border, radius and ::before; use --lumen-* variables to customize them. No global theme variables are changed.",
  };
  const definitions = [
    ["lumen-card", "Lumen Card", "A glass surface composed with your existing shadcn Card.", "card"],
    ["lumen-button", "Lumen Button", "An illuminated shadcn Button that keeps native actions and focus behavior.", "button"],
    ["lumen-pointer", "Lumen Pointer", "Optional shared pointer light with cleanup and reduced-motion support.", null],
  ];
  const items = [base];
  for (const [name, title, description, dependency] of definitions) {
    const path = `registry/${name}.tsx`;
    items.push({
      $schema: schema, name, type: "registry:ui", title, description,
      registryDependencies: [`${baseURL}/lumenmorph.json`, ...(dependency ? [dependency] : [])],
      files: [{ path, type: "registry:ui", content: await readFile(new URL(path, root), "utf8") }],
      ...(name === "lumen-pointer" ? {
        css: { '@import "@monabbous/lumenmorph/motion"': {} },
        docs: "Mount <LumenPointer /> once in your app layout, not per card. Do not combine it with another trackPointer() on html. Set smooth={false} to disable its smoothing. Touch retains static light; reduced motion is respected. The component renders no wrapper and is safe to import during SSR.",
      } : { docs: "Use tone=\"theme\" (default), \"ember\", \"lagoon\", or \"lilac\". Existing component props and refs are passed through. Your shadcn component supplies layout and behavior; Lumenmorph supplies its material." }),
    });
  }
  return items;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = new URL("public/lab/r/", root);
  await mkdir(output, { recursive: true });
  const items = await createRegistry();
  for (const item of items) await writeFile(new URL(`${item.name}.json`, output), JSON.stringify(item, null, 2) + "\n");
  await writeFile(new URL("registry.json", output), JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry.json", name: "lumenmorph", homepage: "https://nabous.dev/lab/lumenmorph/", items }, null, 2) + "\n");
  console.log(`Built ${items.length} shadcn registry items.`);
}
