import { observeSvgGeometry, parseViewBox, svgPageStyle, svgMaskStyle, svgLayerStyle } from "./svg.mjs";

const namespace = "http://www.w3.org/2000/svg";
const textAttributes = {
  fontFamily: "font-family", fontWeight: "font-weight", fontStyle: "font-style",
  letterSpacing: "letter-spacing", wordSpacing: "word-spacing", textAnchor: "text-anchor",
  dominantBaseline: "dominant-baseline", x: "x", y: "y", dx: "dx", dy: "dy",
  direction: "direction", textLength: "textLength", lengthAdjust: "lengthAdjust",
};

/** Client-only adapters mount into an existing SVG: no extra wrapper or runtime dependency. */
export function mountLumenText(svg, initial = {}) {
  return mountGraphic(svg, initial, false);
}

export function mountLumenIcon(svg, initial) {
  return mountGraphic(svg, initial, true);
}

function mountGraphic(svg, initial, icon) {
  const document = svg.ownerDocument;
  const id = `lumen-dom-${[...document.defaultView.crypto.getRandomValues(new Uint32Array(2))].map(value => value.toString(16).padStart(8, "0")).join("")}`;
  const make = (tag, attrs = {}, children = []) => {
    const node = document.createElementNS(namespace, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    node.append(...children);
    return node;
  };
  const tag = icon ? "g" : "text";
  const texts = [make(tag), make(tag, { filter: `url(#${id}-ring)` })];
  const fallback = make(tag, { class: "lumenmorph-svg-fallback", "aria-hidden": "true", style: "display:none" });
  const dilate = make("feMorphology", { in: "SourceGraphic", operator: "dilate", result: "expanded" });
  const erode = make("feMorphology", { in: "SourceGraphic", operator: "erode", result: "contracted" });
  const filter = make("filter", { id: `${id}-ring`, filterUnits: "userSpaceOnUse", x: 0, y: 0, "color-interpolation-filters": "sRGB" }, [dilate, erode, make("feComposite", { in: "expanded", in2: "contracted", operator: "out" })]);
  const masks = texts.map((text, index) => make("mask", { id: `${id}-${index}`, maskUnits: "userSpaceOnUse", x: 0, y: 0, style: "mask-type:alpha" }, [text]));
  const layers = masks.map((mask, index) => {
    const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    div.setAttribute("class", "lumenmorph");
    for (const [key, value] of Object.entries(svgLayerStyle(index === 1, icon))) {
      const property = key.startsWith("--") ? key : key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      div.style.setProperty(property, value);
    }
    return make("foreignObject", { x: 0, y: 0, mask: `url(#${mask.id})` }, [div]);
  });
  svg.classList.add("lumenmorph-svg");
  const defs = make("defs", {}, [filter, ...masks]);
  for (const [name, value] of Object.entries(svgMaskStyle)) defs.style.setProperty(name, value);
  svg.replaceChildren(defs, make("g", { "aria-hidden": "true" }, layers), fallback);
  let previousKeys = [];
  let options = {};
  let geometry;
  function update(next) {
    options = { ...options, ...next };
    const { text = "", width = icon ? 128 : 640, height = icon ? 128 : 120, fontSize = 80, strokeWidth = 2, textProps = {}, label = icon ? "" : text } = options;
    const bounds = icon ? parseViewBox(options.viewBox) : { x: 0, y: 0, width, height };
    for (const [name, value] of Object.entries({ width, height, fontSize })) {
      if (!Number.isFinite(value) || value <= 0) throw new TypeError(`${name} must be a positive finite number.`);
    }
    if (!Number.isFinite(strokeWidth) || strokeWidth < 0) throw new TypeError("strokeWidth must be a non-negative finite number.");
    for (const [key, value] of Object.entries(svgPageStyle)) svg.style.setProperty(key, value);
    for (const [key, value] of Object.entries({ width, height, viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`, role: "img", "aria-label": label })) svg.setAttribute(key, String(value));
    if (icon && !label) svg.setAttribute("aria-hidden", "true");
    else if (icon) svg.removeAttribute("aria-hidden");
    for (const element of [filter, ...masks, ...layers]) {
      for (const [key, value] of Object.entries(bounds)) element.setAttribute(key, String(value));
    }
    for (const textNode of [...texts, fallback]) {
      for (const key of previousKeys) textNode.removeAttribute(key);
      // Unlike central, middle doesn't shift Latin fallback glyphs down using
      // an earlier Arabic font's full em-box metrics in Firefox.
      for (const [key, value] of Object.entries({ x: "50%", y: "50%", "dominant-baseline": "middle", "text-anchor": "middle", "font-size": fontSize, "font-weight": 700, fill: "white", stroke: "none" })) textNode.setAttribute(key, String(value));
      for (const [key, value] of Object.entries(textProps)) {
        if (textAttributes[key] && (typeof value === "string" || typeof value === "number")) textNode.setAttribute(textAttributes[key], String(value));
      }
      if (icon) {
        const paths = typeof options.paths === "string" ? [options.paths] : options.paths;
        if (!Array.isArray(paths) || paths.some(path => typeof path !== "string")) throw new TypeError("paths must be an SVG path string or array of path strings.");
        textNode.replaceChildren(...paths.map(d => make("path", { d })));
      } else textNode.textContent = text;
      if (textNode === fallback) textNode.setAttribute("fill", "CanvasText");
    }
    previousKeys = Object.keys(textProps).map(key => textAttributes[key]).filter(Boolean);
    dilate.setAttribute("radius", String(strokeWidth / 2));
    erode.setAttribute("radius", String(strokeWidth / 2));
    geometry?.refresh();
  }
  update(initial);
  geometry = observeSvgGeometry(svg);
  return { update, destroy: geometry };
}
