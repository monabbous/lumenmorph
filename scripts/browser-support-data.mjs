export const trackedFeatures = ["css-backdrop-filter", "css-masks", "css-variables", "background-clip-text"];

export function supportState(value) {
  if (typeof value !== "string") return "unknown";
  const flags = value.split(/\s+/);
  if (flags.includes("d")) return "none"; // Disabled-by-default is not usable support.
  if (flags.includes("y")) return "full"; // Includes prefixes that Caniuse marks supported.
  if (flags.includes("a")) return "partial";
  if (flags.includes("n")) return "none";
  return "unknown";
}

export function aggregateSupport(data, featureIds = trackedFeatures) {
  if (!featureIds.length) throw new Error("At least one tracked feature is required");
  const overall = { full: 0, partial: 0, none: 0, unknown: 0 };
  const browsers = Object.entries(data.agents).map(([id, agent]) => {
    const coverage = { full: 0, partial: 0, none: 0, unknown: 0 };
    let version = agent.versions.filter(Boolean).at(-1), representativeUsage = 0;
    const states = release => featureIds.map(feature => supportState(data.data[feature]?.stats?.[id]?.[release]));
    for (const [release, weight] of Object.entries(agent.usage_global)) {
      if (!Number.isFinite(weight) || weight < 0) throw new Error(`Invalid usage for ${id} ${release}`);
      const support = states(release);
      const classification = support.every(value => value === "full") ? "full"
        : support.includes("none") ? "none"
        : support.includes("unknown") ? "unknown" : "partial";
      coverage[classification] += weight;
      overall[classification] += weight;
      if (weight > representativeUsage) { version = release; representativeUsage = weight; }
    }
    return { id, name: agent.browser, version, representativeUsage: Math.max(0, representativeUsage), support: states(version), coverage, usage: Object.values(coverage).reduce((a, b) => a + b, 0) };
  });
  browsers.sort((a, b) => b.usage - a.usage || (a.id < b.id ? -1 : 1));
  if (Object.values(overall).reduce((a, b) => a + b, 0) > 100.1) throw new Error("Global usage exceeds 100%");
  return { overall, browsers };
}
