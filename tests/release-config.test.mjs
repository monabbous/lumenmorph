import test from "node:test";
import assert from "node:assert/strict";
import { releaseConfig } from "../scripts/release-config.mjs";

test("stable publication requires an exact manual version on main", () => {
  assert.deepEqual(releaseConfig({
    version: "0.3.2", expectedVersion: "0.3.2", ref: "refs/heads/main", eventName: "workflow_dispatch",
  }), { version: "0.3.2", tag: "latest", prerelease: false });
  assert.throws(() => releaseConfig({ version: "0.3.2", ref: "refs/heads/main", eventName: "push" }));
  assert.throws(() => releaseConfig({ version: "0.3.2", expectedVersion: "0.3.2", ref: "refs/heads/release/0.3.2", eventName: "workflow_dispatch" }));
});

test("an alpha branch publishes only its own version under alpha", () => {
  for (const eventName of ["push", "workflow_dispatch"]) {
    assert.deepEqual(releaseConfig({
      version: "0.4.0-alpha.0", expectedVersion: "0.4.0-alpha.0", ref: "refs/heads/release/0.4.0-alpha.0", eventName,
    }), { version: "0.4.0-alpha.0", tag: "alpha", prerelease: true });
  }
});

test("alphas cannot publish from main, tags, or a mismatched branch", () => {
  for (const ref of ["refs/heads/main", "refs/heads/release/0.4.0-alpha.1", "refs/heads/feature/undertone", "refs/tags/v0.4.0-alpha.0"]) {
    assert.throws(() => releaseConfig({ version: "0.4.0-alpha.0", ref, eventName: "push" }));
  }
});

test("manual dispatch cannot omit or change the requested version", () => {
  for (const expectedVersion of [undefined, "", "0.4.0", "0.4.0-alpha.1"]) {
    assert.throws(() => releaseConfig({
      version: "0.4.0-alpha.0", expectedVersion, ref: "refs/heads/release/0.4.0-alpha.0", eventName: "workflow_dispatch",
    }));
  }
});

test("unsupported versions and events are rejected before publishing", () => {
  for (const version of ["0.4.0-beta.0", "0.4.0-alpha", "0.4.0-alpha.00", "00.4.0-alpha.0", "0.4.0-alpha.0+build", "0.4.0-alpha.0\n", undefined]) {
    assert.throws(() => releaseConfig({ version, ref: `refs/heads/release/${version}`, eventName: "push" }));
  }
  assert.throws(() => releaseConfig({ version: "0.4.0-alpha.0", ref: "refs/heads/release/0.4.0-alpha.0", eventName: "pull_request" }));
});
