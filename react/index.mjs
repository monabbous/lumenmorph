"use client";

import { createElement as h, useEffect, useId, useRef } from "react";

/** Optional SVG text with separate illuminated fill and outline masks. */
export function LumenText({ children, width = 640, height = 120, fontSize = 80, strokeWidth = 2, textProps = {}, className = "", style, ...props }) {
  const id = `lumen-${useId().replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const svg = useRef(null);
  useEffect(() => {
    const element = svg.current;
    const view = element.ownerDocument.defaultView;
    let frame = 0;
    function update() {
      frame = 0;
      const matrix = element.getScreenCTM();
      if (!matrix || Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) < 1e-10) return;
      const inverse = matrix.inverse();
      for (const key of ["a", "b", "c", "d", "e", "f"]) {
        element.style.setProperty(`--_lumen-svg-${key}`, `${inverse[key]}${key === "e" || key === "f" ? "px" : ""}`);
      }
      element.style.setProperty("--_lumen-svg-radius-scale", String(Math.hypot(inverse.a, inverse.b)));
    }
    function schedule() { if (!frame) frame = view.requestAnimationFrame(update); }
    update();
    const observer = new view.ResizeObserver(schedule);
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    view.addEventListener("resize", schedule);
    view.addEventListener("scroll", schedule, true);
    return () => {
      observer.disconnect();
      view.removeEventListener("resize", schedule);
      view.removeEventListener("scroll", schedule, true);
      if (frame) view.cancelAnimationFrame(frame);
    };
  }, []);
  const label = props["aria-label"] ?? children;
  const text = (outline) => h("text", {
    x: "50%", y: "50%", dominantBaseline: "central", textAnchor: "middle",
    fontSize, fontWeight: 700, ...textProps,
    // Stroke exposes overlapping font contours (visible seams in Cascadia Mono).
    // Both masks start with the filled silhouette; the outline uses a ring filter.
    fill: "white", stroke: "none",
    ...(outline ? { filter: `url(#${id}-ring)` } : {}),
  }, children);
  const layer = (outline) => h("foreignObject", {
    x: 0, y: 0, width, height, mask: `url(#${id}-${outline ? "outline" : "fill"})`,
  }, h("div", {
    xmlns: "http://www.w3.org/1999/xhtml",
    className: "lumenmorph",
    style: {
      width: "100%", height: "100%", borderRadius: 0,
      // Fixed backgrounds inside SVG don't share the page's viewport reliably.
      // Inherit page coordinates, then map through the SVG's inverse screen matrix.
      "--lumen-attachment": "scroll", "--lumen-space": "100% 100%",
      "--lumen-x": "calc(var(--_lumen-page-x) * var(--_lumen-svg-a, 1) + var(--_lumen-page-y) * var(--_lumen-svg-c, 0) + var(--_lumen-svg-e, 0px))",
      "--lumen-y": "calc(var(--_lumen-page-x) * var(--_lumen-svg-b, 0) + var(--_lumen-page-y) * var(--_lumen-svg-d, 1) + var(--_lumen-svg-f, 0px))",
      "--lumen-glow-size": "calc(var(--_lumen-page-size) * var(--_lumen-svg-radius-scale, 1))",
      "--lumen-bg": outline ? "var(--lumen-text-outline, #ffffff80)" : "var(--lumen-text-fill, #ffffff30)",
      "--lumen-glow-opacity": outline ? 1 : 0.5,
    },
  }));
  return h("svg", {
    xmlns: "http://www.w3.org/2000/svg", width, height, viewBox: `0 0 ${width} ${height}`,
    role: "img", "aria-label": label, ...props, ref: svg, className: `lumenmorph-svg ${className}`.trim(),
    style: {
      "--_lumen-page-x": "var(--lumen-x, 50vw)", "--_lumen-page-y": "var(--lumen-y, 35vh)",
      "--_lumen-page-size": "var(--lumen-glow-size, 460px)", ...style,
    },
  }, h("defs", null,
    h("filter", { id: `${id}-ring`, filterUnits: "userSpaceOnUse", x: 0, y: 0, width, height, colorInterpolationFilters: "sRGB" },
      h("feMorphology", { in: "SourceGraphic", operator: "dilate", radius: Math.max(0, strokeWidth) / 2, result: "expanded" }),
      h("feMorphology", { in: "SourceGraphic", operator: "erode", radius: Math.max(0, strokeWidth) / 2, result: "contracted" }),
      h("feComposite", { in: "expanded", in2: "contracted", operator: "out" }),
    ),
    h("mask", { id: `${id}-fill`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width, height }, text(false)),
    h("mask", { id: `${id}-outline`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width, height }, text(true)),
  ), h("g", { "aria-hidden": true }, layer(false), layer(true)));
}
