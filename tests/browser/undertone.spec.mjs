import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";

const css = await readFile(new URL("../../dist/css/lumenmorph.css", import.meta.url), "utf8");
const minified = await readFile(new URL("../../dist/css/lumenmorph.min.css", import.meta.url), "utf8");
const pointer = await readFile(new URL("../../js/pointer.mjs", import.meta.url), "utf8");
const custom = `
  .custom {
    --lumen-undertone: radial-gradient(circle 70px at var(--undertone-x, 30%) 75%, #20c0e080, transparent);
    --lumen-border-undertone: linear-gradient(125deg, #ff288c, transparent);
  }
`;

async function fixture(page, { styles = css, extra = "", markup = '<div id="card" class="card lumenmorph lumenmorph-border"></div>' } = {}) {
  await page.setContent(`<!doctype html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${styles}
      html { --lumen-x: 80px; --lumen-y: 60px; }
      body { margin: 0; min-height: 1800px; background: #000; }
      .card {
        box-sizing: border-box; width: 240px; height: 180px; margin: 24px;
        --lumen-bg: #000; --lumen-solid-bg: #182634;
        --lumen-blur: 0px; --lumen-radius: 0px;
        --lumen-border-width: 8px; --lumen-border-color: transparent;
        --lumen-glow-size: 100px; --lumen-glow-color: #fff;
        --lumen-border-glow-color: #fff;
      }
      ${extra}
    </style></head><body>${markup}</body></html>`);
}

function paint(locator) {
  return locator.evaluate(element => {
    // Gradients and color functions contain commas; split only between images.
    const layers = value => {
      const result = [];
      let depth = 0, start = 0;
      for (let index = 0; index < value.length; index++) {
        if (value[index] === "(") depth++;
        if (value[index] === ")") depth--;
        if (value[index] === "," && depth === 0) {
          result.push(value.slice(start, index).trim());
          start = index + 1;
        }
      }
      result.push(value.slice(start).trim());
      return result;
    };
    const read = pseudo => {
      const style = getComputedStyle(element, pseudo);
      return {
        images: layers(style.backgroundImage),
        attachment: style.backgroundAttachment,
        size: style.backgroundSize,
        position: style.backgroundPosition,
        color: style.backgroundColor,
        display: style.display,
        blur: style.backdropFilter,
      };
    };
    return { surface: read(), border: read("::before") };
  });
}

const pixels = async locator => PNG.sync.read(await locator.screenshot({ scale: "css" }));
const rgb = (image, x, y) => Array.from(image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 3));

test("unset undertones preserve the original single-light appearance", async ({ page }) => {
  await fixture(page);
  const card = page.locator("#card");
  const original = await pixels(card);
  const defaults = await paint(card);
  expect(defaults.surface.images.at(-1)).toBe("none");
  expect(defaults.border.images.at(-1)).toBe("none");

  // The pre-undertone recipe is the visual compatibility reference. Compare at
  // the same viewport position so the fixed pointer light does not move.
  await page.addStyleTag({ content: `
    #card {
      background-image: radial-gradient(circle var(--lumen-glow-size, 460px) at var(--lumen-x, 50vw) var(--lumen-y, 35vh), color-mix(in srgb, var(--lumen-glow-color, #ffaa71) calc(var(--lumen-glow-opacity, 0.3) * 100%), transparent), transparent);
      background-attachment: var(--lumen-attachment, fixed);
      background-size: var(--lumen-space, 100vw 100vh);
    }
    #card::before {
      background-image: radial-gradient(circle var(--lumen-glow-size, 460px) at var(--lumen-x, 50vw) var(--lumen-y, 35vh), color-mix(in srgb, var(--lumen-border-glow-color, var(--lumen-glow-color, #ffd4a3)) calc(var(--lumen-border-opacity, 0.9) * 100%), transparent), transparent);
      background-attachment: var(--lumen-attachment, fixed);
      background-size: var(--lumen-space, 100vw 100vh);
    }
  ` });
  expect((await pixels(card)).data.equals(original.data)).toBe(true);
});

for (const local of [false, true]) {
  test(`${local ? "local" : "viewport"} pointer tracking and custom undertones stay independent`, async ({ page }) => {
    await fixture(page, { extra: custom, markup: '<div id="card" class="card custom lumenmorph lumenmorph-border"></div>' });
    const card = page.locator("#card");
    await page.evaluate(async ({ source, local }) => {
      const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      const { trackPointer } = await import(url);
      URL.revokeObjectURL(url);
      const target = local ? document.querySelector("#card") : document.documentElement;
      window.stopUndertoneTracker = trackPointer(target, { local, reducedMotion: false });
    }, { source: pointer, local });

    const before = await paint(card);
    await page.evaluate(local => {
      const target = local ? document.querySelector("#card") : window;
      target.dispatchEvent(new PointerEvent("pointermove", { clientX: 160, clientY: 120, pointerType: "mouse" }));
    }, local);
    await expect.poll(async () => (await paint(card)).surface.images[0]).not.toBe(before.surface.images[0]);
    const moved = await paint(card);
    for (const layer of ["surface", "border"]) {
      expect(moved[layer].images[0]).not.toBe(before[layer].images[0]);
      expect(moved[layer].images[1]).toBe(before[layer].images[1]);
      expect(moved[layer].attachment).toBe(`${local ? "scroll" : "fixed"}, scroll`);
      expect(moved[layer].size.split(",").at(-1).trim()).toBe("100% 100%");
    }

    await card.evaluate(element => element.style.setProperty("--undertone-x", "85%"));
    const customMoved = await paint(card);
    expect(customMoved.surface.images[1]).not.toBe(moved.surface.images[1]);
    expect(customMoved.surface.images[0]).toBe(moved.surface.images[0]);
    expect(customMoved.border.images).toEqual(moved.border.images);

    await card.evaluate(element => element.style.setProperty("--lumen-border-undertone", "radial-gradient(circle 40px at 75% 50%, #ff9900, transparent)"));
    const edgeChanged = await paint(card);
    expect(edgeChanged.border.images[1]).not.toBe(customMoved.border.images[1]);
    expect(edgeChanged.border.images[0]).toBe(customMoved.border.images[0]);
    expect(edgeChanged.surface.images).toEqual(customMoved.surface.images);

    await page.evaluate(() => window.stopUndertoneTracker());
    const stopped = await paint(card);
    expect(stopped.surface.images[1]).toBe(edgeChanged.surface.images[1]);
    expect(stopped.border.images[1]).toBe(edgeChanged.border.images[1]);
  });
}

test("undertones render in element coordinates and the edge stays inside its mask", async ({ page }) => {
  await fixture(page, { extra: `
    #card {
      --lumen-glow-opacity: 0; --lumen-border-opacity: 0;
      --lumen-undertone: radial-gradient(circle 60px at 50% 50%, #00ff00, transparent);
      --lumen-border-undertone: radial-gradient(circle 80px at 50% 100%, #ff00ff, transparent);
    }
  ` });
  const card = page.locator("#card");
  const initial = await pixels(card);
  const center = rgb(initial, 120, 90), edge = rgb(initial, 120, 177);
  expect(center[1], "The custom surface gradient must paint at the element center").toBeGreaterThan(240);
  expect(center[0] + center[2], "The border undertone must not leak through the center").toBeLessThan(10);
  expect(edge[0], "The custom border gradient must paint at the element's bottom edge").toBeGreaterThan(230);
  expect(edge[2]).toBeGreaterThan(230);

  await card.evaluate(element => { element.style.marginLeft = "100px"; element.style.marginTop = "700px"; });
  const moved = await pixels(card);
  expect(moved.data.equals(initial.data), "Moving the card must not move its undertone within the card").toBe(true);
  await page.evaluate(() => window.scrollTo(0, 300));
  expect(await page.evaluate(() => window.scrollY)).toBe(300);
  expect((await pixels(card)).data.equals(initial.data), "Scrolling must preserve element-local undertones").toBe(true);
});

test("undertones inherit without coupling the surface and border opt-ins", async ({ page }) => {
  await fixture(page, {
    extra: `.theme { --lumen-undertone: linear-gradient(#123456, #123456); --lumen-border-undertone: linear-gradient(#fedcba, #fedcba); }`,
    markup: `<section class="theme">
      <div id="both" class="card lumenmorph lumenmorph-border"></div>
      <div id="surface" class="card lumenmorph lumenmorph-border" style="--lumen-border-undertone: none"></div>
      <div id="border" class="card lumenmorph lumenmorph-border" style="--lumen-undertone: none"></div>
    </section><div id="plain" class="card lumenmorph lumenmorph-border"></div>`,
  });
  const both = await paint(page.locator("#both"));
  const surface = await paint(page.locator("#surface"));
  const border = await paint(page.locator("#border"));
  const plain = await paint(page.locator("#plain"));
  expect(both.surface.images[1]).toContain("18, 52, 86");
  expect(both.border.images[1]).toContain("254, 220, 186");
  expect(surface.surface.images[1]).toBe(both.surface.images[1]);
  expect(surface.border.images[1]).toBe("none");
  expect(border.surface.images[1]).toBe("none");
  expect(border.border.images[1]).toBe(both.border.images[1]);
  expect(plain.surface.images[1]).toBe("none");
  expect(plain.border.images[1]).toBe("none");
});

test("minified CSS preserves custom gradient paint and coordinate spaces", async ({ page }) => {
  const results = [];
  for (const styles of [css, minified]) {
    await fixture(page, { styles, extra: custom, markup: '<div id="card" class="card custom lumenmorph lumenmorph-border"></div>' });
    results.push({ paint: await paint(page.locator("#card")), image: await pixels(page.locator("#card")) });
  }
  expect(results[1].paint).toEqual(results[0].paint);
  expect(results[1].image.data.equals(results[0].image.data)).toBe(true);
});

test("forced colors removes custom surface and border paint", async ({ page }) => {
  await fixture(page, { extra: custom, markup: '<div id="card" class="card custom lumenmorph lumenmorph-border"></div>' });
  await page.emulateMedia({ forcedColors: "active" });
  const result = await paint(page.locator("#card"));
  expect(result.surface.images).toEqual(["none"]);
  expect(result.surface.blur).toBe("none");
  expect(result.border.display).toBe("none");
});

test("reduced transparency keeps the opaque surface fallback when an undertone is set", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Chromium exposes reduced-transparency emulation through CDP");
  await fixture(page, { extra: custom, markup: '<div id="card" class="card custom lumenmorph lumenmorph-border"></div>' });
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
    const result = await paint(page.locator("#card"));
    expect(result.surface.images).toEqual(["none"]);
    expect(result.surface.color).toBe("rgb(24, 38, 52)");
    expect(result.surface.blur).toBe("none");
  } finally {
    await session.detach();
  }
});
