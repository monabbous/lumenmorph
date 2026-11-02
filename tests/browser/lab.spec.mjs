import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";

test("lab loads, renders React masks, and controls update the exported code", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/lab/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lumenmorph");
  await expect(page.locator("#react-demo svg")).toHaveAttribute("aria-label", "Lumenmorph");
  await expect(page.locator("#react-demo mask")).toHaveCount(2);
  await expect(page.locator("#header-demo svg")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ember", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("button:not(.lumenmorph)").count()).toBe(0);
  expect(await page.locator('input[type="range"]:not(.slidebox-range)').count()).toBe(0);
  await page.locator("#glow-size").fill("620");
  await expect(page.locator("#glow-size-value")).toHaveText("620px");
  await expect(page.locator("#snippet")).toContainText("--lumen-glow-size: 620px");
  await page.getByRole("button", { name: "Ember", exact: true }).click();
  await expect(page.locator("#snippet")).toContainText("#ffaa71");
  await page.getByRole("button", { name: "nabous.dev", exact: true }).click();
  await expect(page.locator("#snippet")).toContainText("#00b2b2");
  for (const format of ["SCSS", "Less", "Tailwind"]) {
    await page.getByRole("group", { name: "Code format" }).getByRole("button", { name: format, exact: true }).click();
    await expect(page.locator("#snippet")).toContainText("lumenmorph");
  }
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("#glow-size")).toHaveValue("460");
  const size = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(size.body).toBeLessThanOrEqual(size.viewport);
  expect(errors).toEqual([]);
});

test("live SVG demo lazily loads every framework adapter", async ({ page }) => {
  const errors = [];
  const requested = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.url().includes("/assets/adapters/")) requested.push(request.url()); });
  await page.goto("/lab/");
  await expect(page.locator("#react-demo svg")).toHaveAttribute("aria-label", "Lumenmorph");
  expect(requested).toEqual([]);
  const picker = page.getByRole("group", { name: "SVG implementation" });
  for (const [name, label] of [["Vue", "Vue 3.5"], ["Svelte", "Svelte 5"], ["Angular", "Angular 21"], ["Web Component", "Web Component"], ["React", "React"]]) {
    await picker.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("#react-demo")).toHaveAttribute("data-framework", ({ Vue: "vue", Svelte: "svelte", Angular: "angular", "Web Component": "web-component", React: "react" })[name]);
    await expect(page.locator("#react-demo svg")).toHaveAttribute("aria-label", "Lumenmorph");
    await expect(page.locator("#react-demo svg")).toHaveCount(1);
    await expect(page.locator("#icon-demo svg")).toHaveAttribute("aria-label", "Play");
    await expect(page.locator("#icon-demo mask path")).toHaveCount(2);
  }
  expect(errors).toEqual([]);
});

test("framework switching keeps the preview space while the next bundle loads", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator("#react-demo svg")).toBeVisible();
  const before = await page.locator("#react-demo").boundingBox();
  let release;
  const hold = new Promise(resolve => { release = resolve; });
  await page.route("**/assets/adapters/vue.mjs", async route => { await hold; await route.continue(); });
  await page.getByRole("group", { name: "SVG implementation" }).getByRole("button", { name: "Vue", exact: true }).click();
  await expect(page.locator("#react-demo")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#react-demo svg")).toBeVisible();
  const loading = await page.locator("#react-demo").boundingBox();
  expect(Math.abs(loading.height - before.height)).toBeLessThan(1);
  release();
  await expect(page.locator("#react-demo")).toHaveAttribute("data-framework", "vue");
  const after = await page.locator("#react-demo").boundingBox();
  expect(Math.abs(after.height - before.height)).toBeLessThan(1);
});

test("implementation panels use highlighted blocks with per-block copy buttons", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async value => { window.__copiedCode = value; } } });
  });
  await page.goto("/lab/");
  await page.locator("#code").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Foundations", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "SVG components", exact: true })).toBeAttached();
  await expect(page.locator(".stage button[data-framework]")).toHaveCount(0);
  await expect(page.locator("#snippet code.hljs").first()).toBeAttached();
  await expect(page.locator("#snippet .copy-code")).toHaveCount(3);
  const raw = await page.locator("#snippet code").first().textContent();
  await page.getByRole("button", { name: "Copy styles.css", exact: true }).click();
  expect(await page.evaluate(() => window.__copiedCode)).toBe(raw);
  await expect(page.locator("#snippet .copy-code .fa-check")).toHaveCount(1);
  await page.getByRole("group", { name: "SVG implementation" }).getByRole("button", { name: "Web Component", exact: true }).click();
  await expect(page.locator("#component-snippet code")).toHaveCount(2);
  await expect(page.locator("#component-snippet .copy-code")).toHaveCount(2);
});

test("installation switches between npm and a minified no-build CDN setup", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator("#installation-snippet")).toContainText("npm install @monabbous/lumenmorph");
  await page.getByRole("button", { name: "CDN · minified", exact: true }).click();
  await expect(page.locator("#installation-snippet")).toContainText("lumenmorph.min.css");
  await expect(page.locator("#installation-snippet")).toContainText("motion.min.css");
  await expect(page.locator("#snippet")).toContainText('<script type="module">');
  await expect(page.locator("#snippet")).toContainText("https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.1.3/js/pointer.mjs");
  await page.locator("#smoothing").uncheck();
  await page.locator("#tracking").uncheck();
  await expect(page.locator("#installation-snippet")).not.toContainText("motion.min.css");
  await expect(page.locator("#snippet")).not.toContainText("trackPointer");
  await expect(page.locator("#snippet")).not.toContainText("lumenmorph-motion");
  await page.getByRole("button", { name: "Vanilla CSS · npm", exact: true }).click();
  await expect(page.locator("#installation-snippet")).toContainText("npm install");
  await expect(page.locator("#snippet")).toContainText('@import "@monabbous/lumenmorph/css"');
});

test("native button keeps keyboard behavior and tracking cleans up", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop keyboard and mouse interaction");
  await page.goto("/lab/");
  await page.locator("#sample-button").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#sample-button")).toContainText("Native click received");
  await page.locator("#glow-size").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#glow-size")).toHaveValue("470");
  await page.locator("#tracking").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("#tracking")).not.toBeChecked();
  await page.keyboard.press("Space");
  await page.mouse.move(300, 350);
  await expect.poll(() => page.evaluate(() => document.querySelector(".lm-lab").style.getPropertyValue("--lumen-x"))).toBe("300px");
  await page.locator("#tracking").uncheck();
  await expect.poll(() => page.evaluate(() => document.querySelector(".lm-lab").style.getPropertyValue("--lumen-x"))).toBe("");
  await page.mouse.move(350, 380);
  expect(await page.evaluate(() => document.querySelector(".lm-lab").style.getPropertyValue("--lumen-x"))).toBe("");
});

test("scaled SVG light stays under the viewport pointer coordinates", async ({ page, isMobile }) => {
  test.skip(isMobile, "Deterministic desktop pixel coordinates");
  await page.goto("/lab/");
  await expect(page.locator("#header-demo svg")).toBeVisible();
  await page.evaluate(() => {
    const svg = document.querySelector("#header-demo svg");
    Object.assign(svg.style, { position: "fixed", left: "200px", top: "100px", width: "400px", height: "80px", zIndex: "100000" });
    svg.style.setProperty("--lumen-x", "350px");
    svg.style.setProperty("--lumen-y", "140px");
    svg.style.setProperty("--lumen-glow-size", "30px");
    svg.querySelectorAll("foreignObject")[1].style.display = "none";
    const fill = svg.querySelector("foreignObject");
    fill.removeAttribute("mask");
    const layer = fill.querySelector("div");
    for (const [key, value] of Object.entries({ bg: "#000", blur: "0px", saturation: "1", "glow-color": "#fff", "glow-opacity": "1" })) layer.style.setProperty(`--lumen-${key}`, value);
  });
  await expect.poll(() => page.locator("#header-demo svg").evaluate(svg => svg.style.getPropertyValue("--_lumen-svg-a"))).toBe("2");
  const image = PNG.sync.read(await page.locator("#header-demo svg").screenshot({ scale: "css" }));
  let peak = { brightness: 0, x: 0, y: 0 };
  for (let y = 1; y < image.height - 1; y++) for (let x = 1; x < image.width - 1; x++) {
    const index = (y * image.width + x) * 4;
    const brightness = image.data[index] + image.data[index + 1] + image.data[index + 2];
    if (brightness > peak.brightness) peak = { brightness, x, y };
  }
  expect(peak.brightness).toBeGreaterThan(700);
  expect(Math.abs(peak.x - 150)).toBeLessThanOrEqual(1);
  expect(Math.abs(peak.y - 40)).toBeLessThanOrEqual(1);
});

test("SVG outline doesn't reveal internal seams between overlapping glyph contours", async ({ page, isMobile }) => {
  test.skip(isMobile, "Deterministic desktop pixel coordinates");
  await page.goto("/lab/");
  await expect(page.locator("#header-demo svg")).toBeVisible();
  await page.locator("#header-demo svg").evaluate(svg => {
    Object.assign(svg.style, { position: "fixed", left: "0px", top: "0px", width: "800px", height: "160px", zIndex: "100000", background: "#000" });
    for (const [key, value] of Object.entries({ "--lumen-text-fill": "transparent", "--lumen-text-outline": "#fff", "--lumen-glow-color": "transparent" })) svg.style.setProperty(key, value);
    for (const text of svg.querySelectorAll("mask text")) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      // Two overlapping filled contours, as found in the source font's L glyph.
      path.setAttribute("d", "M100 20h20v80h-20z M100 80h80v20h-80z");
      for (const attribute of ["fill", "stroke", "stroke-width", "filter"]) {
        if (text.hasAttribute(attribute)) path.setAttribute(attribute, text.getAttribute(attribute));
      }
      text.replaceWith(path);
    }
  });
  const image = PNG.sync.read(await page.locator("#header-demo svg").screenshot({ scale: "css" }));
  const brightness = (x, y) => {
    const index = (y * image.width + x) * 4;
    return image.data[index] + image.data[index + 1] + image.data[index + 2];
  };
  expect(brightness(110, 80)).toBeLessThan(20); // No horizontal seam through the stem.
  expect(brightness(120, 90)).toBeLessThan(20); // No vertical seam through the foot.
  expect(brightness(100, 50)).toBeGreaterThan(100); // Keep the actual outside edge.
  expect(brightness(150, 80)).toBeGreaterThan(100);
});

test("hosted lab reuses shell coordinates without changing the host palette", async ({ page }) => {
  await page.route("**/lab/", async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace("<body>", '<body><header data-nabous-shell>Host shell</header>');
    await route.fulfill({ response, body: html });
  });
  await page.goto("/lab/");
  await expect(page.locator(".lm-lab")).toHaveAttribute("data-hosted", "");
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--mouse-x", "450px");
    document.documentElement.style.setProperty("--mouse-y", "170px");
    document.documentElement.style.setProperty("--accent", "#00b2b2");
  });
  await page.mouse.move(200, 200);
  expect(await page.locator(".lm-lab").evaluate(element => element.style.getPropertyValue("--lumen-x"))).toBe("");
  await expect.poll(() => page.locator(".lm-lab").evaluate(element => getComputedStyle(element).getPropertyValue("--lumen-x").trim())).toBe("450px");
  await page.getByRole("button", { name: "Ember", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--accent"))).toBe("#00b2b2");
  await page.locator("#tracking").uncheck();
  await expect.poll(() => page.locator(".lm-lab").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--lumen-x")))) .toBe(await page.evaluate(() => innerWidth / 2));
});

test("reduced motion retains a static light and forced colors retains readable content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/lab/");
  await page.mouse.move(200, 250);
  expect(await page.evaluate(() => document.querySelector(".lm-lab").style.getPropertyValue("--lumen-x"))).toBe("");
  const style = await page.locator(".main-card").evaluate(element => ({ blur: getComputedStyle(element).backdropFilter, color: getComputedStyle(element).color, border: getComputedStyle(element).borderTopColor }));
  expect(style.blur).toBe("none");
  expect(style.border).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.getByRole("heading", { name: "Glass surface" })).toBeVisible();
  await expect(page.locator("#header-demo .lumenmorph-svg-fallback")).toBeVisible();
  await expect(page.locator("#header-demo foreignObject").first()).toBeHidden();
});

test("static CSS works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/lab/");
  const style = await page.locator(".main-card").evaluate(element => ({ image: getComputedStyle(element).backgroundImage, backdrop: getComputedStyle(element).backdropFilter }));
  expect(style.image).toContain("radial-gradient");
  expect(style.backdrop).toContain("blur(32px)");
  await expect(page.getByRole("heading", { name: "Glass surface" })).toBeVisible();
  await context.close();
});

test("optional motion transitions one coordinate owner and smooths exit", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop hover exit behavior");
  await page.goto("/lab/");
  await page.locator("#smoothing").check();
  await expect(page.locator(".lm-lab")).toHaveClass(/lumenmorph-motion/);
  const durations = await page.locator(".main-card").evaluate(surface => ({
    owner: getComputedStyle(document.querySelector(".lm-lab")).transitionProperty,
    surface: getComputedStyle(surface).transitionDuration,
  }));
  expect(durations.owner).toBe("--lumen-x, --lumen-y");
  expect(durations.surface).toBe("0s");
  await page.mouse.move(300, 220);
  await expect.poll(() => page.locator(".lm-lab").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--lumen-x")))) .toBe(300);
  // Observe the transition in-page; a driver round trip can outlast the 500ms animation under load.
  await page.locator(".lm-lab").evaluate(element => {
    element.addEventListener("transitionrun", event => {
      if (event.target === element && event.propertyName === "--lumen-x") element.dataset.returnTransition = "started";
    });
  });
  await page.mouse.move(-5, -5);
  await expect(page.locator(".lm-lab")).toHaveAttribute("data-return-transition", "started");
  expect(await page.locator(".lm-lab").evaluate(element => getComputedStyle(element).transitionDuration)).toBe("0.5s");
  await expect.poll(() => page.locator(".lm-lab").evaluate(element => Number.parseFloat(getComputedStyle(element).getPropertyValue("--lumen-x")))) .toBe(720);
  await expect(page.locator("#snippet")).toContainText("@monabbous/lumenmorph/motion");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".lm-lab").evaluate(element => getComputedStyle(element).transitionDuration)).toBe("0s");
});
