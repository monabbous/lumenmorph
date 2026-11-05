import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";

test.beforeEach(async ({ page }) => { await page.goto("/__slidebox-tests/"); });

const tintedBase = page => page.locator("#reference-card").evaluate(card => {
  const sample = document.createElement("span");
  sample.style.backgroundColor = "color-mix(in srgb, var(--lumen-glow-color, var(--slidebox-on, #ffaa71)) 18%, var(--lumen-bg, #102a3166))";
  card.append(sample);
  const color = getComputedStyle(sample).backgroundColor;
  sample.remove();
  return color;
});

test("lab glass is opt-in and preserves switch geometry, keyboard state, and form values", async ({ page }) => {
  const plain = page.locator("#plain"), glass = page.locator("#glass");
  const geometry = element => {
    const style = getComputedStyle(element), thumb = getComputedStyle(element, "::after");
    return [style.width, style.height, thumb.width, thumb.height, thumb.marginInlineStart, thumb.marginInlineEnd, thumb.transitionDuration];
  };
  expect(await glass.evaluate(geometry)).toEqual(await plain.evaluate(geometry));
  await expect(plain).toHaveCSS("backdrop-filter", "none");
  const card = await page.locator("#reference-card").evaluate(element => ({ background: getComputedStyle(element).backgroundColor, blur: getComputedStyle(element).backdropFilter }));
  await expect(glass).toHaveCSS("backdrop-filter", card.blur);
  await expect(glass).toHaveCSS("background-color", card.background);
  expect(await glass.evaluate(e => getComputedStyle(e, "::after").pointerEvents)).toBe("none");
  const base = await tintedBase(page);
  expect(base).not.toBe(card.background);
  expect(await glass.evaluate(e => getComputedStyle(e, "::before").backgroundColor)).toBe(base);
  await glass.focus();
  await glass.press("Space");
  await expect(glass).toBeChecked();
  expect(await glass.evaluate(e => getComputedStyle(e, "::before").backgroundColor)).toBe(base);
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
  const material = await page.locator("#reference-card").evaluate(element => ({ background: getComputedStyle(element).backgroundColor, blur: getComputedStyle(element).backdropFilter }));
  await expect(range).toHaveCSS("backdrop-filter", material.blur);
  await expect(range).toHaveCSS("background-color", material.background);
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
  await page.locator("#glass").evaluate(element => element.style.setProperty("--lumen-glow-color", getComputedStyle(document.querySelector("#group")).getPropertyValue("--lumen-glow-color")));
  await expect.poll(() => page.locator("#glass").evaluate(element => getComputedStyle(element, "::before").backgroundColor)).toBe(selected.backgroundColor);
  expect(selected.backdropFilter).toBe("blur(12px) saturate(1.4)");
  expect(selected.backgroundColor).not.toBe("rgb(255, 170, 113)");
});

test("public colors inherit, while forced colors and reduced motion keep Slidebox fallbacks", async ({ page }) => {
  const glass = page.locator("#glass");
  await page.evaluate(() => {
    document.body.style.setProperty("--lumen-bg", "#102a3180");
    document.body.style.setProperty("--lumen-border-glow-color", "#ffaa71");
  });
  await glass.check();
  await expect.poll(() => glass.evaluate(e => getComputedStyle(e, "::before").backgroundColor)).toBe(await tintedBase(page));
  expect(await glass.evaluate(e => getComputedStyle(e, "::after").backgroundImage)).toBe(await page.locator("#reference-card").evaluate(e => getComputedStyle(e, "::before").backgroundImage));
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
  await expect(range).toHaveAttribute("data-slidebox-range-layers", "");
  expect(await range.evaluate(input => getComputedStyle(input.nextElementSibling, "::before").backgroundImage)).toContain("radial-gradient");
  await range.focus();
  await range.press("ArrowRight");
  await expect(range).toHaveValue("41");
  expect(await range.evaluate(input => getComputedStyle(input.nextElementSibling, "::before").backgroundImage)).toContain("radial-gradient");
  await page.evaluate(() => window.stopRange());
  await expect(range).not.toHaveAttribute("data-slidebox-range-fill");
  await expect(range).not.toHaveAttribute("data-slidebox-range-layers");
});

test("accent base stays visible away from the pointer and supports inherited theme overrides", async ({ page }) => {
  await page.evaluate(() => {
    document.body.style.setProperty("--lumen-x", "-5000px");
    document.body.style.setProperty("--lumen-y", "-5000px");
    document.body.style.setProperty("--lumen-glow-color", "#80efdf");
    window.stopRange = window.startRangeEnhancements();
  });
  const read = () => page.evaluate(() => {
    const visual = document.querySelector("#range").nextElementSibling;
    return [getComputedStyle(document.querySelector("#glass"), "::before").backgroundColor,
      getComputedStyle(visual, "::before").backgroundColor,
      getComputedStyle(visual.querySelector("[data-slidebox-range-thumb]")).backgroundColor];
  });
  const base = await tintedBase(page);
  await expect.poll(read).toEqual([base, base, base]);
  await page.evaluate(() => document.body.style.setProperty("--lumen-slidebox-tint", "0%"));
  // Compare resolved colors rather than serialization (color(srgb) vs rgba).
  await expect.poll(() => page.locator("#glass").evaluate(element => {
    const sample = document.createElement("span");
    sample.style.backgroundColor = "color-mix(in srgb, transparent 0%, var(--lumen-bg, #102a3166))";
    document.body.append(sample);
    const expected = getComputedStyle(sample).backgroundColor;
    sample.remove();
    return getComputedStyle(element, "::before").backgroundColor === expected;
  })).toBe(true);
  await page.evaluate(() => document.body.style.setProperty("--lumen-slidebox-thumb-bg", "rgb(80, 160, 180)"));
  await expect.poll(() => page.locator("#glass").evaluate(e => getComputedStyle(e, "::before").backgroundColor)).toBe("rgb(80, 160, 180)");
});

test("reduced transparency removes blur without erasing optional range fill", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium exposes reduced-transparency emulation through CDP");
  await page.evaluate(() => { window.stopRange = window.startRangeEnhancements(); });
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await expect(page.locator("#glass")).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("#glass")).toHaveCSS("background-color", await page.locator("#reference-card").evaluate(e => getComputedStyle(e).backgroundColor));
  await expect(page.locator("#range")).toHaveCSS("backdrop-filter", "none");
  expect(await page.locator("#range").evaluate(input => {
    const fill = getComputedStyle(input.nextElementSibling, "::before");
    return fill.content !== "none" && parseFloat(fill.width) > 0 && fill.backgroundImage === "none";
  })).toBe(true);
  await session.detach();
});

test("layered checkbox border is the actual pointer-lit Lumenmorph ring", async ({ page }) => {
  const input = page.locator("#glass");
  await input.evaluate(element => {
    const box = element.getBoundingClientRect(), thumb = getComputedStyle(element, "::before"), root = document.documentElement.style;
    root.setProperty("--lumen-glow-opacity", "0");
    root.setProperty("--lumen-border-color", "transparent");
    root.setProperty("--lumen-border-glow-color", "#fff");
    root.setProperty("--lumen-border-opacity", "1");
    root.setProperty("--lumen-glow-size", "160px");
    root.setProperty("--lumen-x", `${box.x + parseFloat(getComputedStyle(element).borderLeftWidth) + parseFloat(thumb.marginInlineStart) + parseFloat(thumb.width) / 2}px`);
    root.setProperty("--lumen-y", `${box.y + box.height / 2}px`);
  });
  const peak = bytes => {
    const image = PNG.sync.read(bytes);
    let value = 0;
    for (let i = 0; i < image.data.length; i += 4) value = Math.max(value, image.data[i] + image.data[i + 1] + image.data[i + 2]);
    return value;
  };
  const near = peak(await input.screenshot({ scale: "css" }));
  await page.evaluate(() => { document.documentElement.style.setProperty("--lumen-x", "-5000px"); document.documentElement.style.setProperty("--lumen-y", "-5000px"); });
  const far = peak(await input.screenshot({ scale: "css" }));
  expect(near, "The masked thumb border must illuminate near the shared light").toBeGreaterThan(far + 300);
});

test("copied lab examples bundle and render with native controls and optional range styling", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const variant of ["basic", "range"]) {
    await page.goto(`/__slidebox-tests/docs-${variant}.html`);
    const toggle = page.getByRole("checkbox", { name: "Enable notifications" });
    await toggle.check();
    await expect(toggle).toBeChecked();
    await expect(toggle).toHaveCSS("backdrop-filter", /blur\(32px\)/);
    await expect(toggle).toHaveAttribute("data-slidebox-thumb-layers", "");
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
      await expect(range).toHaveCSS("backdrop-filter", /blur\(32px\)/);
      await expect(range).toHaveAttribute("data-slidebox-range-fill", "");
      await expect(range).toHaveAttribute("data-slidebox-range-layers", "");
    } else {
      await expect(range).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});

test("gallery and editor groups opt into the public skin rather than legacy paint", async ({ page }) => {
  for (const path of ["/lab/examples/", "/lab/examples/dock/", "/lab/examples/marbles/", "/lab/examples/palette/"]) {
    await page.goto(path);
    const editor = path !== "/lab/examples/";
    if (editor) await expect(page.locator("#preview-state")).toHaveText("Live");
    const root = editor ? page.frameLocator("#example-preview") : page;
    await expect(root.locator(".material-picker:not(.lumenmorph-slidebox)")).toHaveCount(0);
    const materials = await root.locator(".material-picker").evaluateAll(groups => groups.map(group => {
      const anchored = CSS.supports("anchor-scope", "--slidebox-selection") && CSS.supports("left", "anchor(left)");
      const style = getComputedStyle(anchored ? group : group.querySelector("input:checked + span"), "::before");
      return { blur: style.backdropFilter, image: style.backgroundImage };
    }));
    expect(materials.length).toBeGreaterThan(0);
    for (const material of materials) {
      expect(material.blur).toBe("blur(12px) saturate(1.4)");
      expect(material.image).toContain("radial-gradient");
    }
  }
});
