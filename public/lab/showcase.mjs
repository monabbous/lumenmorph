import { enhanceSlideboxRange, enhanceSlideboxRangeFill } from "./assets/slidebox-range.mjs";

import { examples } from "./example-behaviors.mjs";

export function initShowcase() {
  const root = document.querySelector(".showcase");
  if (!root) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  const grid = root.querySelector(".showcase-grid");
  const cards = [...grid.children];
  for (const card of cards) examples[card.dataset.example]?.(card.querySelector(".showcase-demo"), signal);
  const ranges = [...root.querySelectorAll("input[type=range]")].flatMap(input => [enhanceSlideboxRange(input, { layers: true }), enhanceSlideboxRangeFill(input)]);

  // Preserve DOM/keyboard order; size grid row spans only when card dimensions change.
  const resize = new ResizeObserver(entries => {
    for (const { target, borderBoxSize } of entries) {
      if (target.hidden) continue;
      const height = borderBoxSize?.[0]?.blockSize ?? target.getBoundingClientRect().height;
      if (height) target.style.setProperty("--rows", Math.ceil((height + 16) / 24));
    }
    grid.dataset.masonry = "";
  });
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.toggleAttribute(entry.target === root ? "data-in-view" : "data-visible", entry.isIntersecting);
  }, { rootMargin: "160px" });
  visibility.observe(root);
  for (const card of cards) { resize.observe(card); visibility.observe(card); }
  root.dataset.enhanced = "";
  const filters = [...root.querySelectorAll("[data-filter]")];
  for (const button of filters) button.addEventListener("change", () => {
    if (!button.checked) return;
    for (const card of cards) card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
    root.querySelector("#showcase-count").textContent = `${cards.filter(card => !card.hidden).length} experiments`;
  }, { signal });

  return () => { controller.abort(); resize.disconnect(); visibility.disconnect(); for (const stop of ranges) stop(); };
}
