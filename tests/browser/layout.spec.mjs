import { test, expect } from "@playwright/test";

// Check the rendered geometry, including the native-radio label hit area.
async function checkGroups(root) {
  const problems = await root.locator(".material-picker").evaluateAll(groups => groups.flatMap(group => {
    if (!group.getClientRects().length) return [];
    const bounds = group.getBoundingClientRect();
    const labels = [...group.children].filter(el => el.tagName === "LABEL");
    const boxes = labels.map(label => label.getBoundingClientRect());
    const issues = [];
    for (const [index, label] of labels.entries()) {
      const box = boxes[index];
      const span = label.querySelector(":scope > span");
      const face = span.getBoundingClientRect();
      if (Math.abs(face.x - box.x) > 1 || Math.abs(face.y - box.y) > 1 || Math.abs(face.width - box.width) > 1 || Math.abs(face.height - box.height) > 1) issues.push("label and material misaligned");
      if (span.scrollWidth > span.clientWidth + 1 || span.scrollHeight > span.clientHeight + 1) issues.push("clipped option");
      if (box.left < bounds.left || box.right > bounds.right + 1) issues.push("option outside track");
      if (index && (Math.abs(box.top - boxes[0].top) > 1 || Math.abs(box.height - boxes[0].height) > 1 || Math.abs(box.width - boxes[0].width) > 1)) issues.push("unequal options");
    }
    if (boxes.length && Math.abs(boxes[0].left - bounds.left - (bounds.right - boxes.at(-1).right)) > 1) issues.push("unequal track gutters");
    return issues.map(issue => `${group.className}: ${issue}`);
  }));
  expect(problems).toEqual([]);
}

for (const path of ["/lab/", "/lab/examples/"]) {
  test(`groups align across phone tablet and desktop: ${path}`, async ({ page }) => {
    await page.goto(path);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await checkGroups(page);
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await page.locator("html").evaluate(el => getComputedStyle(el).scrollBehavior)).toBe("smooth");
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.locator("html").evaluate(el => getComputedStyle(el).scrollBehavior)).toBe("auto");
  });
}

for (const id of ["dock", "palette", "marbles"]) {
  test(`isolated ${id} controls preserve alignment and icons`, async ({ page }) => {
    await page.goto(`/lab/examples/${id}/`);
    await expect(page.locator("#preview-state")).toHaveText("Live");
    const preview = page.frameLocator("#example-preview");
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await checkGroups(preview);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const options = preview.locator(".material-picker > label");
    await options.last().click();
    await expect(options.last().locator("input")).toBeChecked();
    if (id === "dock") {
      await expect(preview.locator(".dock-selection")).toHaveText("Fine adjustments");
      expect(await preview.locator(".fa-solid").first().evaluate(async el => {
        await document.fonts.ready;
        return document.fonts.check('900 16px "Font Awesome 6 Free"') && getComputedStyle(el, "::before").content !== "none";
      })).toBe(true);
    }
  });
}

test("save action centers its label and icon before and after toggling", async ({ page }) => {
  for (const path of ["/lab/examples/", "/lab/examples/spotlight/"]) {
    await page.goto(path);
    const root = path.endsWith("spotlight/") ? page.frameLocator("#example-preview") : page;
    if (path.endsWith("spotlight/")) await expect(page.locator("#preview-state")).toHaveText("Live");
    const button = root.locator("[data-save]");
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (let state = 0; state < 2; state++) {
        expect(await button.evaluate(el => {
          const label = el.querySelector("span").getBoundingClientRect();
          const icon = el.querySelector("i").getBoundingClientRect();
          return Math.abs(label.top + label.height / 2 - icon.top - icon.height / 2);
        })).toBeLessThan(1);
        await button.click();
      }
    }
  }
});
