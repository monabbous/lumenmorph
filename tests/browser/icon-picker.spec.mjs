import { test, expect } from "@playwright/test";

test("bottom-of-card icon picker is lazy, searchable, keyboard-dismissible, and applies a brand icon", async ({ page }) => {
  const requests = [];
  page.on("request", request => { if (request.url().includes("fontawesome-icons.json")) requests.push(request.url()); });
  await page.goto("/lab/");
  expect(requests).toHaveLength(0);
  expect(await page.locator("#icon-controls").evaluate(element => Boolean(element.closest(".stage .preview-editors")))).toBe(true);
  await page.locator("#choose-icon").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.locator("#choose-icon").click();
  const dialog = page.getByRole("dialog", { name: "Choose an icon", exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.locator("#icon-search")).toBeFocused();
  await expect(page.locator("#icon-results li")).toHaveCount(24);
  expect(requests).toHaveLength(1);
  await page.locator("#icon-next").click();
  await expect(page.locator("#icon-results-status")).toContainText("25–48");
  await page.locator("#icon-style").selectOption("brands");
  await page.locator("#icon-search").fill("github");
  await dialog.getByRole("button", { name: "Use GitHub (brands)", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#choose-icon")).toBeFocused();
  await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "GitHub (brands)");
  await expect(page.locator("#icon-name")).toHaveText("GitHub (brands)");
  await expect(page.locator("#component-snippet")).toContainText("GitHub (brands)");
  await page.locator("#choose-icon").click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#choose-icon")).toBeFocused();
  expect(requests).toHaveLength(1);
});

test("custom path validation preserves the last valid preview and updates copied geometry", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "GitHub (brands)");
  const disclosure = page.locator("#custom-icon-path summary");
  await disclosure.focus();
  await disclosure.press("Enter");
  await expect(page.locator("#custom-icon-path")).toHaveAttribute("open", "");
  await page.locator("#icon-viewbox").fill("0 0 24 24");
  await page.locator("#icon-path").fill("M0 0H24V24H0Z");
  await expect(page.locator("#icon-status")).toContainText("Icon updated");
  await expect(page.locator("#component-snippet")).toContainText("M0 0H24V24H0Z");
  await expect(page.locator("#component-snippet")).toContainText("0 0 24 24");
  await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "Custom SVG path");
  await page.locator("#icon-path").fill('<svg onload="alert(1)">');
  await expect(page.locator("#icon-path")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#icon-status")).toContainText("last valid icon");
  await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "Custom SVG path");
  await expect(page.locator("#component-snippet")).toContainText("M0 0H24V24H0Z");
});

test("icon dialog handles empty results and narrow-screen layout", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/lab/");
  await page.locator("#choose-icon").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.locator("#choose-icon").click();
  await expect(page.locator("#icon-results li")).toHaveCount(24);
  await page.locator("#icon-search").fill("not-a-real-icon-xyz");
  await expect(page.locator("#icon-results-status")).toContainText("No matching icons");
  await expect(page.locator("#icon-results li")).toHaveCount(0);
  await expect(page.locator("#icon-next")).toBeDisabled();
  const box = await page.locator("#icon-picker").boundingBox();
  expect(box.width).toBeLessThanOrEqual(375);
  expect(box.x).toBeGreaterThanOrEqual(0);
  await page.locator("#close-icon-picker").click();
});
