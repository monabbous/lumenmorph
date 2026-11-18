import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const number = "(?:0|[1-9][0-9]*)";
const stableVersion = new RegExp(`^${number}\\.${number}\\.${number}$`);
const alphaVersion = new RegExp(`^${number}\\.${number}\\.${number}-alpha\\.${number}$`);

/** Keep prereleases off latest and tie each alpha to its versioned branch. */
export function releaseConfig({ version, ref, eventName, expectedVersion }) {
  if (eventName !== "workflow_dispatch" && eventName !== "push") {
    throw new Error("Publishing requires a manual dispatch or an alpha release push.");
  }
  if (eventName === "workflow_dispatch" && expectedVersion !== version) {
    throw new Error("The requested version must exactly match package.json.");
  }
  if (typeof version !== "string" || (!stableVersion.test(version) && !alphaVersion.test(version))) {
    throw new Error("Only stable x.y.z or alpha x.y.z-alpha.n versions can be published.");
  }
  if (stableVersion.test(version)) {
    if (eventName !== "workflow_dispatch" || ref !== "refs/heads/main") {
      throw new Error("Stable releases require a manual dispatch on main.");
    }
    return { version, tag: "latest", prerelease: false };
  }
  if (ref !== `refs/heads/release/${version}`) {
    throw new Error("Alpha releases require the matching release/<version> branch.");
  }
  return { version, tag: "alpha", prerelease: true };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const config = releaseConfig({
    version,
    ref: process.env.GITHUB_REF,
    eventName: process.env.GITHUB_EVENT_NAME,
    expectedVersion: process.env.EXPECTED_VERSION,
  });
  if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required by the release workflow.");
  await appendFile(process.env.GITHUB_OUTPUT, Object.entries(config).map(([key, value]) => `${key}=${value}\n`).join(""));
  console.log(`Validated ${config.version} for npm tag ${config.tag}.`);
}
