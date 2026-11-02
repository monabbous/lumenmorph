import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("minified CSS preserves surfaces, text, motion, and accessibility fallbacks", async ({ page }) => {
  const styles = await Promise.all(["", ".min"].map(async suffix => {
    const files = await Promise.all(["lumenmorph", "motion"].map(name => readFile(new URL(`../../dist/css/${name}${suffix}.css`, import.meta.url), "utf8")));
    return files.join("\n");
  }));
  expect(styles[1].length).toBeLessThan(styles[0].length);
  for (const media of [{ reducedMotion: "no-preference", forcedColors: "none" }, { reducedMotion: "reduce", forcedColors: "none" }, { reducedMotion: "no-preference", forcedColors: "active" }]) {
    await page.emulateMedia(media);
    const results = [];
    for (const css of styles) {
      await page.setContent(`<html class="lumenmorph-motion"><head><style>${css}</style></head><body><article class="lumenmorph lumenmorph-border" style="padding: 32px"><h1 class="lumenmorph-text">Glass &amp; light</h1></article></body></html>`);
      results.push(await page.evaluate(() => {
        const properties = ["background-color", "background-image", "background-clip", "border-radius", "backdrop-filter", "-webkit-backdrop-filter", "mask-image", "mask-composite", "-webkit-text-fill-color", "-webkit-text-stroke-width", "transition-property", "transition-duration", "color"];
        return [["article", null], ["article", "::before"], ["h1", null], ["html", null]].map(([selector, pseudo]) => {
          const style = getComputedStyle(document.querySelector(selector), pseudo);
          return Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]));
        });
      }));
    }
    expect(results[1]).toEqual(results[0]);
  }
});
