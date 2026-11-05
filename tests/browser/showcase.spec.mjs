import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/examples/");
  await expect(page.locator(".showcase")).toHaveAttribute("data-enhanced", "");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
});

test("masonry keeps every card in bounds and reflows category filters", async ({ page }) => {
  await expect(page.locator(".example:visible")).toHaveCount(24);
  await expect(page.locator(".showcase-grid")).toHaveAttribute("data-masonry", "");
  const check = async () => {
    // ResizeObserver updates row spans after responsive columns change.
    await expect.poll(() => page.locator(".example:visible").evaluateAll(cards => {
      const boxes = cards.map(card => card.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        clipped: cards.some(card => card.scrollWidth > card.clientWidth + 1),
        overlap: boxes.some((a, i) => boxes.some((b, j) => i !== j && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1)),
      };
    })).toEqual({ overflow: false, clipped: false, overlap: false });
  };
  await check();
  for (const [filter, count] of [["surface", 6], ["type", 3], ["control", 9], ["composition", 6], ["all", 24]]) {
    await page.locator(`label:has([data-filter=${filter}])`).click();
    await expect(page.locator(".example:visible")).toHaveCount(count);
    await expect(page.locator("#showcase-count")).toHaveText(`${count} experiments`);
    await check();
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 850 });
    await expect.poll(() => page.locator(".showcase-grid").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(width === 320 ? 1 : 2);
    await check();
    for (const selector of [".specimen-word", ".outline-word", ".glass-dock"])
      expect(await page.locator(selector).evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
});

test("interactive examples update native state and recover dismissed content", async ({ page }) => {
  await page.locator("[data-save]").click();
  await expect(page.locator("[data-save]")).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-play]").click();
  await expect(page.locator(".demo-player")).toHaveAttribute("data-playing", "");
  await page.locator("label:has([data-dock=\"A new canvas\"])").click();
  await expect(page.locator(".dock-selection")).toHaveText("A new canvas");
  await page.locator("[data-warmth]").fill("16");
  const coldColor = await page.locator(".climate-value").evaluate(el => getComputedStyle(el).color);
  await page.locator("[data-warmth]").fill("30");
  const warmColor = await page.locator(".climate-value").evaluate(el => getComputedStyle(el).color);
  expect(coldColor).toBe("rgb(126, 196, 255)");
  expect(warmColor).toBe("rgb(255, 170, 113)");
  await page.locator("[data-warmth]").fill("28");
  await expect(page.locator(".climate-value")).toHaveText("28°");
  const foilLabel = page.locator("label:has([data-foil])");
  await foilLabel.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await foilLabel.click();
  await expect(page.locator("[data-foil]")).toBeChecked();
  await expect(page.locator(".demo-foil")).toHaveAttribute("data-holographic", "");
  await page.locator("[data-ignite]").click();
  await expect(page.locator(".ignite-message")).toHaveText("Keep it glowing.");
  for (let i = 0; i < 3; i++) await page.locator(".notification:visible [data-dismiss]").first().click();
  await expect(page.locator(".notification-status")).toHaveText("All clear. Enjoy the quiet.");
  await expect(page.locator("[data-restore]")).toBeFocused();
  await page.locator("[data-restore]").click();
  await expect(page.locator(".notification:visible")).toHaveCount(3);
  await page.locator("[data-search]").fill("lag");
  await expect(page.locator("[data-material]:visible")).toHaveCount(1);
  await page.locator("[data-material=Lagoon]").click();
  await expect(page.locator(".command-status")).toHaveText("Lagoon selected");
  await page.locator("[data-search]").fill("missing");
  await expect(page.locator("[data-no-results]")).toBeVisible();
  await page.locator("button[data-night]").click();
  await expect(page.locator("[data-temperature]")).toHaveText("18°");
  expect(await page.locator(".demo-weather").evaluate(el => el.scrollTop)).toBe(0);
  await expect.poll(() => page.locator(".weather-sky").evaluate(el => getComputedStyle(el, "::after").opacity)).toBe("1");
  await page.getByRole("button", { name: "Switch to day", exact: true }).click();
  await expect.poll(() => page.locator(".weather-sky").evaluate(el => getComputedStyle(el, "::after").opacity)).toBe("0");
  await page.locator("label:has([name=marble-finish][value=smoke])").click();
  await expect(page.locator(".demo-marbles")).toHaveAttribute("data-finish", "smoke");
  await page.locator("[data-neon]").click();
  await expect(page.locator(".demo-neon")).toHaveAttribute("data-off", "");
  await page.locator("[data-next]").click();
  await expect(page.locator(".glass-steps [aria-current=step]")).toContainText("Make");
});

test("every study links to its own published editor", async ({ page, request }) => {
  const links = await page.locator(".recipe-button").evaluateAll(items => items.map(item => item.getAttribute("href")));
  expect(new Set(links).size).toBe(24);
  for (const link of links) {
    const response = await request.get(`/lab/examples/${link.replace(/^\.\//, "")}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('property="og:image"');
  }
  const link = page.getByRole("link", { name: "Open Degrees of warmth example" });
  // Center the target before clicking: WebKit's automated scroll can still be
  // moving when it reports a click near the edge of this long gallery.
  await link.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
  await link.click();
  await expect(page).toHaveURL(/examples\/climate\/$/);
  await expect(page.locator("#preview-state")).toHaveText("Live");
});

test("new checklist and rating respond with material light", async ({ page }) => {
  const check = async input => {
    // Exercise the associated label's native action. WebKit can retarget a
    // tiny checkbox click to its glass label during masonry/scroll updates.
    const label = input.locator("..");
    await label.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
    await label.click();
    await expect(input).toBeChecked();
  };
  const task = page.locator("[data-task]").first();
  await check(task);
  await expect(page.locator(".focus-tasks label").first()).toHaveAttribute("data-complete", "");
  await check(page.getByRole("radio", { name: "1 star", exact: true }));
  const low = await page.locator(".demo-rating").evaluate(el => getComputedStyle(el).getPropertyValue("--spark-strength"));
  await check(page.getByRole("radio", { name: "5 stars", exact: true }));
  const high = await page.locator(".demo-rating").evaluate(el => getComputedStyle(el).getPropertyValue("--spark-strength"));
  expect(Number(high)).toBeGreaterThan(Number(low));
  await expect(page.locator(".spark-rating [data-lit]")).toHaveCount(5);
});

test("reduced motion stops ornament animation and no-JS keeps the collection readable", async ({ page, browser, baseURL }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("[data-play]").click();
  expect(await page.locator(".waveform i").first().evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  expect(await page.locator(".weather-sky").evaluate(element => getComputedStyle(element, "::after").transitionDuration)).toBe("0s");
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const staticPage = await context.newPage();
  await staticPage.goto("/lab/examples/");
  await expect(staticPage.locator(".example:visible")).toHaveCount(24);
  await context.close();
});


test("Material Finder light matches its initial selection and subsequent choices", async ({ page }) => {
  const panel = page.locator(".command-panel");
  for (const [material, color] of [["Ember", "#ffaa71"], ["Lagoon", "#70d5c5"], ["Moonstone", "#d5c7ec"], ["Ember", "#ffaa71"]]) {
    const button = page.locator(`[data-material="${material}"]`);
    if (material !== "Ember" || await button.getAttribute("aria-pressed") !== "true") {
      await button.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
      await button.click();
    }
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const colors = await panel.evaluate(el => {
      const style = getComputedStyle(el);
      return ["--lumen-glow-color", "--lumen-border-glow-color"].map(name => style.getPropertyValue(name).trim());
    });
    expect(colors).toEqual([color, color]);
  }
});
