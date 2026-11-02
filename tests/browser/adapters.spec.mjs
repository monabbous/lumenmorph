import { test, expect } from "@playwright/test";

for (const adapter of ["vue", "svelte", "angular", "web-component"]) {
  test(`${adapter}: renders, updates, escapes text, maps SVG coordinates, and cleans up`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`/__adapter-tests/?adapter=${adapter}`);
    const svg = page.locator("#app svg");
    await expect(svg).toHaveAttribute("aria-label", "Glass");
    await expect(svg.locator("mask")).toHaveCount(2);
    await expect(svg.locator("feMorphology")).toHaveCount(2);
    await page.evaluate(() => window.updateText("<script>text only</script>"));
    await expect(svg).toHaveAttribute("aria-label", "<script>text only</script>");
    await expect(svg.locator("mask text").first()).toHaveText("<script>text only</script>");
    await expect(svg.locator("script")).toHaveCount(0);
    await svg.evaluate(element => { element.style.width = "320px"; element.style.height = "60px"; });
    await expect.poll(() => svg.evaluate(element => element.style.getPropertyValue("--_lumen-svg-a"))).toBe("2");
    await page.emulateMedia({ forcedColors: "active" });
    await expect(svg.locator(".lumenmorph-svg-fallback")).toBeVisible();
    await expect(svg.locator("foreignObject").first()).toBeHidden();
    await page.evaluate(() => window.dispose());
    await expect(svg).toHaveCount(0);
    if (adapter === "web-component") {
      await page.evaluate(() => { window.updateText("Reconnected"); window.reconnect(); });
      await expect(svg).toHaveAttribute("aria-label", "Reconnected");
      await expect(svg.locator("mask")).toHaveCount(2);
    }
    expect(errors).toEqual([]);
  });
}
