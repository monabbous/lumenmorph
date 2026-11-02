import { test, expect } from "@playwright/test";

test("MUI and Mantine themes keep real component actions, disabled state, and loading overlays", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/__adapter-tests/libraries.html");
  for (const name of ["mui-paper", "mantine-paper"]) {
    await expect(page.getByTestId(name)).toBeVisible();
    const styles = await page.getByTestId(name).evaluate(node => ({ background: getComputedStyle(node).backgroundImage, border: getComputedStyle(node, "::before").maskComposite }));
    expect(styles.background).toContain("radial-gradient");
    expect(styles.border).toContain("exclude");
  }
  await page.getByRole("button", { name: "MUI action", exact: true }).click();
  await page.getByRole("button", { name: "Mantine action", exact: true }).click();
  await expect(page.locator("output")).toHaveText("2");
  await expect(page.getByRole("button", { name: "MUI disabled", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Mantine disabled", exact: true })).toBeDisabled();
  const loading = page.getByRole("button", { name: "Mantine loading", exact: true });
  await expect(loading).toHaveAttribute("data-loading", "true");
  expect(await loading.evaluate(node => getComputedStyle(node, "::before").maskImage)).toBe("none");
  expect(await page.getByTestId("mui-paper").evaluate(node => getComputedStyle(node).getPropertyValue("--lumen-glow-color").trim())).toBe("#00b2b2");
  await page.emulateMedia({ forcedColors: "active" });
  expect(await page.getByTestId("mui-paper").evaluate(node => getComputedStyle(node).backdropFilter)).toBe("none");
  expect(errors).toEqual([]);
});
