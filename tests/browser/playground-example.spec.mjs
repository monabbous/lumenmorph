import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PNG } from "pngjs";

test.beforeEach(async ({ context }) => {
  const prefix = "https://cdn.jsdelivr.net/npm/";
  const files = new Map([
    ["@monabbous/lumenmorph@0.3.2/dist/css/lumenmorph.min.css", "../../dist/css/lumenmorph.min.css"],
    ["@monabbous/lumenmorph@0.3.2/dist/css/motion.min.css", "../../dist/css/motion.min.css"],
    ["@monabbous/lumenmorph@0.3.2/js/pointer.mjs", "../../js/pointer.mjs"],
    ["@fortawesome/fontawesome-free@6.5.1/css/all.min.css", "../../node_modules/@fortawesome/fontawesome-free/css/all.min.css"],
    ["@fortawesome/fontawesome-free@6.5.1/webfonts/fa-solid-900.woff2", "../../node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2"],
  ]);
  await context.route("https://cdn.jsdelivr.net/npm/**", async route => {
    const path = files.get(route.request().url().slice(prefix.length));
    if (!path) { await route.continue(); return; }
    await route.fulfill({ body: await readFile(new URL(path, import.meta.url)), contentType: path.endsWith(".css") ? "text/css" : path.endsWith(".woff2") ? "font/woff2" : "text/javascript", headers: { "Access-Control-Allow-Origin": "*" } });
  });
});

test("one star-card playground edits HTML/SVG text and exports the current theme", async ({ page, context }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async value => { window.__previewCopied = value; } } }));
  await page.goto("/lab/");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator(".main-card .fa-asterisk")).toBeVisible();
  await page.locator("#example-title").fill("Your own words");
  await expect(page.locator("#example-description")).toHaveCount(0);
  expect(await page.locator("#example-title").evaluate(element => Boolean(element.closest(".stage .preview-editors")))).toBe(true);
  await expect(page.locator(".html-text-demo")).toHaveText("Your own words");
  await expect(page.locator("#react-demo svg")).toHaveAttribute("aria-label", "Your own words");
  await expect(page.locator(".main-card h2")).toHaveText("Glass surface");
  const theme = page.getByRole("radio", { name: "Lagoon", exact: true });
  await theme.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await theme.locator("..").click();
  await page.locator("#use-preview").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.locator("#use-preview").click();
  await page.locator("#copy-settings").click();
  const copied = await page.evaluate(() => window.__previewCopied);
  expect(copied).toContain("Your own words");
  expect(copied).toContain("--lumen-glow-color: #00b2b2");
  expect(copied).not.toContain("lab.css");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download-settings").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("lumenmorph-preview.html");
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe(copied);
  await expect(page.locator("#settings-source-code code.hljs")).toBeAttached();
  expect(await page.locator("#settings-source-code code").textContent()).toBe(copied);
  const exported = await context.newPage();
  await exported.setContent(copied);
  await expect(exported.locator(".lumenmorph-text")).toHaveText("Your own words");
  await expect(exported.locator("#card-description")).toContainText("Blur the background");
  expect(await exported.locator(".main-card").evaluate(element => getComputedStyle(element).backgroundColor)).toBe(await page.locator(".main-card").evaluate(element => getComputedStyle(element).backgroundColor));
  await exported.close();
});

test("one page-wide light follows movement outside the lab container", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/lab/");
  await page.mouse.move(5, 80);
  await expect.poll(() => page.locator(".lm-lab").evaluate(element => element.style.getPropertyValue("--lumen-x"))).toBe("5px");
  expect(await page.locator(".lm-lab").evaluate(element => element.getBoundingClientRect().left)).toBeGreaterThan(5);
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("all capabilities are discoverable while advanced controls stay collapsed", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator(".main-card .fa-asterisk")).toBeVisible();
  await expect(page.locator(".html-text-demo")).toBeVisible();
  await expect(page.locator("#react-demo svg")).toBeVisible();
  await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "GitHub (brands)");
  for (const id of ["quick-start", "material-settings", "settings-source", "advanced-setup", "examples-guide"]) {
    await expect(page.locator(`#${id}`)).not.toHaveAttribute("open", "");
  }
  await expect(page.locator(".preview-tabs")).toHaveCount(0);
});

test("compact SVG text keeps actual outline pixels after responsive resizing", async ({ page }) => {
  await page.goto("/lab/");
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1100 });
    const svg = page.locator("#react-demo svg");
    await expect.poll(() => svg.evaluate(element => Math.abs(element.viewBox.baseVal.width - element.getBoundingClientRect().width))).toBeLessThan(1);
    await svg.evaluate(element => {
      element.style.setProperty("--lumen-text-fill", "transparent");
      element.style.setProperty("--lumen-text-outline", "#fff");
      element.style.setProperty("--lumen-glow-color", "transparent");
    });
    const image = PNG.sync.read(await svg.screenshot({ scale: "css" }));
    let outlinePixels = 0;
    for (let i = 0; i < image.data.length; i += 4) if (image.data[i] > 200 && image.data[i + 1] > 200 && image.data[i + 2] > 200) outlinePixels++;
    expect(outlinePixels, "The morphology outline must survive thumbnail scaling").toBeGreaterThan(25);
  }
});

test("practical examples and adoption guidance work without horizontal overflow", async ({ page }) => {
  await page.goto("/lab/");
  await page.locator("#examples-guide > summary").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.locator("#examples-guide > summary").click();
  await expect(page.locator(".practical-grid a")).toHaveCount(4);
  for (const detail of await page.locator(".adoption-notes details").all()) {
    await detail.locator("summary").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
    await detail.locator("summary").click();
    await expect(detail.locator("p").first()).toBeVisible();
  }
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("editable text is safe and remains selectable HTML glass text", async ({ page }) => {
  await page.goto("/lab/");
  await page.locator("#example-title").fill('<img src=x onerror="alert(1)">');
  await expect(page.locator(".html-text-demo")).toHaveText('<img src=x onerror="alert(1)">');
  await expect(page.locator(".html-text-demo img")).toHaveCount(0);
  expect(await page.locator(".html-text-demo").evaluate(element => getComputedStyle(element).userSelect)).not.toBe("none");
});
