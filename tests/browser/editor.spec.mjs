import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/examples/climate/");
  await expect(page.locator("#preview-state")).toHaveText("Live");
  await expect(page.locator("#panel-html .cm-editor")).toBeVisible();
});
const setCode = async (page, language, value) => {
  await page.locator(`#tab-${language}`).click();
  await page.getByRole("textbox", { name: `${language.toUpperCase()} code`, exact: true }).fill(value);
};

test("generated previews use layered skin for ranges and switches", async ({ page }) => {
  const preview = page.frameLocator("#example-preview");
  await expect(preview.locator("[data-warmth]")).toHaveAttribute("data-slidebox-range-layers", "");
  expect(await preview.locator("[data-slidebox-range-thumb]").evaluate(element => getComputedStyle(element, "::before").maskComposite)).toContain("exclude");
  for (const id of ["foil", "checklist"]) {
    await page.goto(`/lab/examples/${id}/`);
    await expect(page.locator("#preview-state")).toHaveText("Live");
    const input = preview.locator("input.slidebox").first();
    await expect(input).toHaveAttribute("data-slidebox-thumb-layers", "");
    expect(await input.evaluate(element => getComputedStyle(element, "::after").maskComposite)).toContain("exclude");
    expect(await input.evaluate(element => getComputedStyle(element, "::before").backdropFilter)).toContain("blur(");
  }
});

test("HTML CSS and JavaScript edit a live sandbox and reset restores the example", async ({ page }) => {
  await page.locator("#auto-run").uncheck();
  await setCode(page, "html", '<button id="demo">Try this</button><output id="value">0</output>');
  await setCode(page, "css", 'body { background: rgb(12, 34, 56); color: white; }');
  await setCode(page, "js", 'document.querySelector("#demo").onclick = () => document.querySelector("#value").textContent = "1";');
  await page.locator("#run-code").click();
  const preview = page.frameLocator("#example-preview");
  await preview.getByRole("button", { name: "Try this" }).click();
  await expect(preview.locator("output")).toHaveText("1");
  expect(await preview.locator("body").evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(12, 34, 56)");
  await page.locator("#reset-code").click();
  await expect(preview.getByRole("slider", { name: "Room warmth" })).toBeVisible();
  await preview.getByRole("slider", { name: "Room warmth" }).fill("30");
  await expect(preview.locator("output")).toHaveText("30°");
});

test("syntax highlighting autocomplete and Prettier formatting work", async ({ page }) => {
  expect(await page.locator("#panel-html .cm-line span[class]").count()).toBeGreaterThan(5);
  await page.locator("#auto-run").uncheck();
  await setCode(page, "html", "<but");
  await page.getByRole("textbox", { name: "HTML code", exact: true }).press("Control+Space");
  await expect(page.locator(".cm-tooltip-autocomplete")).toBeVisible();
  await expect(page.locator(".cm-tooltip-autocomplete")).toContainText("button");
  await page.keyboard.press("Escape");
  await setCode(page, "css", ".demo{color:red;background:black}");
  await page.getByRole("button", { name: "Format code", exact: true }).click();
  await expect(page.locator("#edit-status")).toHaveText("Code formatted");
  await expect(page.locator("#panel-css .cm-content")).toContainText("color: red;");
  await expect(page.locator("#panel-css .cm-content")).toContainText("background: black;");
  await setCode(page, "js", 'const answer={value:42}');
  await page.locator("#tab-html").click();
  await expect(page.locator("#panel-js .cm-content")).toContainText("const answer = { value: 42 };");
});

test("edited scripts cannot access the host document or fetch external resources", async ({ page }) => {
  await page.locator("#auto-run").uncheck();
  await setCode(page, "html", '<p id="access"></p><p id="network"></p>');
  await setCode(page, "js", 'try { parent.document.body.dataset.compromised = "yes"; } catch { document.querySelector("#access").textContent = "Host isolated"; } fetch("https://example.com/private").catch(() => document.querySelector("#network").textContent = "Network blocked");');
  await page.locator("#run-code").click();
  const preview = page.frameLocator("#example-preview");
  await expect(preview.locator("#access")).toHaveText("Host isolated");
  await expect(preview.locator("#network")).toHaveText("Network blocked");
  await expect(page.locator("body")).not.toHaveAttribute("data-compromised");
  await expect(page.locator("#example-preview")).toHaveAttribute("sandbox", "allow-scripts");
});

test("auto-run reports errors and recovers after editing", async ({ page }) => {
  await setCode(page, "js", 'throw new Error("Try another idea");');
  await expect(page.locator("#preview-error")).toContainText("Try another idea");
  await setCode(page, "js", 'document.body.dataset.working = "yes";');
  await expect(page.locator("#preview-state")).toHaveText("Live");
  await expect(page.locator("#preview-error")).not.toBeVisible();
});

test("sharing and export preserve the page identity and current source", async ({ page }) => {
  await page.locator("#share-example").click();
  await expect(page.locator("#share-url")).toHaveValue(/\/lab\/examples\/climate\/$/);
  const html = await page.request.get("/lab/examples/climate/").then(response => response.text());
  expect(html).toContain('property="og:image" content="https://nabous.dev/lab/lumenmorph/examples/climate/og.png?v=');
  const image = await page.request.get("/lab/examples/climate/og.png");
  expect(image.status()).toBe(200);
  expect((await image.body()).subarray(1, 4).toString()).toBe("PNG");
  // Inspect the explicit export without submitting code to the external service.
  await page.locator("#codepen-form").evaluate(form => form.addEventListener("submit", event => event.preventDefault()));
  await page.locator("#open-codepen").click();
  const payload = JSON.parse(await page.locator("#codepen-data").inputValue());
  expect(payload.title).toContain("Degrees of warmth");
  expect(payload.js).toContain("LumenExample");
  expect(payload.css).toContain(".climate-ring");
  const download = page.waitForEvent("download");
  await page.locator("#download-example").click();
  expect((await download).suggestedFilename()).toBe("lumenmorph-climate.html");
});

test("editor fits phone and tablet widths and uses the site radius", async ({ page }) => {
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(".studio-card").first().evaluate(el => getComputedStyle(el).borderRadius)).toBe("4px");
  }
});

test("share menu offers explicit actions and dismisses with Escape or outside click", async ({ page }) => {
  await page.goto("/lab/examples/climate/?campaign=test#preview");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async value => { window.copiedLink = value; } } }));
  const button = page.locator("#share-example");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  expect(await page.evaluate(() => window.copiedLink)).toBeUndefined();
  const url = new URL("/lab/examples/climate/", page.url()).href;
  for (const platform of ["whatsapp", "x", "linkedin", "email"]) {
    expect(await page.locator(`[data-share=${platform}]`).getAttribute("href")).toContain(encodeURIComponent(url));
  }
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  expect(await page.evaluate(() => window.copiedLink)).toBe(url);
  await expect(page.locator("#share-status")).toHaveText("Link copied.");
  await page.keyboard.press("Escape");
  await expect(page.locator("#share-options")).toBeHidden();
  await expect(button).toBeFocused();
  await button.click();
  await page.locator("h1").click();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await button.click();
    const bounds = await page.locator("#share-options").boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
  }
});

test("native sharing cancellation keeps copy available and denied clipboard exposes the link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async data => { window.sharedData = data; throw new DOMException("Cancelled", "AbortError"); } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied"); } } });
  });
  await page.reload();
  await page.locator("#share-example").click();
  await page.locator("#share-device").click();
  expect((await page.evaluate(() => window.sharedData)).title).toContain("Degrees of warmth");
  await expect(page.locator("#share-options")).toBeVisible();
  await expect(page.locator("#share-status")).toHaveText("");
  await page.locator("#copy-example-link").click();
  await expect(page.locator("#share-url")).toBeVisible();
  await expect(page.locator("#share-url")).toBeFocused();
  expect(await page.locator("#share-url").evaluate(el => el.selectionEnd - el.selectionStart)).toBe((await page.locator("#share-url").inputValue()).length);
});

test("native sharing succeeds and unavailable browsers retain the other options", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: location.search.includes("no-native") ? undefined : async data => { window.sharedData = data; } }));
  await page.reload();
  await page.locator("#share-example").click();
  await page.locator("#share-device").click();
  await expect(page.locator("#share-options")).toBeHidden();
  await expect(page.locator("#share-example")).toBeFocused();
  await page.goto("/lab/examples/climate/?no-native");
  await page.locator("#share-example").click();
  await expect(page.locator("#share-device")).toBeHidden();
  await expect(page.locator("#copy-example-link")).toBeFocused();
});
