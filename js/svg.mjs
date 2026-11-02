/** Shared by the optional text adapters, never imported by the pointer/CSS core. */
export const svgPageStyle = {
  "--_lumen-page-x": "var(--lumen-x, 50vw)",
  "--_lumen-page-y": "var(--lumen-y, 35vh)",
  "--_lumen-page-size": "var(--lumen-glow-size, 460px)",
};

export function svgLayerStyle(outline, icon = false) {
  return {
    width: "100%", height: "100%", borderRadius: "0",
    // WebKit composites backdrop-filter outside the foreignObject's SVG mask.
    // Keep these paint layers unfiltered; a surrounding surface can supply blur.
    backdropFilter: "none", WebkitBackdropFilter: "none",
    "--lumen-attachment": "scroll", "--lumen-space": "100% 100%",
    "--lumen-x": "calc(var(--_lumen-page-x) * var(--_lumen-svg-a, 1) + var(--_lumen-page-y) * var(--_lumen-svg-c, 0) + var(--_lumen-svg-e, 0px))",
    "--lumen-y": "calc(var(--_lumen-page-x) * var(--_lumen-svg-b, 0) + var(--_lumen-page-y) * var(--_lumen-svg-d, 1) + var(--_lumen-svg-f, 0px))",
    "--lumen-glow-size": "calc(var(--_lumen-page-size) * var(--_lumen-svg-radius-scale, 1))",
    "--lumen-bg": outline
      ? (icon ? "var(--lumen-icon-outline, var(--lumen-text-outline, #ffffff80))" : "var(--lumen-text-outline, #ffffff80)")
      : (icon ? "var(--lumen-icon-fill, var(--lumen-text-fill, #ffffff30))" : "var(--lumen-text-fill, #ffffff30)"),
    "--lumen-glow-opacity": outline ? "1" : "0.5",
  };
}

export function observeSvgGeometry(element) {
  const view = element.ownerDocument.defaultView;
  const colors = view.matchMedia("(forced-colors: active)");
  function forcedColors() {
    const fallback = element.querySelector(".lumenmorph-svg-fallback");
    if (fallback) fallback.style.display = colors.matches ? "" : "none";
    for (const layer of element.querySelectorAll("foreignObject")) layer.style.display = colors.matches ? "none" : "";
  }
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
  forcedColors();
  colors.addEventListener("change", forcedColors);
  const observer = new view.ResizeObserver(schedule);
  observer.observe(element);
  if (element.parentElement) observer.observe(element.parentElement);
  view.addEventListener("resize", schedule);
  view.addEventListener("scroll", schedule, true);
  const stop = () => {
    observer.disconnect();
    colors.removeEventListener("change", forcedColors);
    view.removeEventListener("resize", schedule);
    view.removeEventListener("scroll", schedule, true);
    if (frame) view.cancelAnimationFrame(frame);
  };
  stop.refresh = update;
  return stop;
}

export function parseViewBox(value = "0 0 64 64") {
  const values = value.trim().split(/[\s,]+/).map(Number);
  if (values.length !== 4 || values.some(number => !Number.isFinite(number)) || values[2] <= 0 || values[3] <= 0) throw new TypeError("viewBox must contain four finite numbers with positive width and height.");
  return { x: values[0], y: values[1], width: values[2], height: values[3] };
}
