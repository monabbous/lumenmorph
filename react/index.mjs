"use client";

// react/src/index.tsx
import { useEffect, useId, useRef } from "react";
import { observeSvgGeometry, parseViewBox, svgPageStyle, svgMaskStyle, svgLayerStyle } from "../js/svg.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
function LumenText({ children, width = 640, height = 120, fontSize = 80, strokeWidth = 2, textProps = {}, className = "", style, ...props }) {
  const id = `lumen-${useId().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const svg = useRef(null);
  useEffect(() => svg.current ? observeSvgGeometry(svg.current) : void 0, [width, height]);
  const text = (outline = false, fallback = false) => /* @__PURE__ */ jsx(
    "text",
    {
      x: "50%",
      y: "50%",
      dominantBaseline: "central",
      textAnchor: "middle",
      fontSize,
      fontWeight: 700,
      ...textProps,
      fill: fallback ? "CanvasText" : "white",
      stroke: "none",
      filter: outline ? `url(#${id}-ring)` : void 0,
      className: fallback ? "lumenmorph-svg-fallback" : void 0,
      style: fallback ? { display: "none" } : textProps.style,
      "aria-hidden": fallback || void 0,
      children
    }
  );
  const layer = (outline) => /* @__PURE__ */ jsx("foreignObject", { x: 0, y: 0, width, height, mask: `url(#${id}-${outline ? "outline" : "fill"})`, children: /* @__PURE__ */ jsx("div", { className: "lumenmorph", style: svgLayerStyle(outline) }) });
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": props["aria-label"] ?? children,
      ...props,
      ref: svg,
      className: `lumenmorph-svg ${className}`.trim(),
      style: { ...svgPageStyle, ...style },
      children: [
        /* @__PURE__ */ jsxs("defs", { style: svgMaskStyle, children: [
          /* @__PURE__ */ jsxs("filter", { id: `${id}-ring`, filterUnits: "userSpaceOnUse", x: 0, y: 0, width, height, colorInterpolationFilters: "sRGB", children: [
            /* @__PURE__ */ jsx("feMorphology", { in: "SourceGraphic", operator: "dilate", radius: Math.max(0, strokeWidth) / 2, result: "expanded" }),
            /* @__PURE__ */ jsx("feMorphology", { in: "SourceGraphic", operator: "erode", radius: Math.max(0, strokeWidth) / 2, result: "contracted" }),
            /* @__PURE__ */ jsx("feComposite", { in: "expanded", in2: "contracted", operator: "out" })
          ] }),
          /* @__PURE__ */ jsx("mask", { id: `${id}-fill`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width, height, style: { maskType: "alpha" }, children: text() }),
          /* @__PURE__ */ jsx("mask", { id: `${id}-outline`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width, height, style: { maskType: "alpha" }, children: text(true) })
        ] }),
        /* @__PURE__ */ jsxs("g", { "aria-hidden": "true", children: [
          layer(false),
          layer(true)
        ] }),
        text(false, true)
      ]
    }
  );
}
function LumenIcon({ paths, width = 128, height = 128, viewBox = "0 0 64 64", strokeWidth = 2, label, className = "", style, ...props }) {
  const id = `lumen-icon-${useId().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const svg = useRef(null);
  const bounds = parseViewBox(viewBox);
  const accessibleLabel = label ?? props["aria-label"];
  useEffect(() => svg.current ? observeSvgGeometry(svg.current) : void 0, [width, height, viewBox]);
  const data = typeof paths === "string" ? [paths] : paths;
  if (!Array.isArray(data) || data.some((path) => typeof path !== "string")) throw new TypeError("paths must be an SVG path string or array of path strings.");
  const shape = (extra = {}) => /* @__PURE__ */ jsx("g", { fill: "white", stroke: "none", ...extra, children: data.map((d, key) => /* @__PURE__ */ jsx("path", { d }, key)) });
  const layer = (outline) => /* @__PURE__ */ jsx("foreignObject", { ...bounds, mask: `url(#${id}-${outline ? "outline" : "fill"})`, children: /* @__PURE__ */ jsx("div", { className: "lumenmorph", style: svgLayerStyle(outline, true) }) });
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height,
      viewBox,
      role: "img",
      "aria-label": accessibleLabel,
      "aria-hidden": !accessibleLabel || void 0,
      ...props,
      ref: svg,
      className: `lumenmorph-svg ${className}`.trim(),
      style: { ...svgPageStyle, ...style },
      children: [
        /* @__PURE__ */ jsxs("defs", { style: svgMaskStyle, children: [
          /* @__PURE__ */ jsxs("filter", { id: `${id}-ring`, filterUnits: "userSpaceOnUse", ...bounds, colorInterpolationFilters: "sRGB", children: [
            /* @__PURE__ */ jsx("feMorphology", { in: "SourceGraphic", operator: "dilate", radius: Math.max(0, strokeWidth) / 2, result: "expanded" }),
            /* @__PURE__ */ jsx("feMorphology", { in: "SourceGraphic", operator: "erode", radius: Math.max(0, strokeWidth) / 2, result: "contracted" }),
            /* @__PURE__ */ jsx("feComposite", { in: "expanded", in2: "contracted", operator: "out" })
          ] }),
          /* @__PURE__ */ jsx("mask", { id: `${id}-fill`, maskUnits: "userSpaceOnUse", ...bounds, style: { maskType: "alpha" }, children: shape() }),
          /* @__PURE__ */ jsx("mask", { id: `${id}-outline`, maskUnits: "userSpaceOnUse", ...bounds, style: { maskType: "alpha" }, children: shape({ filter: `url(#${id}-ring)` }) })
        ] }),
        /* @__PURE__ */ jsxs("g", { "aria-hidden": "true", children: [
          layer(false),
          layer(true)
        ] }),
        shape({ className: "lumenmorph-svg-fallback", fill: "CanvasText", "aria-hidden": true, style: { display: "none" } })
      ]
    }
  );
}
export {
  LumenIcon,
  LumenText
};
