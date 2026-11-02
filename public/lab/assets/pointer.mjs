/** Track one page, or one surface with { local: true }. No work runs while idle. */
export function trackPointer(target = document.documentElement, options = {}) {
  const view = target.ownerDocument.defaultView;
  if (!view) throw new Error("trackPointer requires an element in a browser document.");
  const local = options.local ?? false;
  const source = local ? target : view;
  const boundary = local ? target : target.ownerDocument;
  const properties = ["--lumen-x", "--lumen-y", ...(local ? ["--lumen-attachment", "--lumen-space"] : [])];
  const previous = properties.map(name => [name, target.style.getPropertyValue(name), target.style.getPropertyPriority(name)]);
  const motion = view.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let point;
  let stopped = false;
  const enabled = () => options.reducedMotion === false || !motion.matches;

  function flush() {
    frame = 0;
    if (!point || !enabled()) return;
    let [x, y] = point;
    if (local) {
      // Read once per frame, not once per pointer event. Padding-box coordinates.
      const rect = target.getBoundingClientRect();
      x -= rect.left + target.clientLeft;
      y -= rect.top + target.clientTop;
      target.style.setProperty("--lumen-attachment", "scroll");
      target.style.setProperty("--lumen-space", "100% 100%");
    }
    target.style.setProperty("--lumen-x", `${x}px`);
    target.style.setProperty("--lumen-y", `${y}px`);
  }

  function move(event) {
    if (!enabled() || (event.pointerType === "touch" && !options.touch)) return;
    point = [event.clientX, event.clientY];
    if (!frame) frame = view.requestAnimationFrame(flush);
  }

  function restore() {
    if (frame) view.cancelAnimationFrame(frame);
    frame = 0;
    point = undefined;
    for (const [name, value, priority] of previous) {
      if (value) target.style.setProperty(name, value, priority);
      else target.style.removeProperty(name);
    }
  }

  function change() { if (!enabled()) restore(); }
  source.addEventListener("pointermove", move, { passive: true });
  boundary.addEventListener("pointerleave", restore);
  source.addEventListener("pointercancel", restore);
  view.addEventListener("blur", restore);
  motion.addEventListener("change", change);

  return function cleanup() {
    if (stopped) return;
    stopped = true;
    source.removeEventListener("pointermove", move);
    boundary.removeEventListener("pointerleave", restore);
    source.removeEventListener("pointercancel", restore);
    view.removeEventListener("blur", restore);
    motion.removeEventListener("change", change);
    restore();
  };
}
