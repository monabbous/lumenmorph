import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".mjs": "text/javascript", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2" };
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (path === "/") path = "/lab/";
    if (path.endsWith("/")) path += "index.html";
    const filename = resolve(root, `.${path}`);
    if (!filename.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const data = await readFile(filename);
    response.writeHead(200, { "Content-Type": types[extname(filename)] || "application/octet-stream", "Cache-Control": "no-store" }).end(data);
  } catch { response.writeHead(404).end("Not found"); }
}).listen(port, host, () => console.log(`Lumenmorph lab: http://${host}:${port}/lab/`));
