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
  await expect(page.getByRole("radio", { name: "Ember", exact: true })).toBeChecked();
  expect(await page.locator("button:not(.lumenmorph)").count()).toBe(0);
  expect(await page.locator('input[type="range"]:not(.slidebox-range)').count()).toBe(0);
  await page.locator("#glow-size").fill("620");
  await expect(page.locator("#glow-size-value")).toHaveText("620px");
  await expect(page.locator("#snippet")).toContainText("--lumen-glow-size: 620px");
  await page.locator(".presets label").filter({ hasText: "Ember" }).click();
  await expect(page.locator("#snippet")).toContainText("#ffaa71");
  await page.locator(".presets label").filter({ hasText: "Lagoon" }).click();
  await expect(page.locator("#snippet")).toContainText("#00b2b2");
  for (const format of ["SCSS", "Less", "Tailwind"]) {
    await page.getByRole("group", { name: "Code format" }).locator("label").filter({ hasText: format }).click();
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
    await picker.locator("label").filter({ hasText: name }).click();
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
  await page.getByRole("group", { name: "SVG implementation" }).locator("label").filter({ hasText: "Vue" }).click();
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
  await page.getByRole("group", { name: "SVG implementation" }).locator("label").filter({ hasText: "Web Component" }).click();
  await expect(page.locator("#component-snippet code")).toHaveCount(2);
  await expect(page.locator("#component-snippet .copy-code")).toHaveCount(2);
});

test("installation switches between npm and a minified no-build CDN setup", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator("#installation-snippet")).toContainText("npm install @monabbous/lumenmorph");
  await page.getByRole("group", { name: "Code format" }).locator("label").filter({ hasText: "CDN · minified" }).click();
  await expect(page.locator("#installation-snippet")).toContainText("lumenmorph.min.css");
  await expect(page.locator("#installation-snippet")).toContainText("motion.min.css");
  await expect(page.locator("#snippet")).toContainText('<script type="module">');
  await expect(page.locator("#snippet")).toContainText("https://cdn.jsdelivr.net/npm/@monabbous/lumenmorph@0.3.0/js/pointer.mjs");
  await page.locator("#smoothing").uncheck();
  await page.locator("#tracking").uncheck();
  await expect(page.locator("#installation-snippet")).not.toContainText("motion.min.css");
  await expect(page.locator("#snippet")).not.toContainText("trackPointer");
  await expect(page.locator("#snippet")).not.toContainText("lumenmorph-motion");
  await page.getByRole("group", { name: "Code format" }).locator("label").filter({ hasText: "Vanilla CSS · npm" }).click();
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
  await page.locator(".presets label").filter({ hasText: "Ember" }).click();
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

test("static CSS works without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/lab/");
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

test("Slidebox presets support arrows, Lilac export, custom edits, and reset", async ({ page }) => {
  await page.goto("/lab/");
  const ember = page.getByRole("radio", { name: "Ember", exact: true });
  await ember.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Lagoon", exact: true })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Lilac", exact: true })).toBeChecked();
  await expect(page.locator("#glow-color")).toHaveValue("#c4a1ff");
  await expect(page.locator("#snippet")).toContainText("#e4d4ff");
  await page.locator("#blur").fill("10");
  await expect(page.locator(".presets input:checked")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(ember).toBeChecked();
});

test("landing shortcuts select the requested setup and copy the install command", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async value => { window.__copiedCode = value; } } }));
  await page.goto("/lab/");
  await page.getByRole("button", { name: "Copy install", exact: true }).click();
  expect(await page.evaluate(() => window.__copiedCode)).toBe("npm install @monabbous/lumenmorph");
  const picker = page.getByRole("group", { name: "Choose your stack", exact: true });
  for (const [name, code] of [["MUI", "cssVariables: true"], ["Mantine", "Paper.extend"], ["Taiga UI v4+", 'appearance="lumenmorph"'], ["shadcn/ui", "lumen-card.json"]]) {
    await picker.locator("label").filter({ hasText: name }).click();
    await expect(picker.getByRole("radio", { name, exact: true })).toBeChecked();
    await expect(page.locator("#stack-setup")).toHaveAttribute("href", "#integrations");
    await expect(page.getByRole("group", { name: "UI library", exact: true }).getByRole("radio", { name, exact: true })).toBeChecked();
    await expect(page.locator("#integration-snippet")).toContainText(code);
  }
  await picker.locator("label").filter({ hasText: "Tailwind" }).click();
  await expect(page.locator("#stack-setup")).toHaveAttribute("href", "#code");
  await picker.getByRole("radio", { name: "Tailwind", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(picker.getByRole("radio", { name: "CSS", exact: true })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#snippet")).toContainText("@monabbous/lumenmorph/tailwind/css");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("preset highlight keeps Slidebox geometry with Lumenmorph paint and accessible fallbacks", async ({ page }) => {
  await page.goto("/lab/");
  await page.locator(".presets label").filter({ hasText: "Lilac" }).click();
  const read = () => page.locator(".presets").evaluate(group => {
    const anchored = CSS.supports("anchor-scope", "--slidebox-selection") && CSS.supports("left", "anchor(left)");
    const target = anchored ? group : group.querySelector("input:checked + span");
    const style = getComputedStyle(target, "::before");
    return { image: style.backgroundImage, blur: style.backdropFilter, radius: style.borderRadius, position: style.position, duration: style.transitionDuration, color: style.backgroundColor };
  });
  let style = await read();
  expect(style.image).toContain("radial-gradient");
  expect(style.blur).toContain("blur(12px)");
  expect(style.radius).toBe("4px");
  expect(style.position).toBe("absolute");
  await page.emulateMedia({ reducedMotion: "reduce" });
  style = await read();
  expect(style.duration.split(",").every(duration => parseFloat(duration) < 0.01)).toBe(true);
  await page.emulateMedia({ forcedColors: "active" });
  style = await read();
  expect(style.image).toBe("none");
  await expect(page.getByRole("radio", { name: "Lilac", exact: true })).toBeChecked();
});

test("URL remembers setup selections while presets and sliders stay local", async ({ page }) => {
  await page.goto("/lab/?campaign=demo#code");
  const select = async selector => {
    const label = page.locator(selector);
    await label.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "center" }));
    await label.click();
  };
  await select("label:has([data-format=tailwind])");
  await expect(page).toHaveURL(/stack=tailwind.*format=tailwind.*#code$/);
  await expect(page.locator("#snippet")).toContainText("@apply lumen-glow-size-[460px]");
  await expect(page.locator("#snippet")).toContainText("B. Direct utilities");
  await expect(page.locator("#theme-snippet")).toContainText(":root");
  await expect(page.locator("#theme-snippet")).not.toContainText("material-preset");
  await select("label:has([data-integration=mantine])");
  await expect(page.locator("[data-integration=mantine]")).toBeChecked();
  await select("label:has([data-framework=vue])");
  const shared = page.url();
  expect(new URL(shared).searchParams.get("library")).toBe("mantine");
  expect(new URL(shared).searchParams.get("svg")).toBe("vue");
  expect(new URL(shared).searchParams.get("campaign")).toBe("demo");
  await page.locator(".presets label").filter({ hasText: "Lilac" }).click();
  await page.locator("#glow-size").fill("620");
  expect(page.url()).toBe(shared);
  await expect(page.locator("#snippet")).toContainText("lumen-glow-size-[620px]");
  await page.reload();
  await expect(page.locator("[data-format=tailwind]")).toBeChecked();
  await expect(page.locator("[data-integration=mantine]")).toBeChecked();
  await expect(page.locator("input[data-framework=vue]")).toBeChecked();
  await expect(page.locator('.stack-options input[value="svg"]')).toBeChecked();
  await expect(page.locator("#react-demo")).toHaveAttribute("data-framework", "vue");
  await expect(page.getByRole("radio", { name: "Ember", exact: true })).toBeChecked();
  await expect(page.locator("#glow-size")).toHaveValue("460");
});

test("invalid URL choices fall back safely and a stack-only link opens its setup", async ({ page }) => {
  await page.goto("/lab/?stack=__proto__&format=missing&library=constructor&svg=unknown");
  await expect(page.locator("[data-format=css]")).toBeChecked();
  await expect(page.locator("[data-integration=shadcn]")).toBeChecked();
  await expect(page.locator("input[data-framework=react]")).toBeChecked();
  await page.goto("/lab/?stack=mui");
  await expect(page.locator("[data-integration=mui]")).toBeChecked();
  await expect(page.locator("#integration-snippet")).toContainText("cssVariables: true");
});


test("all group highlights follow presets and custom glow colors", async ({ page }) => {
  await page.goto("/lab/");
  const checkColors = async color => {
    const colors = await page.locator(".material-picker").evaluateAll(groups => groups.flatMap(group => {
      const anchored = CSS.supports("anchor-scope", "--slidebox-selection") && CSS.supports("left", "anchor(left)");
      const selected = group.querySelector("input:checked + span");
      const unselected = group.querySelector("input:not(:checked) + span");
      return [
        ...(selected ? [getComputedStyle(anchored ? group : selected, "::before")] : []),
        ...(unselected ? [getComputedStyle(unselected)] : []),
      ].map(style => style.getPropertyValue("--lumen-glow-color").trim());
    }));
    expect(colors.length).toBeGreaterThan(5);
    expect(colors.every(value => value === color)).toBe(true);
  };
  for (const [name, color] of [["Ember", "#ffaa71"], ["Lagoon", "#00b2b2"], ["Lilac", "#c4a1ff"]]) {
    await page.locator(".presets label").filter({ hasText: name }).click();
    await checkColors(color);
  }
  await page.locator("#glow-color").fill("#33aa77");
  await checkColors("#33aa77");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await checkColors("#ffaa71");
});

test("main lab's imported skin matches its original group styles across demo settings", async ({ page, context }) => {
  const requests = [];
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  const original = await context.newPage();
  try {
    await original.route("**/lab/", async route => {
      const response = await route.fetch();
      const body = (await response.text())
        .replace('href="./material-picker-layout.css"', 'href="/__slidebox-tests/legacy-material-picker.css"')
        .replace('href="./assets/lumenmorph-slidebox.css"', 'href="/__slidebox-tests/legacy-preset-highlight.css"')
        .replaceAll("material-picker lumenmorph-slidebox", "material-picker")
        .replace('id="controls" class="lumenmorph-slidebox"', 'id="controls"')
        .replace('class="code-section lumenmorph-slidebox"', 'class="code-section"');
      await route.fulfill({ response, body });
    });
    for (const view of [original, page]) {
      await view.goto("/lab/");
      await expect(view.locator("#react-demo svg")).toBeVisible();
      await view.evaluate(() => document.fonts.ready);
      await view.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
      await view.locator(".lm-lab").evaluate(root => {
        root.classList.remove("lumenmorph-motion");
        root.style.setProperty("--lumen-x", "320px");
        root.style.setProperty("--lumen-y", "180px");
      });
    }
    expect(requests).toContain("/lab/assets/lumenmorph-slidebox.css");
    expect(requests).not.toContain("/lab/material-picker.css");
    expect(requests).not.toContain("/lab/assets/preset-highlight.css");
    expect(await page.locator(".material-picker").evaluateAll(groups => groups.every(group => !!group.closest(".lumenmorph-slidebox")))).toBe(true);
    const read = view => view.locator(".material-picker").evaluateAll(groups => {
      const properties = ["backgroundColor", "backgroundImage", "backgroundAttachment", "backgroundSize", "backdropFilter", "borderRadius", "boxShadow", "borderColor", "color"];
      const paint = style => Object.fromEntries(properties.map(key => [key, style[key]]));
      const anchored = CSS.supports("anchor-scope", "--slidebox-selection") && CSS.supports("left", "anchor(left)");
      return groups.map(group => {
        const selected = group.querySelector("input:checked + span"), idle = group.querySelector("input:not(:checked) + span");
        return {
          frame: paint(getComputedStyle(group)),
          size: [group.getBoundingClientRect().width, group.getBoundingClientRect().height],
          selected: selected ? paint(getComputedStyle(anchored ? group : selected, "::before")) : null,
          idle: idle ? paint(getComputedStyle(idle)) : null,
        };
      });
    });
    for (const preset of ["ember", "lagoon", "lilac"]) {
      for (const view of [original, page]) await view.locator(`[data-preset="${preset}"]`).evaluate(input => input.click());
      expect(await read(page), `${preset}: imported skin must preserve all five groups`).toEqual(await read(original));
    }
    for (const view of [original, page]) {
      await view.locator("#glow-color").fill("#33aa77");
      await view.locator("#blur").fill("0");
      await view.locator("#radius").fill("24");
      await view.locator("#glow-size").fill("900");
    }
    expect(await read(page), "Specimen controls must not change the groups' material").toEqual(await read(original));
  } finally {
    await original.close();
  }
});

test("Slidebox setup documents installation, imports, markup, colors, and optional ranges in the lab", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async value => { window.__copiedCode = value; } } });
  });
  await page.goto("/lab/");
  await page.locator('.stack-options label:has(input[value="slidebox"])').click();
  await expect(page.locator('[data-integration="slidebox"]')).toBeChecked();
  await expect(page.locator("#stack-setup")).toHaveText("View Slidebox setup");
  await expect(page.locator("#stack-setup")).toHaveAttribute("href", "#integrations");
  await expect(page.locator("#integration-description")).toContainText("Requires Lumenmorph 0.3.0");
  await expect(page.locator("#integration-snippet code")).toHaveCount(6);
  await expect(page.locator("#integration-snippet")).toContainText("npm install github:monabbous/lumenmorph");
  await expect(page.locator("#integration-snippet")).toContainText('import "@monabbous/lumenmorph/slidebox"');
  await expect(page.locator("#integration-snippet")).toContainText('class="settings lumenmorph-slidebox"');
  await expect(page.locator("#integration-snippet")).toContainText("Optional experimental range");
  await expect(page.locator("#integration-guide")).toHaveAttribute("href", /\/docs\/slidebox\.md$/);
  await page.getByRole("button", { name: "Copy main.js — import base styles before the skin", exact: true }).click();
  expect(await page.evaluate(() => window.__copiedCode)).toContain('import "@monabbous/lumenmorph/slidebox"');
  expect(new URL(page.url()).searchParams.get("stack")).toBe("slidebox");
  await page.reload();
  await expect(page.locator('.stack-options input[value="slidebox"]')).toBeChecked();
  await expect(page.locator('[data-integration="slidebox"]')).toBeChecked();
  await expect(page.locator("#integration-snippet code")).toHaveCount(6);
});

test("main lab switches and ranges use glass without losing keyboard, fill, or forced-color behavior", async ({ page }) => {
  await page.goto("/lab/");
  await expect(page.locator("#header-demo svg")).toBeVisible();
  const tracking = page.locator("#tracking"), range = page.locator("#glow-size");
  await expect.poll(() => range.evaluate(input => Math.abs(input.getBoundingClientRect().top - input.nextElementSibling.getBoundingClientRect().top))).toBeLessThan(.5);
  const checkMaterial = async () => {
    // Native Slidebox background transitions may briefly retain the previous
    // gradient in WebKit after a material edit. Compare the settled material,
    // keeping the original geometry/paint transition behavior intact.
    await expect(async () => {
      const materials = await page.evaluate(() => {
        const properties = ["backgroundColor", "backgroundImage", "backgroundAttachment", "backgroundSize", "backdropFilter"];
        const read = (element, pseudo) => Object.fromEntries(properties.map(key => [key, getComputedStyle(element, pseudo)[key]]));
        const card = document.querySelector(".main-card"), input = document.querySelector("#glow-size"), visual = input.nextElementSibling;
        const thumb = visual.querySelector("[data-slidebox-range-thumb]");
        return {
          card: read(card), toggle: read(document.querySelector("#tracking"), "::before"),
          thumb: read(thumb), fill: read(visual, "::before"),
          cardBorder: getComputedStyle(card, "::before").backgroundImage,
          toggleBorder: getComputedStyle(document.querySelector("#tracking"), "::after").backgroundImage,
          rangeBorder: getComputedStyle(thumb, "::before").backgroundImage,
          nodes: visual.querySelectorAll("*").length,
        };
      });
      expect(materials.toggle).toEqual(materials.card);
      expect(materials.thumb).toEqual(materials.card);
      expect(materials.fill).toEqual(materials.card);
      expect(materials.toggleBorder).toBe(materials.cardBorder);
      expect(materials.rangeBorder).toBe(materials.cardBorder);
      expect(materials.nodes).toBe(1); // Existing wrapper + thumb; fill/border are pseudos.
    }).toPass({ timeout: 5000 });
  };
  await checkMaterial();
  await expect(tracking).toHaveCSS("border-top-width", "1px");
  await expect(tracking).toHaveCSS("height", "22px");
  expect(await tracking.evaluate(input => getComputedStyle(input, "::after").pointerEvents)).toBe("none");
  await expect(range).toHaveAttribute("data-slidebox-range-fill", "");
  await expect(range).toHaveAttribute("data-slidebox-range-layers", "");
  await tracking.focus();
  await tracking.press("Space");
  await expect(tracking).not.toBeChecked();
  await expect(page.locator(".lm-lab")).toHaveAttribute("data-tracking", "off");
  const nextValue = String(Number(await range.inputValue()) + Number(await range.getAttribute("step") ?? 1));
  await range.focus();
  await range.press("ArrowRight");
  await expect(range).toHaveValue(nextValue);
  await expect(page.locator("#glow-size-value")).toHaveText(`${nextValue}px`);
  await expect(page.locator("#snippet")).toContainText(`--lumen-glow-size: ${nextValue}px`);
  await page.locator("#blur").fill("0");
  await page.locator("#radius").fill("24");
  await page.locator("#border-width").fill("5");
  expect(await page.locator(".lm-lab").evaluate(root => root.style.getPropertyValue("--lumen-blur"))).toBe("");
  expect(await page.locator(".stage").evaluate(stage => stage.style.getPropertyValue("--lumen-blur"))).toBe("0px");
  expect(await page.locator("#header-demo").evaluate(header => header.style.getPropertyValue("--lumen-glow-size"))).toBe(`${nextValue}px`);
  await expect(tracking).toHaveCSS("border-top-width", "1px");
  await checkMaterial();
  await page.emulateMedia({ forcedColors: "active" });
  await expect(tracking).toHaveCSS("backdrop-filter", "none");
  await expect(range).toHaveCSS("backdrop-filter", "none");
  await expect(tracking).not.toBeChecked();
  await expect(range).toHaveValue(nextValue);
  await expect(page.locator("[data-slidebox-range-visual]")).toHaveCount(0);
});
