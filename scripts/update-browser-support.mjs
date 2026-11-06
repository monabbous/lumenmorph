import { writeFile } from "node:fs/promises";
import { aggregateSupport, trackedFeatures } from "./browser-support-data.mjs";

async function json(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Lumenmorph-lab-support-snapshot" } });
  if (!response.ok) throw new Error(`Support data request failed: ${response.status} ${url}`);
  return response.json();
}
const revision = await json("https://api.github.com/repos/Fyrd/caniuse/commits/main");
const data = await json(`https://raw.githubusercontent.com/Fyrd/caniuse/${revision.sha}/data.json`);
const features = trackedFeatures.map(id => {
  const feature = data.data[id];
  const full = feature.usage_perc_y, partial = feature.usage_perc_a;
  if (![full, partial].every(value => Number.isFinite(value) && value >= 0 && value <= 100) || full + partial > 100.01) throw new Error(`Invalid support percentages for ${id}`);
  return { id, title: feature.title, full, partial, url: `https://caniuse.com/${id}` };
});
const snapshot = { source: "https://github.com/Fyrd/caniuse", commit: revision.sha, committedAt: revision.commit.committer.date, retrievedAt: new Date().toISOString(), license: "https://creativecommons.org/licenses/by/4.0/", method: "intersection-of-browser-version-global-usage", features, ...aggregateSupport(data) };
await writeFile(new URL("../public/lab/assets/browser-support.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Updated Caniuse snapshot from ${revision.sha.slice(0, 7)}. Run npm run build to refresh the table.`);
