import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/__slidebox-tests/"); });

test("lab glass is opt-in and preserves switch geometry, keyboard state, and form values", async ({ page }) => {
  const plain = page.locator("#plain"), glass = page.locator("#glass");
  const geometry = element => {
    const style = getComputedStyle(element), thumb = getComputedStyle(element, "::after");
    return [style.width, style.height, thumb.width, thumb.height, thumb.marginInlineStart, thumb.marginInlineEnd, thumb.transitionDuration];
  };
  expect(await glass.evaluate(geometry)).toEqual(await plain.evaluate(geometry));
  await expect(plain).toHaveCSS("backdrop-filter", "none");
  await expect(glass).toHaveCSS("backdrop-filter", /blur\(40px\)/);
  await expect(glass).toHaveCSS("background-color", /0\.4\)/);
  expect(await glass.evaluate(e => getComputedStyle(e, "::before").pointerEvents)).toBe("none");
  expect(await glass.evaluate(e => getComputedStyle(e, "::after").backgroundColor)).toBe("rgb(232, 246, 250)");
  await glass.focus();
  await glass.press("Space");
  await expect(glass).toBeChecked();
  await expect.poll(() => glass.evaluate(e => getComputedStyle(e, "::after").backgroundColor)).toBe("rgb(0, 178, 178)");
  await expect(page.locator("#disabled")).toBeDisabled();
  await page.getByRole("button", { name: "Save settings" }).click();
  expect(await page.evaluate(() => window.submitted)).toEqual({ glass: "on", period: "day", intensity: "40" });
});

test("scoped radios and ranges retain native keyboard controls and focus", async ({ page }) => {
  const day = page.getByRole("radio", { name: "Day", exact: true });
  const week = page.getByRole("radio", { name: "Week", exact: true });
  await day.focus();
  await day.press("ArrowRight");
  await expect(week).toBeChecked();
  await expect(page.getByRole("radio", { name: "Month", exact: true })).toBeDisabled();
  // WebKit doesn't enter :focus-visible mode from programmatic focus plus an
  // arrow key alone. Check the outline after actual keyboard traversal.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(week).toBeFocused();
  expect(await week.evaluate(e => getComputedStyle(e.nextElementSibling).outlineStyle)).not.toBe("none");
  const range = page.getByRole("slider", { name: "Intensity" });
  await range.focus();
  await range.press("ArrowRight");
  await expect(range).toHaveValue("41");
  await expect(range).toHaveCSS("backdrop-filter", /blur\(40px\)/);
  await expect(range).toHaveCSS("background-color", /0\.4\)/);
  await expect(range).not.toHaveCSS("outline-style", "none");
});

test("group selected and unselected glass match the Lumenmorph lab reference", async ({ page }) => {
  const paint = (element, selected) => {
    const anchors = CSS.supports("anchor-scope: --slidebox-selection") && CSS.supports("left: anchor(left)");
    const target = selected
      ? (anchors ? element : element.querySelector("input:checked + span"))
      : element.querySelector("input:not(:checked):not(:disabled) + span");
    const style = getComputedStyle(target, selected ? "::before" : undefined);
    return Object.fromEntries(["backgroundColor", "backgroundImage", "backgroundAttachment", "backgroundSize", "backdropFilter", "borderRadius", "boxShadow"].map(key => [key, style[key]]));
  };
  for (const selected of [true, false]) {
    const actual = await page.locator("#group").evaluate(paint, selected);
    const reference = await page.locator("#reference-group").evaluate(paint, selected);
    expect(actual).toEqual(reference);
  }
  await expect(page.locator("#group")).toHaveCSS("border-radius", "4px");
  await page.getByRole("radio", { name: "Day", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Week", exact: true })).toBeChecked();
  const selected = await page.locator("#group").evaluate(paint, true);
  expect(selected.backdropFilter).toBe("blur(12px) saturate(1.4)");
  expect(selected.backgroundColor).not.toBe("rgb(255, 170, 113)");
});

test("public colors inherit, while forced colors and reduced motion keep Slidebox fallbacks", async ({ page }) => {
  const glass = page.locator("#glass");
  await page.evaluate(() => document.body.style.setProperty("--slidebox-on", "#ffaa71"));
  await glass.check();
  await expect.poll(() => glass.evaluate(e => getComputedStyle(e, "::after").backgroundColor)).toBe("rgb(255, 170, 113)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await glass.evaluate(e => getComputedStyle(e, "::after").transitionDuration.split(",").every(t => parseFloat(t) < .001))).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(glass).toHaveCSS("backdrop-filter", "none");
  expect(await glass.evaluate(e => getComputedStyle(e).getPropertyValue("--_on").trim())).toBe("Highlight");
  expect(await glass.evaluate(e => getComputedStyle(e, "::before").content)).toBe("none");
});

test("optional range fill and motion are not replaced by the skin", async ({ page }) => {
  const range = page.locator("#range");
  await expect(range).not.toHaveAttribute("data-slidebox-range-fill");
  await page.evaluate(() => { window.stopRange = window.startRangeEnhancements(); });
  await expect(range).toHaveAttribute("data-slidebox-range-fill", "");
  await expect(range).toHaveCSS("background-image", /linear-gradient/);
  await range.focus();
  await range.press("ArrowRight");
  await expect(range).toHaveValue("41");
  await expect(range).toHaveCSS("background-image", /linear-gradient/);
  await page.evaluate(() => window.stopRange());
  await expect(range).not.toHaveAttribute("data-slidebox-range-fill");
});

test("reduced transparency removes blur without erasing optional range fill", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium exposes reduced-transparency emulation through CDP");
  await page.evaluate(() => { window.stopRange = window.startRangeEnhancements(); });
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await expect(page.locator("#glass")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("#glass")).toHaveCSS("background-color", "rgb(42, 91, 124)");
  await expect(page.locator("#range")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("#range")).toHaveCSS("background-image", /linear-gradient/);
  await session.detach();
});

test("copied lab examples bundle and render with native controls and optional range styling", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const variant of ["basic", "range"]) {
    await page.goto(`/__slidebox-tests/docs-${variant}.html`);
    const toggle = page.getByRole("checkbox", { name: "Enable notifications" });
    await toggle.check();
    await expect(toggle).toBeChecked();
    await expect(toggle).toHaveCSS("backdrop-filter", /blur\(40px\)/);
    await page.getByText("Week", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "Week", exact: true })).toBeChecked();
    expect(await page.locator(".slidebox-group").evaluate(group => {
      const anchored = CSS.supports("anchor-scope", "--slidebox-selection") && CSS.supports("left", "anchor(left)");
      return getComputedStyle(anchored ? group : group.querySelector("input:checked + span"), "::before").backdropFilter;
    })).toBe("blur(12px) saturate(1.4)");
    const range = page.getByRole("slider", { name: "Intensity" });
    if (variant === "range") {
      await range.focus();
      await range.press("ArrowRight");
      await expect(range).toHaveValue("41");
      await expect(range).toHaveCSS("backdrop-filter", /blur\(40px\)/);
      await expect(range).not.toHaveAttribute("data-slidebox-range-fill");
    } else {
      await expect(range).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
