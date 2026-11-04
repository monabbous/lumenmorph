import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";

// A DOM mask attribute alone doesn't prove the browser clips a composited layer.
// Check actual pixels for both glyphs and path icons, including shadow-root adapters.
for (const adapter of ["React", "Vue", "Svelte", "Angular", "Web Component"]) {
  test(`${adapter}: fallback font metrics keep SVG text centered and descenders visible`, async ({ page }) => {
    await page.route("**/baseline-fallback.woff2", route => route.fulfill({
      path: new URL("../fonts/noto-kufi-arabic-fallback.woff2", import.meta.url).pathname,
      contentType: "font/woff2",
    }));
    const name = { React: "react", Vue: "vue", Svelte: "svelte", Angular: "angular", "Web Component": "web-component" }[adapter];
    await page.goto(`/__adapter-tests/masking.html?adapter=${name}`);
    await expect(page.locator("#react-demo")).toHaveAttribute("data-framework", name);
    await page.addStyleTag({ content: `
      @font-face { font-family: "Baseline fallback"; src: url("/baseline-fallback.woff2"); }
      #react-demo {
        font-family: "Baseline fallback", monospace;
        --lumen-text-fill: #fff;
        --lumen-text-outline: #fff;
        --lumen-glow-color: transparent;
      }
    ` });
    // The Arabic-only fixture deliberately lacks Latin glyphs. Firefox's
    // central baseline uses its metrics even though monospace paints the text.
    await page.evaluate(async () => {
      await document.fonts.load('88px "Baseline fallback"', "ا");
      await document.fonts.ready;
    });
    const svg = page.locator("#react-demo svg");
    const image = PNG.sync.read(await svg.screenshot({ scale: "css" }));
    let top = image.height, bottom = -1;
    for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
      const index = (y * image.width + x) * 4;
      if (image.data[index] > 200 && image.data[index + 1] > 200 && image.data[index + 2] > 200) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    expect(bottom, "The text must remain visible").toBeGreaterThan(top);
    expect(top, "Keep space above the glyphs").toBeGreaterThan(image.height * 0.08);
    expect(bottom, "Keep the p descender clear of the viewport edge").toBeLessThan(image.height * 0.92);
    expect(Math.abs((top + bottom) / 2 - image.height / 2), "Keep the visible text vertically centered").toBeLessThan(image.height * 0.12);
  });

  test(`${adapter}: SVG light stays inside text and icon silhouettes`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const name = { React: "react", Vue: "vue", Svelte: "svelte", Angular: "angular", "Web Component": "web-component" }[adapter];
    await page.goto(`/__adapter-tests/masking.html?adapter=${name}`);
    await expect(page.locator("#react-demo")).toHaveAttribute("data-framework", name);

    for (const selector of ["#react-demo svg", "#icon-demo svg"]) {
      const svg = page.locator(selector);
      await expect(svg).toBeVisible();
      // Changing page light must reach the paint layer, but not invalidate the
      // static silhouette subtree. Check both coordinates and both adapters.
      for (const [x, y] of [[40, 60], [220, 180]]) {
        await svg.evaluate((element, point) => {
          element.style.setProperty("--lumen-x", `${point[0]}px`);
          element.style.setProperty("--lumen-y", `${point[1]}px`);
        }, [x, y]);
        await expect.poll(() => svg.locator("foreignObject div").first().evaluate(element =>
          getComputedStyle(element).getPropertyValue("--_lumen-page-x").trim()
        )).toBe(`${x}px`);
        for (const name of ["--lumen-x", "--lumen-y", "--_lumen-page-x", "--_lumen-page-y"]) {
          expect(await svg.locator("mask").first().evaluate((element, name) =>
            getComputedStyle(element).getPropertyValue(name).trim(), name
          )).toBe("0px");
        }
      }
      for (const mask of await svg.locator("mask").all()) {
        await expect(mask).toHaveCSS("mask-type", "alpha");
      }
      await svg.evaluate(element => {
        element.style.background = "#000";
        for (const [name, value] of Object.entries({
          "text-fill": "#fff", "text-outline": "transparent",
          "icon-fill": "#fff", "icon-outline": "transparent",
          "glow-color": "#fff", blur: "32px", saturation: "1.6",
        })) element.style.setProperty(`--lumen-${name}`, value);
      });
      const image = PNG.sync.read(await svg.screenshot({ scale: "css" }));
      const brightness = (x, y) => {
        const index = (y * image.width + x) * 4;
        return image.data[index] + image.data[index + 1] + image.data[index + 2];
      };
      for (const x of [4, image.width - 5]) for (const y of [4, image.height - 5]) {
        expect(brightness(x, y), `${adapter} ${selector}: the mask must hide the corners`).toBeLessThan(30);
      }
      let lit = 0;
      for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
        if (brightness(x, y) > 300) lit++;
      }
      const coverage = lit / (image.width * image.height);
      expect(coverage, "The glyph or icon must remain visible").toBeGreaterThan(0.03);
      expect(coverage, "The light must not become a solid rectangle").toBeLessThan(0.65);
    }
    expect(errors).toEqual([]);
    // The SVG fix must not disable blur on ordinary glass surfaces.
    await expect(page.locator(".main-card")).toHaveCSS("backdrop-filter", /blur\(32px\)/);
  });
}
