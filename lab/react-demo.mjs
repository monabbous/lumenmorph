import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { LumenText, LumenIcon } from "../react/index.mjs";

const header = document.querySelector("#header-demo");
const headerRoot = createRoot(header, { identifierPrefix: "lm-header-" });
let headerWidth = 0;
function renderHeader(width) {
  if (width <= 0 || Math.abs(width - headerWidth) < .5) return;
  headerWidth = width;
  const scale = width / 800;
  headerRoot.render(h(LumenText, {
    width, height: 160 * scale, fontSize: 120 * scale, strokeWidth: 1.2, "aria-hidden": true,
    textProps: { fontFamily: "inherit", letterSpacing: -2 * scale, fontWeight: 600 },
  }, "Lumenmorph"));
}
const headerSize = new ResizeObserver(entries => renderHeader(entries[0].contentRect.width));
headerSize.observe(header.closest("h1") ?? header);
window.addEventListener("pagehide", event => { if (!event.persisted) { headerSize.disconnect(); headerRoot.unmount(); } });

export function mountDemo(target, { text, ...props }) {
  const root = createRoot(target, { identifierPrefix: "lm-preview-" });
  root.render(h(LumenText, props, text));
  return () => root.unmount();
}

export function mountIconDemo(target, props) {
  const root = createRoot(target, { identifierPrefix: "lm-icon-preview-" });
  root.render(h(LumenIcon, props));
  return () => root.unmount();
}
